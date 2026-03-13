<script setup lang="ts">
import 'vue3-chessboard/style.css';
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="column">
    <div class="about">
      <h1><strong>SWAP Chess</strong></h1>
    </div>

    <p>
      SWAPChess is normal chess with one added rule: the <strong>SWAP</strong>.
    </p>
    <p>
      After White's first move, Black has two options:
    </p>

    <ul> 
        <li>Play a normal move.</li>
        <li>Swap: Black mirrors White's move, and White's piece returns to its starting square. </li>
    </ul> 

    <p>
      This rule was inspired by the swap rule in the game Hex.
    </p>

    <p>
      Check out the repository: 
      <a href="https://github.com/Luan-D-M/SWAPChess" target="_blank" rel="noopener">
        GitHub
      </a>
    </p>

    <button @click="goBack" class="back-btn">Go Back</button>
    </div>
  
</template>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 12vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.column {
    display: flex;
    flex-direction: column;
}

strong {
  font-weight: 700 !important;
}

/* GitHub Link Styling */
a {
  color: #42b883;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  text-decoration: underline;
}


.back-btn {
  width: fit-content;
  margin-top: 2rem;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  background-color: #35495e;
  color: white;
  border: none;
  border-radius: 4px;
  transition: opacity 0.2s;
}

.back-btn:hover {
  opacity: 0.8;
}

</style>
