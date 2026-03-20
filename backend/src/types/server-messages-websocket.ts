import { TraditionalChessMove } from "./game.js";

// Messages that are supposed to be broadcasted in the game room
export type BroadcastMessage = 
    | GameStartedMessage 
    | MoveProcessedMessage 
    | GameOverMessage
    | RematchAcceptedMessage;

// Messages that are supposed to be casted to ONE specific player.
export type TargetedMessage = 
    | RoomJoinedMessage
    | SyncGameMessage
    | DrawOfferedMessage
    | RematchOfferedMessage
    | ErrorMessage;

export type ServerMessage = BroadcastMessage | TargetedMessage;


export interface GameStartedMessage {
    type: 'GAME_STARTED',
    payload: {
        gameId: string,
        whitePlayerId: string,
        blackPlayerId: string,
        fen: string,
        timeControl: {
            minutes: number,
            increment: number,
        },
    }
}

export interface MoveProcessedMessage {
    type: 'MOVE_PROCESSED',
    payload: {
        gameId: string,
        fen: string,
        lastMove: TraditionalChessMove | 'swap'
        turn: 'white' | 'black',
        swapAllowed: boolean,
        timeControl: {
            whiteTimeRemainingInSeconds: number,
            blackTimeRemainingInSeconds: number,
            increment: number
        }
    }
}

export interface GameOverMessage {
    type: 'GAME_OVER',
    payload: {
        gameId: string,
        reason: 'checkmate' | 'draw' | 'resignation' | 'timeout' | 'draw-by-agreement',
        winnerId: string | null, 
    }
}

export interface RematchAcceptedMessage {
    type: 'REMATCH_ACCEPTED',
    payload: {
        oldGameId: string,
        newGameId: string, // A new Game ID for the rematch must be generated
    }
}


// After a player successfully entered a room
export interface RoomJoinedMessage {
    type: 'ROOM_JOINED',
    payload: {
        challengeId: string,
    }
}

// Used when a player rejoins in the game 
export interface SyncGameMessage {   
    type: 'SYNC_GAME',
    payload: {
        gameId: string,
        fen: string,
        turn: 'white' | 'black',
        whitePlayerId: string,
        blackPlayerId: string,
        whiteTimeRemainingInSeconds: number,
        blackTimeRemainingInSeconds: number,
        increment: number,
        swapAllowed: boolean,
        pendingDrawOfferFrom?: string | null
    }
}

export interface DrawOfferedMessage {
    type: 'DRAW_OFFERED',
    payload: {
        gameId: string,
    }
}

export interface RematchOfferedMessage {
    type: 'REMATCH_OFFERED',
    payload: {
        gameId: string,
    }
}

export interface ErrorMessage {
    type: 'ERROR',
    payload: {
        code: string,
        message: string,
    }
}