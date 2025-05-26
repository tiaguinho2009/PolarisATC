<script setup>
import RadarCanvas from './components/RadarCanvas.vue'
</script>

<template>
  <header class="main-header">
    <img alt="Logo" class="logo" src="./assets/logo.svg" width="48" height="48" />
    <nav>
      <button class="nav-btn">Position</button>
      <button class="nav-btn">Flight Plan</button>
      <button class="nav-btn">Strips</button>
      <button class="nav-btn">ATIS</button>
      <button class="nav-btn">Config</button>
    </nav>
  </header>
  <main class="main-content">
    <RadarCanvas />
  </main>
</template>

<style scoped>
.main-header {
  display: flex;
  align-items: center;
  background: var(--color-secondary);
  color: var(--color-text);
  padding: 0 2rem;
  height: 50px;
  border-bottom: 2px solid var(--color-primary);
}
.logo {
  margin-right: 2rem;
}
nav {
  display: flex;
  gap: 1rem;
}
.nav-btn {
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--color-accent);
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.nav-btn:hover {
  background: var(--color-primary);
  color: var(--color-text);
}
.main-content {
  flex: 1;
  width: 100vw;
  height: calc(100vh - 50px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
