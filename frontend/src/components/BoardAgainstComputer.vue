<script setup lang="ts">
import { ref } from 'vue';
import { TheChessboard as Chessboard, type BoardApi, type PieceColor } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

import { Engine } from '../engine.ts';
import { EngineDifficultyLevel } from '@/constants/engineDifficultyLevel';
import { swapMap } from '@/constants/swapMaps.ts';
/* ToDo: 
         -Session storage for persisting data.
         -Handle checkmate and draw (and download png when finished)
         -Start new game button
*/

const isSwapAllowed = ref(false);
let startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1s';

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

  engine = new Engine(boardApi, engineColor, props.difficulty, () => {isSwapAllowed.value = true});
}

function getMoves() {
  const history = boardAPI?.getHistory(true);

  const moves = history?.map((move) => {
    if (typeof move === 'object') {
      return move.lan;
    } else {
      return move;
    }
  });

  return moves
}

function handleMove() {
  const moves = getMoves();

  if (isSwapAllowed.value) {
    isSwapAllowed.value = false
  }

  if (moves) {
    // ToDo: Needs to send the FEN too
    engine?.sendPosition(moves.join(' '), startingPosition);
  }
}

function handleSwap() {
  if (boardAPI) {
    isSwapAllowed.value = false
    let newPosition = swapMap[boardAPI.getFen()]

    if (newPosition) {
      boardAPI.setPosition(newPosition)
      startingPosition = newPosition;
    } else {
      console.log('Error happened when handling SWAP!')
    }

    const moves = getMoves();
    if (moves) {
      engine?.sendPosition(moves.join(' '), startingPosition);
    }
  }
}

</script>

<template>
  <Chessboard
    @board-created="handleBoardCreated"
    @move="handleMove"
    :player-color="props.playerColor"
  />
  
  <button 
    @click="handleSwap"
    type="button" 
    name="SWAP" 
    :disabled="!isSwapAllowed"
  >
    SWAP
  </button>
  

</template>