<script setup>
import { ref } from 'vue'
import RadarCanvas from './components/RadarCanvas.vue'
import PositionPanel from './components/Position.vue'
import ConfigPanel from './components/Config.vue'

const PANEL_WIDTH = 300
const PANEL_HEIGHT = 200

const showPositionPanel = ref(false)
const showConfigPanel = ref(false)

const positionPanelPos = ref({ x: 100, y: 0 })
const configPanelPos = ref({ x: 450, y: 0 })

function turnPositionPanel() {
  if (!showPositionPanel.value) {
    positionPanelPos.value = { x: 0, y: 0 }
  }
  showPositionPanel.value = !showPositionPanel.value
}
function turnConfigPanel() {
  if (!showConfigPanel.value) {
    configPanelPos.value = { x: 0, y: 0 }
  }
  showConfigPanel.value = !showConfigPanel.value
}

function updatePanelPosition(panel, newPos) {
  if (panel === 'position') {
    positionPanelPos.value = { ...newPos }
  }
  if (panel === 'config') {
    configPanelPos.value = { ...newPos }
  }
}
</script>

<template>
  <header class="main-header">
    <img alt="Logo" class="logo" src="./assets/logo.svg" width="48" height="48" />
    <nav>
      <button class="nav-btn" @click="turnPositionPanel">Position</button>
      <button class="nav-btn">Flight Plan</button>
      <button class="nav-btn">Strips</button>
      <button class="nav-btn">ATIS</button>
      <button class="nav-btn" @click="turnConfigPanel">Config</button>
    </nav>
  </header>
  <main class="main-content">
    <RadarCanvas />
    <div class="panels-overlay">
      <PositionPanel
        v-if="showPositionPanel"
        :position="positionPanelPos"
        @update:position="pos => updatePanelPosition('position', pos)"
        @close="turnPositionPanel"
      />
      <ConfigPanel
        v-if="showConfigPanel"
        :position="configPanelPos"
        @update:position="pos => updatePanelPosition('config', pos)"
        @close="turnConfigPanel"
      />
    </div>
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
  position: relative;
}
.panels-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}
.panels-overlay > * {
  pointer-events: auto;
}
</style>