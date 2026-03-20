import { swapMap } from "./constants/swapMaps.js";

/**
 * 
 * @param fen FEN encoded chess position
 * @return true if SWAP is avaiable in the received position, false otherwise
 * 
* SWAP is available in a position
* if it's black's turn and FEN full move number === 1.
* 
* Ex: rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1
* is a position where SWAP is available.
*/
export function checkSwapAvailability(fen: string): boolean {
    const fenParts = fen.split(' ')

    return (fenParts[1] === 'b' && fenParts[5] === '1')
}

/**
 * 
 * @param fen FEN encoded chess position
 * @returns FEN representing the received position after SWAP.
 * 
 * @throws {Error} If the provided FEN is invalid or SWAP is not available.
 */
export function getFenAfterSwap(fen: string): string {
    const swappedPosition = swapMap[fen];
    
    if (!swappedPosition) {
        throw new Error(`Cannot swap: Invalid or non-first-move FEN (${fen})`);
    }
    
    return swappedPosition;
}