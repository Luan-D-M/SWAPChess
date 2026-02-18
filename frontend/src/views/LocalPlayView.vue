<script setup lang="ts">
import { onMounted } from 'vue';
import { TheChessboard, type BoardApi } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

let boardApi: BoardApi | undefined;

onMounted(() => {
  console.log(boardApi?.getBoardPosition());
});

function flipBoard() {
  boardApi?.toggleOrientation()
}

</script>

<template>
  <main>
    <TheChessboard 
    @board-created="(api) => (boardApi = api)" 
    @move="flipBoard()"
    />
    <!-- Here button for 1. Undo and 2. SWAP -->
  </main>
</template>
