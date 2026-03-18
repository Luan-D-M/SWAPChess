import { TraditionalChessMove } from "./game.js";

// ToDo: organize the order? Some should be broadcasted, some shouldnt.

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

export interface RematchOfferedMessage {
    type: 'REMATCH_OFFERED';
    payload: {
        gameId: string;
    };
}

export interface RematchAcceptedMessage {
    type: 'REMATCH_ACCEPTED';
    payload: {
        oldGameId: string;
        newGameId: string; // A new Game ID for the rematch must be generated
    };
}

// Used when a player rejoins in the game 
export interface SyncGameMessage {   
    type: 'SYNC_GAME';
    payload: {
        gameId: string;
        fen: string; 
        turn: 'white' | 'black';
        whitePlayerId: string;
        blackPlayerId: string;
        whiteTimeRemaining: number;
        blackTimeRemaining: number;
        pendingDrawOfferFrom?: string | null;
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
    | DrawOfferedMessage
    | RematchOfferedMessage
    | RematchAcceptedMessage
    | SyncGameMessage
    | ErrorMessage;