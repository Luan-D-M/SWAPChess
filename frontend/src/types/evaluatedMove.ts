import type { Move } from "vue3-chessboard"

export type EvaluatedMove = {
    move: Move,
    evaluation: number
}