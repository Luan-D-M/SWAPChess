import type { Move } from "vue3-chessboard"

export type EvaluatedFirstMove = {
    move: Move,
    evaluation: number,
    fen: string
}