<script setup lang="ts">
  import { ref } from 'vue';

  import type { PieceColor } from 'vue3-chessboard';
  import BoardAgainstComputer from '@/components/BoardAgainstComputer.vue';
  import { EngineDifficultyLevel } from '@/constants/engineDifficultyLevel';
  import { getRandomInteger } from '@/utils.ts';

  const storagePrefix = 'vs_computer_mode_'

  const gameHasStarted = ref(false)
  const playerColor = ref<PieceColor>('white')

  const difficultyOptions = Object.values(EngineDifficultyLevel);
  const selectedDifficulty = ref<EngineDifficultyLevel>(EngineDifficultyLevel.INTERMEDIATE);

  gameHasStarted.value = sessionStorage.getItem(`${storagePrefix}gameHasStarted`) === 'true'

  const storedColor = sessionStorage.getItem(`${storagePrefix}playerColor`);
  if (storedColor !== null) {
    playerColor.value = storedColor as PieceColor;
  }
  const storedDifficulty = sessionStorage.getItem(`${storagePrefix}selectedDifficulty`);
  if (storedDifficulty !== null) {
    selectedDifficulty.value = storedDifficulty as EngineDifficultyLevel;
  }

  function handleGameStart() {
    gameHasStarted.value=true
    playerColor.value = (getRandomInteger(1,10) % 2) ? 'white' : 'black';

    sessionStorage.setItem(`${storagePrefix}gameHasStarted`, 'true')
    sessionStorage.setItem(`${storagePrefix}playerColor`, playerColor.value)
    sessionStorage.setItem(`${storagePrefix}selectedDifficulty`, selectedDifficulty.value)
  }

  // It is basically a clean up
  function handleStartNewGame() {
    sessionStorage.removeItem(`${storagePrefix}gameHasStarted`);
    sessionStorage.removeItem(`${storagePrefix}playerColor`);
    sessionStorage.removeItem(`${storagePrefix}selectedDifficulty`);

    gameHasStarted.value = false;
}

</script>

<template>

  <div v-if="!gameHasStarted" class="dropdown-container" >
    <label for="difficulty">Choose difficulty level:</label>
    <select v-model="selectedDifficulty" name="difficulty" id="difficulty">
      <option 
        v-for="level in difficultyOptions" 
        :key="level" 
        :value="level"
      >
        {{ level }}
      </option>
      
    </select>
  </div>

  <button v-if="!gameHasStarted" @click="handleGameStart" type="button" name="play" >
    Play!
  </button>

  <BoardAgainstComputer 
    v-if="gameHasStarted" 
    :difficulty="selectedDifficulty"
    :playerColor="playerColor"
    @startNewGame="handleStartNewGame"
  />

</template>