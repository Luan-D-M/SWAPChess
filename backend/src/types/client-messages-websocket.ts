import { TraditionalChessMove } from "./game.js";

// Host after creating a challenge
export interface MonitorChallengeMessage {
    type: 'MONITOR_CHALLENGE';
    payload: {
        challengeId: string;
        playerId: string;
    };
}

// Player to accept an challenge offer
export interface AcceptChallengeMessage {
    type: 'ACCEPT_CHALLENGE';
    payload: {
        challengeId: string;
        playerId: string;
    };
}

export interface MakeMoveMessage {
    type: 'MAKE_MOVE';
    payload: {
        gameId: string;
        playerId: string;
        move: TraditionalChessMove | 'swap';
    };
}

export interface DrawOfferMessage {
    type: 'DRAW_OFFER';
    payload: {
        gameId: string;
        playerId: string;
    };
}

export interface AcceptDrawOfferMessage {
    type: 'ACCEPT_DRAW_OFFER';
    payload: {
        gameId: string;
        playerId: string;
    };
}

export interface ResignMessage {
    type: 'RESIGN';
    payload: {
        gameId: string;
        playerId: string;
    };
}

export type ClientMessage = 
    | MonitorChallengeMessage 
    | AcceptChallengeMessage 
    | MakeMoveMessage 
    | DrawOfferMessage
    | AcceptDrawOfferMessage
    | ResignMessage;