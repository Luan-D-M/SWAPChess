import { Chess, Move } from 'chess.js'

import { IGameRepository } from './interfaces/IGameRepository.js';
import { Game, TraditionalChessMove } from './types/game.js';
import { checkSwapAvailability, getFenAfterSwap } from './swap-logic.js';

// ToDo: implement draw when player1 clocks zeroed but opponent has insufficient material.

export class ChessHandler {
    constructor(private readonly gameRepository: IGameRepository) { }

    public async makeMove(gameId: string, move: TraditionalChessMove | 'swap', playerId: string) {
        
        const game = await this.gameRepository.getById(gameId)
        // Validations
        if (!game) throw new Error(`Game not found. GameId: ${gameId}`);
        if (game.gameEnded) throw new Error("Game is already over");

        const expectedPlayerId = (
            game.turn === 'white' ?
            game.whitePlayerId :
            game.blackPlayerId
        )
        if (playerId !== expectedPlayerId) {  
            throw new Error(
                `Turn violation: Expected player ${expectedPlayerId},
                but received move from ${playerId}.`
            );
        }

        const chessboard = new Chess()
        chessboard.loadPgn(game.pgn)

        // Make Move
        if (move === 'swap') {
            const swappedPosition = getFenAfterSwap(chessboard.fen())
            chessboard.load(swappedPosition)
        } else {
            try {
                chessboard.move(move as Move);
            } catch (e) {
                throw new Error(`Illegal move attempted.`);
            }
        }

        this.updateGameData(game, chessboard, playerId)

        await this.gameRepository.save(game)
    }
    
    private updateGameData(game: Game, chessboard: Chess, movingPlayerId: string) {
        
        game.fen = chessboard.fen()
        game.pgn = chessboard.pgn()
        
        this.updateClock(game, movingPlayerId)
        this.handleImplicitDrawRefusal(game, movingPlayerId)
        this.toggleGameTurn(game)
        this.updateSwapAvailability(game, chessboard)
        this.updateGameEndedStatus(game, chessboard);
    }

    private handleImplicitDrawRefusal(game: Game, movingPlayerId: string) {
        const oponnentOfferedDraw = game.pendingDrawOfferFrom !== null &&
                            game.pendingDrawOfferFrom !== movingPlayerId

        if (oponnentOfferedDraw) {
            game.pendingDrawOfferFrom = null
        }
    }

    private updateClock(game: Game, movingPlayerId: string) {
        const wastedTime = (Date.now() - game.lastMoveTimestamp)/1000

        if (movingPlayerId === game.whitePlayerId) {
            game.whiteTimeRemainingInSeconds -= wastedTime

            if (game.whiteTimeRemainingInSeconds > 0) {
                game.whiteTimeRemainingInSeconds += game.increment
            }

        } else {
            game.blackTimeRemainingInSeconds -= wastedTime

            if (game.blackTimeRemainingInSeconds > 0) {
                game.blackTimeRemainingInSeconds += game.increment
            }
        }

        game.lastMoveTimestamp = Date.now()
    }

    private toggleGameTurn(game: Game) {
        game.turn = (game.turn === 'white') ? 'black' : 'white'
    }

    private updateSwapAvailability(game: Game, chessboard: Chess) {
         game.swapAllowed = checkSwapAvailability(chessboard.fen())
    }

    private updateGameEndedStatus(game: Game, chessboard: Chess) {
        // ToDo: implement draw when player1 clocks zeroed but opponent has insufficient material.
        if (game.whiteTimeRemainingInSeconds <= 0) {
            game.gameEnded = true;
            game.endReason = 'timeout';
            game.winnerId = game.blackPlayerId;
            return;
        }
        
        if (game.blackTimeRemainingInSeconds <= 0) {
            game.gameEnded = true;
            game.endReason = 'timeout';
            game.winnerId = game.whitePlayerId;
            return;
        }

        if (chessboard.isGameOver()) {
            game.gameEnded = true;

            if (chessboard.isCheckmate()) {
                game.endReason = 'checkmate';

                /* chessboard.turn() returns the color of the player who is in checkmate
                    cause the move was done and turn has been toggled.  
                */
                game.winnerId = chessboard.turn() === 'w' ? game.blackPlayerId : game.whitePlayerId;
            } else {
                // Stalemates, insufficient material, the 50-move rule, and 3-fold repetition.
                game.endReason = 'draw'; 
                game.winnerId = null;
            }
        }
    }
}