export type GameEndedReasons = 'timeout'
    | 'checkmate'
    | 'draw' 


export type Game = {
    id: string,
    fen: string,  
    pgn: string, 
    whitePlayerId: string,
    blackPlayerId: string,
    turn: 'white' | 'black',
    swapAllowed: boolean,
    baseTimeInSeconds: number,
    whiteTimeRemainingInSeconds: number,
    blackTimeRemainingInSeconds: number,
    lastMoveTimestamp: number | null,             // Date.now()
    increment: number,
    pendingDrawOfferFrom: string | null,   // PlayerId that offered drawn or null
    pendingRematchOfferFrom: string | null, // PlayerId that offered rematch or null
    gameEnded: boolean,
    endReason?: GameEndedReasons,
    winnerId: string | null                // Null for a draw
}

export interface TraditionalChessMove {
    from: string,
    to: string,
    promotion?: string
}
