import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "node:crypto";

import { ClientMessage } from "./types/client-messages-websocket.js";
import { Game, TraditionalChessMove } from "./types/game.js";
import { IChallengeRepository } from "./interfaces/IChallengeRepository.js";
import { IGameRepository } from "./interfaces/IGameRepository.js";
import { ChessHandler } from "./chess-handler.js";
import { startingPositionInFen } from "./constants/startingPosition.js";
import { WebSocketClientError } from "./utils/websocket-error.js";

/* ToDo: Use a placeholder instead of the opponent's id in messages. 
 (So, Player1 doenst know Player2 id and vice-versa),
 Otherwise they could fake their identity, as their id is the only form of authentication.
*/

type HandlerMap = {
    [K in ClientMessage['type']]: (
        ws: WebSocket, 
        payload: Extract<ClientMessage, { type: K }>['payload']
    ) => void | Promise<void>;
};

export class WebSocketHandler {
    private wss?: WebSocketServer;

    private playerConnections = new Map<string, WebSocket | null>();
    private rooms = new Map<string, Set<string>>();

    private handlers: HandlerMap = {
        'MONITOR_CHALLENGE':    (ws, payload) => this.handleMonitor(ws, payload),
        'ACCEPT_CHALLENGE':     (ws, payload) => this.handleAccept(ws, payload),
        'MAKE_MOVE':            (ws, payload) => this.handleMove(ws, payload),
        'DRAW_OFFER':           (ws, payload) => this.handleDrawOffer(ws, payload),
        'ACCEPT_DRAW_OFFER':    (ws, payload) => this.handleDrawAccept(ws, payload),
        'RESIGN':               (ws, payload) => this.handleResign(ws, payload),
        'REMATCH_OFFER':        (ws, payload) => this.handleRematchOffer(ws, payload),
        'ACCEPT_REMATCH_OFFER': (ws, payload) => this.handleRematchAccept(ws, payload),
        'REJOIN_GAME':          (ws, payload) => this.handleRejoin(ws, payload),
    };


    constructor(
        private readonly challengeRepository: IChallengeRepository,
        private readonly gameRepository: IGameRepository,
        private readonly chessHandler: ChessHandler
    ) { }

    public startServer(port: number) {
        this.wss = new WebSocketServer({ port });

        this.wss.on('connection', (ws: WebSocket) => {
            console.log('New client connected');

            ws.on('message', async (raw) => await this.handleMessage(ws, raw.toString()));
            ws.on('close', () => this.handleDisconnect(ws));
        });

        console.log(`WebSocket server started on port ${port}`);
    }

    private async handleMessage(ws: WebSocket, data: string) {
        let message: ClientMessage;

        try {
            message = JSON.parse(data) as ClientMessage;
        } catch (error) {
            this.sendErrorMessage(
                ws,
                {
                    code: 'INVALID_FORMAT',
                    message: 'Message must be valid JSON'
                }
            )
   
            return;
        }

        const handler = this.handlers[message.type];
        
        if (handler) {
            try {
                await handler(ws, message.payload as any); 
            } catch (error: any) {
                if (error instanceof WebSocketClientError) {
                    // Expected errors thrown by handlers
                    this.sendErrorMessage(ws, {
                        code: error.code,
                        message: error.message
                    });
                } else { 
                    // Unexpected error
                    this.sendErrorMessage(
                        ws,
                        {
                            code: 'INTERNAL_SERVER_ERROR',
                            message: error.message || 'An error occurred while processing the request'
                        }
                    )
                }

            }
        } else {
            this.sendErrorMessage(
                ws,
                {
                    code:   'NO_HANDLER_FOUND',
                    message: `No handler found for message type: ${message.type}`
                }
            )
        }
    }

    /**
     * Handles disconnection, e.g: player closes the game tab or refreshes the page.
     * This handling is essential, allowing player to reconnect later.
     * 
     * There's no heartbeat, so if the internet of a player goes down, for example,
     * their clock will simply run out.
     */
    private handleDisconnect(ws: WebSocket) {
        let disconnectedPlayerId: string | undefined;

        // Find which player this socket belongs to
        for (const [playerId, socket] of this.playerConnections.entries()) {
            if (socket === ws) {
                disconnectedPlayerId = playerId;
                break;
            }
        }
        if (!disconnectedPlayerId) return; // Socket wasn't registered yet

        // Nullify the connection to allow for a future rejoin
        this.playerConnections.set(disconnectedPlayerId, null);
        console.log(`Player ${disconnectedPlayerId} disconnected.`);
    }

