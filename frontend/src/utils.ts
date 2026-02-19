import { swapMap, undoSwapMap } from './constants/swapMaps';

/**
 * 
 * @param fen The FEN (Forsyth-Edwards Notation) description after
 * white's first move.
 * @returns a FEN description after the SWAP is made.
 */
export function swapWhiteFirstMove(fen: string): string {
    const swappedPosition = swapMap[fen];
    
    if (!swappedPosition) {
        throw new Error(`Cannot swap: Invalid or non-first-move FEN (${fen})`);
    }
    
    return swappedPosition;
}

/**
 * 
 * @param fen The FEN (Forsyth-Edwards Notation) description after
 * black's swap move.
 * @returns a FEN description before the SWAP was made.
 */
export function undoSwapMove(fen: string): string {
    const positionBeforeSwap =  undoSwapMap[fen]

    if (!positionBeforeSwap) {
        throw new Error(`Cannot undo swap: Invalid or non-swap-move FEN (${fen})`);
    }

    return positionBeforeSwap
}