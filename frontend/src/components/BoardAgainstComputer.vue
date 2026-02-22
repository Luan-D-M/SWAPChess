<script setup lang="ts">
import { TheChessboard as Chessboard, type BoardApi, type PieceColor } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';
import { Engine } from '../engine.ts';
import { EngineDifficultyLevel } from '@/constants/engineDifficultyLevel';

/* ToDo: 
         -Session storage for persisting data.
         -Handle checkmate and draw (and download png when finished)
         -Start new game button
*/

const props = defineProps<{
  difficulty: EngineDifficultyLevel,
  playerColor: PieceColor,
}>();

let boardAPI: BoardApi | undefined;
let engine: Engine | undefined;

function handleBoardCreated(boardApi: BoardApi) {
  boardAPI = boardApi;

  const engineColor = props.playerColor === 'white' ? 'black' : 'white'

  if (engineColor === 'white') {
    boardAPI.toggleOrientation()
  }

  engine = new Engine(boardApi, engineColor, props.difficulty);
}

function handleMove() {
  const history = boardAPI?.getHistory(true);

  const moves = history?.map((move) => {
    if (typeof move === 'object') {
      return move.lan;
    } else {
      return move;
    }
  });

  if (moves) {
    engine?.sendPosition(moves.join(' '));
  }
}
</script>

<template>
  <Chessboard
    @board-created="handleBoardCreated"
    @move="handleMove"
    :player-color="props.playerColor"
  />
</template>