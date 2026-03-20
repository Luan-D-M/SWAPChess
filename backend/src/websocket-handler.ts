import { WebSocketServer, WebSocket } from "ws";
import { ClientMessage } from "./types/client-messages-websocket.js";
import { Game, TraditionalChessMove } from "./types/game.js";
import { randomUUID } from "node:crypto";
import { IChallengeRepository } from "./interfaces/IChallengeRepository.js";
import { IGameRepository } from "./interfaces/IGameRepository.js";
import { ChessHandler } from "./chess-handler.js";
import { startingPositionInFen } from "./constants/startingPosition.js";

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
            ws.on('close', async () => await this.handleDisconnect(ws));
        });

        console.log(`WebSocket server started on port ${port}`);
    }

    private async handleMessage(ws: WebSocket, data: string) {
        try {
            const message = JSON.parse(data) as ClientMessage;
            const handler = this.handlers[message.type];
            
            if (handler) {
                await handler(ws, message.payload as any); 
            } else {
                console.warn(`No handler found for message type: ${message.type}`);
            }
        } catch (error) {
            ws.send(JSON.stringify(
            {
                type: 'ERROR', 
                payload: { code: 'INVALID_FORMAT', message: 'Message must be valid JSON' }  // ToDo: improve error message
            }));
        }
    }
    private async handleDisconnect(ws: WebSocket) {
        // ToDo: How to reconnect?
    }

    private async handleMonitor(ws: WebSocket, payload: { challengeId: string; }) {
        const challenge = await this.challengeRepository.getById(payload.challengeId)
        if (!challenge) {
            return // ToDo: Handle Challenge not found
        }

        const gameId = randomUUID()   // It's the roomId
        const hostId = randomUUID()
        const player2Id = randomUUID()

        this.rooms.set(gameId, new Set([hostId, player2Id]))
        this.playerConnections.set(hostId, ws)
        this.playerConnections.set(player2Id, null)

        challenge.hostColor

        const initialTime = challenge.timeControl.baseTimeMinutes * 60 + challenge.timeControl.baseTimeSeconds

        const game: Game = {
            id: gameId,
            fen: startingPositionInFen,
            pgn: ,  // ToDo: Add pgn to constants/startingPosition.ts. How is the initial position pgn?
            whitePlayerId: challenge.hostColor === 'white' ? hostId : player2Id,
            blackPlayerId: challenge.hostColor === 'black' ? hostId : player2Id,
            turn: 'white',
            swapAllowed: false,
            whiteTimeRemainingInSeconds: initialTime,
            blackTimeRemainingInSeconds: initialTime,
            lastMoveTimestamp: null,
            increment: challenge.timeControl.incrementSeconds,
            pendingDrawOfferFrom: null, 
            gameEnded: false,
            winnerId: null           
        }

        this.gameRepository.save(game)

        // ToDo: Sends ROOM_JOINED to host.
    }
    
    private async handleAccept(ws: WebSocket, payload: { challengeId: string }) {}
    
    private async handleMove(ws: WebSocket, payload: { gameId: string, playerId: string, move: TraditionalChessMove | 'swap' }) {}
    
    private async handleDrawOffer(ws: WebSocket, payload: { gameId: string, playerId: string }) {}
    
    private async handleDrawAccept(ws: WebSocket, payload: { gameId: string, playerId: string }) {}
    
    private async handleResign(ws: WebSocket, payload: { gameId: string, playerId: string }) {}
    
    private async handleRematchOffer(ws: WebSocket, payload: { gameId: string, playerId: string }) {}
    
    private async handleRematchAccept(ws: WebSocket, payload: { gameId: string, playerId: string }) {}
    
    private async handleRejoin(ws: WebSocket, payload: { gameId: string, playerId: string }) {}



}