<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TheChessboard as Chessboard, type BoardApi } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

import {swapWhiteFirstMove, undoSwapMove} from '../utils';

let boardApi: BoardApi | undefined;

const swapHappened = ref(false)

onMounted(() => {
  swapHappened.value = sessionStorage.getItem('swapHappened') === 'true'
});

function handleBoardCreated(api: BoardApi) {
  boardApi = api;
  const currentPosition = sessionStorage.getItem('currentPosition')
  if (currentPosition) {
    boardApi.loadPgn(currentPosition);

    if (boardApi.getTurnColor() === 'black') {
      boardApi.toggleOrientation()
    }

  }
}

function handleReset() {
  const isSure = window.confirm(
    "Are you sure you want to reset the game? This action can't be undone!"
  );
  if (isSure && boardApi) {
    boardApi.resetBoard()
    sessionStorage.setItem('currentPosition', boardApi.getPgn())
  }
}

function handleMove() {
  if (boardApi){
    boardApi.toggleOrientation()
    sessionStorage.setItem('currentPosition', boardApi.getPgn())
  }
}

/**
 * Undoes the last move and flips the board orientation.
 * Safely checks if the game has started (ply > 0) to avoid errors.
 */
function undoLastMove() {
  /* Example: 1.e4 e5 2.Nf3 -> ply number is 3. */

  if (boardApi && boardApi.getCurrentPlyNumber() !== 0) {
    if (boardApi.getCurrentPlyNumber() === 1) {
      boardApi.resetBoard()
      sessionStorage.setItem('currentPosition', boardApi.getPgn())

      return

    } else if (swapHappened.value && boardApi.getCurrentPlyNumber() === 2) {
      const positionBeforeSwap = undoSwapMove(boardApi.getFen())
      boardApi.setPosition(positionBeforeSwap)

      swapHappened.value = false
      sessionStorage.setItem('swapHappened', 'false')
    }
    else {
      boardApi.undoLastMove()
    }

    sessionStorage.setItem('currentPosition', boardApi.getPgn())
    boardApi.toggleOrientation()
  }
}

function swap() {
  if (boardApi) {
    const swappedPosition = swapWhiteFirstMove(boardApi.getFen())
    boardApi.setPosition(swappedPosition)
    boardApi.toggleOrientation()
    
    swapHappened.value = true
    sessionStorage.setItem('swapHappened', 'true')
    sessionStorage.setItem('currentPosition', boardApi.getPgn())
  }
}



</script>

<template>
  <main>
    <Chessboard 
      @board-created="(api) => handleBoardCreated(api)" 
      @move="handleMove()"
    />
    <button @click="handleReset()" type="button" name="reset game">
      Reset
    </button>

    <!-- ToDo: Style for Undo and Swap Buttons. -->
    <button @click="undoLastMove()" type="button" name="Undo move">
      Undo move 
    </button>
    <!-- ToDo: Enable SWAP Button only when SWAP is possible-->
    <button @click="swap()" type="button" name="SWAP">
      SWAP 
    </button>

  </main>
</template>
