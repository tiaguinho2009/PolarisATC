<script setup>
import { ref, onMounted } from 'vue'
import RadarCanvas from './components/RadarCanvas.vue'
import PositionPanel from './components/Position.vue'
import ConfigPanel from './components/Config.vue'
import { getCurrentWindow } from '@tauri-apps/api/window';

const showPositionPanel = ref(false)
const showConfigPanel = ref(false)

const positionPanelPos = ref({ x: 100, y: 0 })
const configPanelPos = ref({ x: 450, y: 0 })

const isMaximized = ref(false)

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

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// Funções para os botões da janela
function minimize() {
  getCurrentWindow().minimize()
}
async function maximize() {
  const maximized = await getCurrentWindow().isMaximized()
  if (maximized) {
    await getCurrentWindow().unmaximize()
    isMaximized.value = false
  } else {
    await getCurrentWindow().maximize()
    isMaximized.value = true
  }
}
function close() {
  getCurrentWindow().close()
  
}

onMounted(async () => {
  isMaximized.value = await getCurrentWindow().isMaximized()
  // Atualiza o estado ao maximizar/desmaximizar manualmente
  getCurrentWindow().onResized(async () => {
    isMaximized.value = await getCurrentWindow().isMaximized()
  })
})
</script>

<template>
  <header class="main-header">
    <img alt="Logo" class="logo" src="./assets/logo.svg" width="48" height="48" />
    <nav>
      <button class="nav-btn" @click="turnPositionPanel">Position</button>
      <div class="nav-separator"></div>
      <button class="nav-btn">Flight Plan</button>
      <div class="nav-separator"></div>
      <button class="nav-btn">Strips</button>
      <div class="nav-separator"></div>
      <button class="nav-btn" @click="turnConfigPanel">Config</button>
    </nav>
    <div class="window-controls">
      <button class="window-btn" @click="minimize" title="Minimize">
        <img class="minus" src="./assets/minus.svg" />
      </button>
      <button class="window-btn" @click="maximize" title="Maximize">
        <img
          v-if="!isMaximized"
          class="square"
          src="./assets/square.svg"
        />
        <img
          v-else
          class="square"
          src="./assets/square2.svg"
        />
      </button>
      <button class="window-btn close" @click="close" title="Close">
        <img class="close" src="./assets/close.svg" />
      </button>
    </div>
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
  height: 50px;
  border-bottom: 2px solid var(--color-primary);
  justify-content: space-between;
  user-select: none;
  -webkit-app-region: drag;
}
.logo {
  margin-right: 2rem;
  margin-left: 1rem;
}
nav {
  display: flex;
  gap: 0.5rem;
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
  -webkit-app-region: no-drag;
}
.nav-btn:hover {
  background: var(--color-primary);
  color: var(--color-text);
}
nav .nav-separator {
  display: flex;
  width: 1px;
  height: 2em;
  background: var(--color-surface);
  vertical-align: middle;
  align-self: center;
}
.window-controls {
  display: flex;
  gap: 0.2rem;
  margin-left: auto;
  margin-right: 0.5rem;
  -webkit-app-region: no-drag;
}
.window-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-size: 1.3rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.window-btn:hover {
  background: var(--color-primary);
  color: var(--color-text);
}
.window-btn img {
  width: 24px;
  height: 24px;
  color: var(--color-accent);
}
.window-btn.close:hover {
  background: #e74c3c;
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