    private async handleMonitor(ws: WebSocket, payload: { challengeId: string; }) {
        const challenge = await this.challengeRepository.getById(payload.challengeId)
        if (!challenge) {
            throw new WebSocketClientError('CHALLENGE_NOT_FOUND', 'Challenge not found')
        }
        /* 
        * The challenge, game and room share the same id.
        * This is just for simplicity.
        * The defined protocol doesn't support gameId !== challengeId right now.
        * (How would Player2 enter the correct room? He only have the challengeId!)
        */
        const gameId = payload.challengeId  
        const hostId = randomUUID()
        const player2Id = randomUUID()

        this.rooms.set(gameId, new Set([hostId, player2Id]))
        this.playerConnections.set(hostId, ws)
        this.playerConnections.set(player2Id, null)

        const initialTime = challenge.timeControl.baseTimeMinutes * 60 + challenge.timeControl.baseTimeSeconds

        const game: Game = {
            id: gameId,
            fen: startingPositionInFen,
            pgn: '',
            whitePlayerId: challenge.hostColor === 'white' ? hostId : player2Id,
            blackPlayerId: challenge.hostColor === 'black' ? hostId : player2Id,
            turn: 'white',
            swapAllowed: false,
            baseTimeInSeconds: initialTime,
            whiteTimeRemainingInSeconds: initialTime,
            blackTimeRemainingInSeconds: initialTime,
            lastMoveTimestamp: null,   // Must be set at handleAccept
            increment: challenge.timeControl.incrementSeconds,
            pendingDrawOfferFrom: null, 
            pendingRematchOfferFrom: null,
            gameEnded: false,
            winnerId: null           
        }

        await this.gameRepository.save(game)

        ws.send(
            JSON.stringify(
                {
                    type: 'ROOM_JOINED',
                    payload: {
                        gameId: game.id,
                        playerId: hostId,
                        playerColor: challenge.hostColor
                    }

                }
            )
        )
    }
    
    /**
     * Handle the challenge acceptance by Player2 (the non-host player).
     *  
     */
    private async handleAccept(ws: WebSocket, payload: { challengeId: string }) {
        const gameId = payload.challengeId;
        const roomPlayers = this.rooms.get(gameId);

        if (!roomPlayers) {
            throw new WebSocketClientError('INVALID_CHALLENGE','Challenge expired or does not exist');
        }

        /* Find the 'empty seat' (the ID mapped to null) in the room. 
           (Players id were defined at handleMonitor) */
        let player2Id: string | undefined;
        for (const id of roomPlayers) {
            if (this.playerConnections.get(id) === null) {
                player2Id = id;
                break;
            }
        }
        if (!player2Id) {
            throw new WebSocketClientError('INVALID_CHALLENGE','This challenge has already been accepted');
        }

        // Assign the active WebSocket
        this.playerConnections.set(player2Id, ws);

        // Fetch the game to get colors and time controls
        const game = await this.gameRepository.getById(gameId);
        if (!game) {
            throw new WebSocketClientError('MISSING_GAME_DATA', 'Game data is missing or corrupted');
        }

        // Tell Player 2 who they are (Private Message)
        ws.send(JSON.stringify({
            type: 'ROOM_JOINED',
            payload: {
                challengeId: payload.challengeId,
                gameId: game.id,
                playerId: player2Id,
                playerColor: game.whitePlayerId === player2Id ? 'white' : 'black'
            }
        }));

        // Update the timestamp: game has oficially started
        game.lastMoveTimestamp =  Date.now()
        await this.gameRepository.save(game)


        // Broadcast that the game is starting
        this.broadcastToRoom(game.id, JSON.stringify({
            type: 'GAME_STARTED',
            payload: {
                gameId: game.id,
                whitePlayerId: game.whitePlayerId,
                blackPlayerId: game.blackPlayerId,
                fen: game.fen,
                timeControl: {
                    seconds: game.whiteTimeRemainingInSeconds, 
                    increment: game.increment
                }
            }
        }));

        // Clean up the challenge so it can't be "accepted" again
        await this.challengeRepository.delete(payload.challengeId);
    }
    
private async handleRejoin(ws: WebSocket, payload: { gameId: string, playerId: string }) {
        const roomPlayers = this.rooms.get(payload.gameId);

        // Validate the game exists and the player actually belongs in it
        if (!roomPlayers || !roomPlayers.has(payload.playerId)) {
            throw new WebSocketClientError('INVALID_GAME_OR_PLAYER_ID', 'Invalid game or player ID');
        }

        // Prevent the player from connecting multi times e.g, multi-tabbing.
        const currentSocket = this.playerConnections.get(payload.playerId);
        if (currentSocket !== null && currentSocket?.readyState === WebSocket.OPEN) {
            throw new WebSocketClientError('ALREADY_CONNECTED','You are already connected to this game in another tab');
        }

        // Reclaim the seat
        this.playerConnections.set(payload.playerId, ws);
        console.log(`Player ${payload.playerId} rejoined game ${payload.gameId}.`);

    
        const game = await this.gameRepository.getById(payload.gameId);
        if (!game) {
            throw new WebSocketClientError('MISSING_GAME_DATA','Game data is missing or corrupted');
        }

        // Calculate the true remaining time for the active player
        let currentWhiteTime = game.whiteTimeRemainingInSeconds;
        let currentBlackTime = game.blackTimeRemainingInSeconds;
        if (game.lastMoveTimestamp) {
            const elapsedSeconds = Math.floor((Date.now() - game.lastMoveTimestamp) / 1000);
            if (game.turn === 'white') {
                currentWhiteTime = Math.max(0, currentWhiteTime - elapsedSeconds);
            } else {
                currentBlackTime = Math.max(0, currentBlackTime - elapsedSeconds);
            }
        }

        ws.send(JSON.stringify({
            type: 'SYNC_GAME', 
            payload: {
                gameId: game.id,
                fen: game.fen,
                turn: game.turn,
                whitePlayerId: game.whitePlayerId,
                blackPlayerId: game.blackPlayerId,
                whiteTimeRemainingInSeconds: currentWhiteTime,
                blackTimeRemainingInSeconds: currentBlackTime,
                increment: game.increment,
                swapAllowed: game.swapAllowed,
                pendingDrawOfferFrom: game.pendingDrawOfferFrom
            }
        }));
    }

