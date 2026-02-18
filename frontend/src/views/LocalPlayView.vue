<script setup lang="ts">
import { onMounted } from 'vue';
import { TheChessboard as Chessboard, type BoardApi } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

let boardApi: BoardApi | undefined;

onMounted(() => {
  console.log(boardApi?.getBoardPosition());
});

function flipBoard() {
  boardApi?.toggleOrientation()
}

/**
 * Undoes the last move and flips the board orientation.
 * Safely checks if the game has started (ply > 0) to avoid errors.
 */
function undoLastMove() {
  /* Example: 1.e4 e5 2.Nf3 -> ply number is 3. */
  if (boardApi && boardApi.getCurrentPlyNumber() !== 0) {
    flipBoard()
    boardApi.undoLastMove()
  }
}
</script>

<template>
  <main>
    <Chessboard 
      @board-created="(api) => (boardApi = api)" 
      @move="flipBoard()"
    />
    <!-- ToDo: Style for Undo and Swap Buttons. -->
    <button @click="undoLastMove" type="button" name="Undo move">
      Undo move 
    </button>
    <!-- ToDo: SWAP Button-->
    <button @click="" type="button" name="SWAP">
      SWAP 
    </button>

  </main>
</template>
