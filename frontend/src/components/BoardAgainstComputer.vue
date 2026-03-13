<script setup lang="ts">
import {onUnmounted, ref } from 'vue';
import { TheChessboard as Chessboard, type BoardApi, type PieceColor } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

import { Engine } from '../engine.ts';
import { EngineDifficultyLevel } from '@/constants/engineDifficultyLevel';
import { swapMap } from '@/constants/swapMaps.ts';
import { downloadPgn } from '@/utils.ts';

onUnmounted(() => {
  engine?.terminate()
})

const storagePrefix = 'vs_computer_mode_'

const gameEndedInDrawn = ref(false);
const checkmatedColor = ref('');

const isSwapAllowed = ref(false);
let startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1s';

const props = defineProps<{
  difficulty: EngineDifficultyLevel,
  playerColor: PieceColor,
}>();

const emit = defineEmits<{
  (e: 'startNewGame'): void
}>();


gameEndedInDrawn.value = sessionStorage.getItem(`${storagePrefix}gameEndedInDrawn`) === 'true'
isSwapAllowed.value = sessionStorage.getItem(`${storagePrefix}isSwapAllowed`) === 'true'

const storedCheckmatedColor = sessionStorage.getItem(`${storagePrefix}checkmatedColor`)
if (storedCheckmatedColor !== null) {
  checkmatedColor.value = storedCheckmatedColor
}
const storedStartingPosition = sessionStorage.getItem(`${storagePrefix}startingPosition`)
if (storedStartingPosition !== null) {
  startingPosition = storedStartingPosition
}


let boardAPI: BoardApi | undefined;
let engine: Engine | undefined;

function handleBoardCreated(boardApi: BoardApi) {
  // Needed for 'Start New Game' option
  if (engine) {
    engine.terminate();
  }

  boardAPI = boardApi;

  const engineColor = props.playerColor === 'white' ? 'black' : 'white'

  const currentPosition = sessionStorage.getItem(`${storagePrefix}currentPosition`)
  
  if (engineColor === 'white') {
    boardAPI.toggleOrientation()
  }
  
  engine = new Engine(boardApi, 
  engineColor,
  props.difficulty,
  allowSwap,
  updateStartingPosition 
  );

  if (currentPosition !== null) {
    boardApi.loadPgn(currentPosition);

    if (boardAPI.getTurnColor() === engineColor) {
        const moves = getMoves();
        if (moves) {
          engine?.sendPosition(moves.join(' '), startingPosition);
        }
    }
  } 
}

function allowSwap() {
  isSwapAllowed.value = true

  sessionStorage.setItem(`${storagePrefix}isSwapAllowed`, 'true')
}

function updateStartingPosition(newStartingPositionFEN: string) {
  startingPosition = newStartingPositionFEN;

  sessionStorage.setItem(`${storagePrefix}startingPosition`, newStartingPositionFEN)
  sessionStorage.setItem(`${storagePrefix}currentPosition`, boardAPI!.getPgn()) 
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
  isSwapAllowed.value = false
  sessionStorage.setItem(`${storagePrefix}isSwapAllowed`, 'false')

  sessionStorage.setItem(`${storagePrefix}currentPosition`, boardAPI!.getPgn()) 

  // Returns because Engine is supposed to analyze the position only in its turn.
  if (boardAPI?.getTurnColor() === props.playerColor) {
    return;
  }

  // Only send moves to analyze if it is engine's turn.
  const moves = getMoves();
  if (moves) {
    engine?.sendPosition(moves.join(' '), startingPosition);
  }
}

function handleSwap() {
  if (!boardAPI || !engine) {
    console.log('Error: boardAPI or engine is missing during SWAP!');
    return;
  }
  
  isSwapAllowed.value = false
  sessionStorage.setItem(`${storagePrefix}isSwapAllowed`, 'false')
  let newPosition = swapMap[boardAPI.getFen()]

  if (newPosition) {
    startingPosition = newPosition;
    sessionStorage.setItem(`${storagePrefix}startingPosition`, newPosition)
    boardAPI.setPosition(newPosition)
  } else {
    console.log('Error happened when handling SWAP!')
    return
  }

  sessionStorage.setItem(`${storagePrefix}currentPosition`, boardAPI.getPgn()) 

  engine.bestMove = null; // Otherwise, if engine wants to make the 'same' move again, it would stall.
  engine?.sendPosition('', startingPosition);

}

function handleDraw() {
  gameEndedInDrawn.value = true

  sessionStorage.setItem(`${storagePrefix}gameEndedInDrawn`, 'true')
}

function handleCheckmate(isMated: PieceColor) {
  checkmatedColor.value = isMated
  
  sessionStorage.setItem(`${storagePrefix}checkmatedColor`, isMated)
}

// It is basically a clean up
function handleNewGameStart() {
  sessionStorage.removeItem(`${storagePrefix}gameEndedInDrawn`);
  sessionStorage.removeItem(`${storagePrefix}checkmatedColor`);
  sessionStorage.removeItem(`${storagePrefix}isSwapAllowed`);
  sessionStorage.removeItem(`${storagePrefix}startingPosition`);
  sessionStorage.removeItem(`${storagePrefix}currentPosition`);

  emit('startNewGame');
}
</script>

<template>
  <div class="row">
    <h2 v-if="checkmatedColor!==''"> Checkmate! {{ checkmatedColor==='white' ? 'Black' : 'White'  }} wins!</h2>
    <h2 v-if="gameEndedInDrawn"> Game ended in a draw! </h2>

    <button
      v-if="checkmatedColor!=='' || gameEndedInDrawn"
      @click="downloadPgn(boardAPI!.getPgn())"
    >
      Download PNG!
    </button>
  </div>

  <Chessboard
    @board-created="handleBoardCreated"
    @move="handleMove"
    @draw="handleDraw"
    @checkmate="handleCheckmate"
    :player-color="props.playerColor"
  />
  
  <div class="row">
    <button
      type="button" 
      name="Start new game" 
      @click="handleNewGameStart"
    >
      Start New Game
    </button> 

    <button 
      @click="handleSwap"
      type="button" 
      name="SWAP" 
      :disabled="!isSwapAllowed"
    >
      SWAP
    </button>

  </div>
  

</template>


<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

</style>


