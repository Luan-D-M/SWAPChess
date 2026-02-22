<script setup lang="ts">
  import { ref } from 'vue';

  import type { PieceColor } from 'vue3-chessboard';
  import BoardAgainstComputer from '@/components/BoardAgainstComputer.vue';
  import { EngineDifficultyLevel } from '@/constants/engineDifficultyLevel';
  import { getRandomInteger } from '@/utils.ts';

  const gameHasStarted = ref(false)
  const playerColor = ref<PieceColor>('white')

  const difficultyOptions = Object.values(EngineDifficultyLevel);

  const selectedDifficulty = ref<EngineDifficultyLevel>(EngineDifficultyLevel.INTERMEDIATE);


  function handleGameStart() {
    gameHasStarted.value=true
    playerColor.value = (getRandomInteger(1,10) % 2) ? 'white' : 'black';
  }


</script>

<template>

  <!-- Needs to use sessionStorage  -->
  <!-- Needs to create style        -->

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
  />

</template>