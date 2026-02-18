<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/" class="nav-item" title="Return to Menu">
          <img class="nav-logo" src="/SwapChessicon.png" />
        </RouterLink>

        <RouterLink to="/about" class="nav-item">About</RouterLink>

      </nav>
    </div>
  </header>

  <main class="view-container">
    <RouterView />
  </main>
</template>

<style scoped>
header {
  width: 100%;
  padding: 1rem 2rem;
}

nav {
  display: flex;
  justify-content: space-between; /* Pushes items to the edges */
  align-items: center;
  width: 100%;
}

.nav-logo {
    height: 70px;
    width: auto;
}

.nav-item {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.nav-item:hover {
  color: var(--color-accent);
}

.view-container {
  width: 100%;
  max-width: 1280px; /* This limits the width of your game/menu */
  margin: 0 auto;    /* This centers the container horizontally */
  padding: 2rem;     /* Adds some breathing room inside */
  
  min-height: calc(100vh - 100px); 
  display: flex;
  flex-direction: column;
}

</style>