    private async handleResign(ws: WebSocket, payload: { gameId: string, playerId: string }) {
        const game = await this.getValidatedActiveGame(payload.gameId, payload.playerId)

        // The winner is the player who DID NOT send the resign message
        const winnerId = game.whitePlayerId === payload.playerId ? game.blackPlayerId : game.whitePlayerId;

        game.gameEnded = true;
        game.winnerId = winnerId;
        game.pendingDrawOfferFrom = null;
        
        await this.gameRepository.save(game);

        this.broadcastToRoom(game.id, JSON.stringify({
            type: 'GAME_OVER',
            payload: {
                gameId: game.id,
                reason: 'resignation',
                winnerId: winnerId
            }
        }));
    }

    private async handleDrawOffer(ws: WebSocket, payload: { gameId: string, playerId: string }) {
        const game = await this.getValidatedActiveGame(payload.gameId, payload.playerId)

        // Prevent spam or self-accepting by marking who made the offer
        if (game.pendingDrawOfferFrom === payload.playerId) return; 

        game.pendingDrawOfferFrom = payload.playerId;
        await this.gameRepository.save(game);

        // Find the opponent's ID and connection
        const opponentId = game.whitePlayerId === payload.playerId ? game.blackPlayerId : game.whitePlayerId;
        const opponentWs = this.playerConnections.get(opponentId);

        // Send Targeted Message to the opponent
        if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
            opponentWs.send(JSON.stringify({
                type: 'DRAW_OFFERED',
                payload: {
                    gameId: game.id
                }
            }));
        }
    }
    
    private async handleDrawAccept(ws: WebSocket, payload: { gameId: string, playerId: string }) {
        const game = await this.getValidatedActiveGame(payload.gameId, payload.playerId);

        // Ensure there is a pending offer and it was made by the OPPONENT
        if (!game.pendingDrawOfferFrom || game.pendingDrawOfferFrom === payload.playerId) {
            throw new WebSocketClientError('MISSING_DRAW_OFFER','No valid draw offer to accept');
        }

        game.gameEnded = true;
        game.winnerId = null; // null indicates a draw
        game.pendingDrawOfferFrom = null; 
        
        await this.gameRepository.save(game);

        this.broadcastToRoom(game.id, JSON.stringify({
            type: 'GAME_OVER',
            payload: {
                gameId: game.id,
                reason: 'draw-by-agreement',
                winnerId: null
            }
        }));
    }

    private async handleRematchOffer(ws: WebSocket, payload: { gameId: string, playerId: string }) {
        const game = await this.getValidatedEndedGame(payload.gameId, payload.playerId);

        // Prevent spam or self-accepting
        if (game.pendingRematchOfferFrom === payload.playerId) return; 

        game.pendingRematchOfferFrom = payload.playerId;
        await this.gameRepository.save(game);

        const opponentId = game.whitePlayerId === payload.playerId ? game.blackPlayerId : game.whitePlayerId;
        const opponentWs = this.playerConnections.get(opponentId);

        if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
            opponentWs.send(JSON.stringify({
                type: 'REMATCH_OFFERED',
                payload: {
                    gameId: game.id
                }
            }));
        }
    }


    private async handleRematchAccept(ws: WebSocket, payload: { gameId: string, playerId: string }) {
        const game = await this.getValidatedEndedGame(payload.gameId, payload.playerId);

        // Ensure there is a pending offer from the opponent
        if (!game.pendingRematchOfferFrom || game.pendingRematchOfferFrom === payload.playerId) {
            throw new WebSocketClientError('MISSING_REMATCH_OFFER','No valid rematch offer to accept');
        }

        // Clear the offer to prevent duplicate acceptances
        game.pendingRematchOfferFrom = null;
        await this.gameRepository.save(game);

        const newGameId = randomUUID();
        
        const initialTime = game.baseTimeInSeconds; 

        const newGame: Game = {
            id: newGameId,
            fen: startingPositionInFen,
            pgn: '',
            // Swap colors for the rematch
            whitePlayerId: game.blackPlayerId, 
            blackPlayerId: game.whitePlayerId,
            turn: 'white',
            swapAllowed: false,
            whiteTimeRemainingInSeconds: initialTime,
            blackTimeRemainingInSeconds: initialTime,
            baseTimeInSeconds: initialTime,
            lastMoveTimestamp: Date.now(), 
            increment: game.increment,
            pendingDrawOfferFrom: null,
            pendingRematchOfferFrom: null, 
            gameEnded: false,
            winnerId: null           
        };

        await this.gameRepository.save(newGame);

        // Register the new room
        this.rooms.set(newGameId, new Set([newGame.whitePlayerId, newGame.blackPlayerId]));

        // Broadcast to the OLD room so both players know to transition
        this.broadcastToRoom(game.id, JSON.stringify({
            type: 'REMATCH_ACCEPTED',
            payload: {
                oldGameId: game.id,
                newGameId: newGame.id
            }
        }));

        this.rooms.delete(game.id);
    }

    private async handleMove(ws: WebSocket, payload: { gameId: string, playerId: string, move: TraditionalChessMove | 'swap' }) {
        // Basic validation
        await this.getValidatedActiveGame(payload.gameId, payload.playerId);

        // Process the move
        await this.chessHandler.makeMove(payload.gameId, payload.move, payload.playerId);

        // Fetch the freshly updated game state
        const game = await this.gameRepository.getById(payload.gameId);
        if (!game) {
            throw new WebSocketClientError('MISSING_GAME_DATA','Game data is missing after move');
        }

        // Broadcast the move
        this.broadcastToRoom(game.id, JSON.stringify({
            type: 'MOVE_PROCESSED',
            payload: {
                gameId: game.id,
                fen: game.fen,
                lastMove: payload.move,
                turn: game.turn,
                swapAllowed: game.swapAllowed,
                timeControl: {
                    whiteTimeRemainingInSeconds: game.whiteTimeRemainingInSeconds,
                    blackTimeRemainingInSeconds: game.blackTimeRemainingInSeconds,
                    increment: game.increment
                }
            }
        }));

        if (game.gameEnded) {
            const reason = game.winnerId ? 'checkmate' : 'draw';
            
            this.broadcastToRoom(game.id, JSON.stringify({
                type: 'GAME_OVER',
                payload: {
                    gameId: game.id,
                    reason: reason,
                    winnerId: game.winnerId
                }
            }));
        }
    }

    private broadcastToRoom(gameId: string, message: string) {
        const roomPlayers = this.rooms.get(gameId);
        if (!roomPlayers) { return; }

        for (const playerId of roomPlayers) {
            const playerWs = this.playerConnections.get(playerId);
            
            // Only send if the connection exists and is currently open
            if (playerWs && playerWs.readyState === WebSocket.OPEN) {
                playerWs.send(message);
            }
        }
    }

    private sendErrorMessage(ws : WebSocket, payload: {code: string, message: string}) {
        console.error(`Error message sent (${payload.code}): ${payload.message}`);

        ws.send(
            JSON.stringify(
                {
                    type: 'ERROR',
                    payload: { 
                        code: payload.code, 
                        message: payload.message 
                    }
                }
            )
        )
    }

    private async getValidatedActiveGame(gameId: string, playerId: string) {
        const game = await this.gameRepository.getById(gameId);

        if (!game) throw new WebSocketClientError('MISSING_GAME_DATA','Game not found');
        if (game.gameEnded) throw new WebSocketClientError('GAME_ENDED','Game has already ended');
        
        if (game.whitePlayerId !== playerId && game.blackPlayerId !== playerId) {
            throw new WebSocketClientError('NOT_ALLOWED','Player does not belong to this game');
        }

        return game;
    }

    private async getValidatedEndedGame(gameId: string, playerId: string) {
        const game = await this.gameRepository.getById(gameId);

        if (!game) throw new WebSocketClientError('MISSING_GAME_DATA', 'Game not found');
        if (!game.gameEnded) throw new WebSocketClientError('GAME_NOT_ENDED', 'Game is not over yet');
        
        if (game.whitePlayerId !== playerId && game.blackPlayerId !== playerId) {
            throw new WebSocketClientError('NOT_ALLOWED','Player does not belong to this game');
        }

        return game;
    }
}