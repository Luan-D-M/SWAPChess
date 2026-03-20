import { TraditionalChessMove } from "./game.js";

export type ClientMessage = 
    | MonitorChallengeMessage 
    | AcceptChallengeMessage 
    | MakeMoveMessage 
    | DrawOfferMessage
    | AcceptDrawOfferMessage
    | ResignMessage
    | RematchOfferMessage
    | AcceptRematchOfferMessage
    | RejoinGameMessage;

// Host after creating a challenge
export interface MonitorChallengeMessage {
    type: 'MONITOR_CHALLENGE',
    payload: {
        challengeId: string,
    }
}

// Player to accept an challenge offer
export interface AcceptChallengeMessage {
    type: 'ACCEPT_CHALLENGE',
    payload: {
        challengeId: string,
    }
}

export interface MakeMoveMessage {
    type: 'MAKE_MOVE',
    payload: {
        gameId: string,
        playerId: string,
        move: TraditionalChessMove | 'swap',
    }
}

export interface DrawOfferMessage {
    type: 'DRAW_OFFER',
    payload: {
        gameId: string,
        playerId: string,
    },
}

export interface AcceptDrawOfferMessage {
    type: 'ACCEPT_DRAW_OFFER',
    payload: {
        gameId: string,
        playerId: string,
    }
}

export interface ResignMessage {
    type: 'RESIGN',
    payload: {
        gameId: string,
        playerId: string,
    }
}

export interface RematchOfferMessage {
    type: 'REMATCH_OFFER',
    payload: {
        gameId: string,
        playerId: string,
    }
}

export interface AcceptRematchOfferMessage {
    type: 'ACCEPT_REMATCH_OFFER',
    payload: {
        gameId: string,
        playerId: string,
    }
}

export interface RejoinGameMessage {
    type: 'REJOIN_GAME',
    payload: {
        gameId: string,
        playerId: string,
    }
}