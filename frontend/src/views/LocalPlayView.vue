<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TheChessboard as Chessboard, type BoardApi } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

import {swapWhiteFirstMove, undoSwapMove} from '../utils';

let boardApi: BoardApi | undefined;

const swapHappened = ref(false)
const currentPly = ref(0);   /* Needed for enabling SWAP button. */

onMounted(() => {
  swapHappened.value = sessionStorage.getItem('swapHappened') === 'true'
});

function handleBoardCreated(api: BoardApi) {
  boardApi = api;

  /* Reloads board from session Storage */
  const currentPosition = sessionStorage.getItem('currentPosition')
  if (currentPosition) {
    boardApi.loadPgn(currentPosition);

    currentPly.value = boardApi.getCurrentPlyNumber()

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
    sessionStorage.setItem('swapHappened', 'false')
    sessionStorage.setItem('currentPosition', boardApi.getPgn())
    currentPly.value = boardApi.getCurrentPlyNumber()
  }
}

function handleMove() {
  if (boardApi) {
    boardApi.toggleOrientation()
    sessionStorage.setItem('currentPosition', boardApi.getPgn())
    currentPly.value = boardApi.getCurrentPlyNumber()
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

    currentPly.value = boardApi.getCurrentPlyNumber()
  }
}

/**
 * Undoes the last move and flips the board orientation.
 * Safely checks if the game has started (ply > 0) to avoid errors.
 */
function undoLastMove() {
  /* Example: 1.e4 e5 2.Nf3 -> ply number is 3. */
  if (!boardApi) return;

  const ply = boardApi.getCurrentPlyNumber();
  /* Do nothing if the game hasn't started */
  if (ply === 0) return;
  
  /*
    Reset if ply=1 is needed because the swap loads a new FEN to the board,
    so the history of moves (the first white move) is erased.
  */
  if (ply === 1) {
    boardApi.resetBoard()
    sessionStorage.setItem('currentPosition', boardApi.getPgn())
    currentPly.value = ply - 1;  /* Gets updated ply after undoing the move */

    return
  }

  const isUndoingSwap = (
    swapHappened.value && ply === 2
  )
  if (isUndoingSwap) {
    const positionBeforeSwap = undoSwapMove(boardApi.getFen())
    boardApi.setPosition(positionBeforeSwap)

    swapHappened.value = false
    sessionStorage.setItem('swapHappened', 'false')

  } else {
    boardApi.undoLastMove()
  }

  boardApi.toggleOrientation()
  sessionStorage.setItem('currentPosition', boardApi.getPgn())
  currentPly.value = ply - 1  /* Gets updated ply after undoing the move */
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

    <!-- ToDo: Style for Buttons. -->
    <button @click="undoLastMove()" type="button" name="Undo move">
      Undo move 
    </button>
    <!-- ToDo: Red styling when SWAP button is enabled.-->
    <button 
      @click="swap()" 
      type="button" 
      name="SWAP" 
      :disabled="currentPly !== 1"
    >
      SWAP
    </button>

  </main>
</template>
