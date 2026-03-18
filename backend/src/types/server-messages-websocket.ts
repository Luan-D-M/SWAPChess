import { TraditionalChessMove } from "./game.js";

// After a player successfully entered a room
export interface RoomJoinedMessage {
    type: 'ROOM_JOINED';
    payload: {
        challengeId: string;
    };
}

export interface GameStartedMessage {
    type: 'GAME_STARTED';
    payload: {
        gameId: string;
        whitePlayerId: string;
        blackPlayerId: string;
        fen: string;
        timeControl: {
            minutes: number;
            increment: number;
        };
    };
}

export interface MoveProcessedMessage {
    type: 'MOVE_PROCESSED';
    payload: {
        gameId: string;
        fen: string;
        lastMove: TraditionalChessMove | 'swap'
        turn: 'white' | 'black';
        timeControl: {
            whiteTimeRemaining: number,
            blackTimeRemaining: number,
            increment: number
        }
    };
}

export interface GameOverMessage {
    type: 'GAME_OVER';
    payload: {
        gameId: string;
        reason: 'checkmate' | 'draw' | 'resignation' | 'timeout' | 'draw-by-agreement';
        winnerId: string | null; 
    };
}

export interface DrawOfferedMessage {
    type: 'DRAW_OFFERED';
    payload: {
        gameId: string;
    };
}
export interface OpponentDisconnectedMessage {
    type: 'OPPONENT_DISCONNECTED';
    payload: {
        gameId: string;
        message: string;
    };
}

export interface ErrorMessage {
    type: 'ERROR';
    payload: {
        code: string;
        message: string;
    };
}

export type ServerMessage = 
    | RoomJoinedMessage
    | GameStartedMessage 
    | MoveProcessedMessage 
    | GameOverMessage
    | OpponentDisconnectedMessage
    | ErrorMessage;