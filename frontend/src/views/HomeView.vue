<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="home-screen">
    <h1 class="title">SWAPChess</h1>

    <nav class="menu-buttons">
        <RouterLink class="btn" to="/play-local">Play Local</RouterLink>
        <RouterLink class="btn" to="/play-computer">Vs Computer</RouterLink>
        <RouterLink class="btn" to="/play-online">Online Multiplayer</RouterLink>
    </nav>
  </main>
</template>

<style scoped>
/* Make the container fill the screen and center content */
.home-screen {
  display: flex;
  flex-direction: column; /* Stack Title on top of Buttons */
  justify-content: center; /* Center vertically */
  align-items: center;     /* Center horizontally */
  min-height: 100vh;       /* Full screen height */
  text-align: center;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: var(--color-heading);
  letter-spacing: -1px;
}

/* Arrange the buttons in a column with spacing */
.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Space between buttons */
  width: 100%;
  max-width: 300px; /* Prevent buttons from getting too wide */
}

/* Make the buttons look bigger for the home screen */
.btn {
  padding: 1rem 0;
  font-size: 1.2rem;
}
</style>