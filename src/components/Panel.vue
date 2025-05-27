<template>
  <div
    class="floating-panel"
    ref="floatingPanelRef"
    :style="{
      top: position.y + 'px',
      left: position.x + 'px'
    }"
  >
    <header
      class="panel-header"
      :style="{ cursor: headerCursor }"
      @pointerdown="startDrag"
    >
      <span>{{ title }}</span>
      <div class="panel-controls">
        <button @click="emitToggleMinimize" @pointerdown.stop>
          <slot name="minimize">
            <img :class="['minimize-button', minimized ? 'down' : 'up']" src="/src/assets/arrow-up.svg" />
          </slot>
        </button>
        <button @click="$emit('close')" @pointerdown.stop>
          <slot name="close">
            <img src="/src/assets/close.svg" class="close-button" />
          </slot>
        </button>
      </div>
    </header>
    <div class="panel-content" :class="{ minimize: minimized }">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, onMounted, nextTick } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  position: { type: Object, required: true },
  minimized: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'update:position', 'update:minimized', 'update:panelSize'])

const position = ref({ ...props.position })
let dragging = false
let offset = { x: 0, y: 0 }
const headerCursor = ref('grab')

const floatingPanelRef = ref(null)
const panelWidth = ref(0)
const panelHeight = ref(0)

// Atualiza o tamanho ao montar e sempre que o conteúdo mudar
async function updatePanelSize() {
  await nextTick()
  if (floatingPanelRef.value) {
    panelWidth.value = floatingPanelRef.value.offsetWidth
    panelHeight.value = floatingPanelRef.value.offsetHeight
    emit('update:panelSize', { width: panelWidth.value, height: panelHeight.value })
  }
}

onMounted(updatePanelSize)
watch(() => props.minimized, updatePanelSize)
watch(() => props.position, updatePanelSize)

function startDrag(event) {
  if (event.button !== 0) return
  event.preventDefault()
  dragging = true
  headerCursor.value = 'grabbing'
  const panel = floatingPanelRef.value
  offset.x = event.clientX - panel.getBoundingClientRect().left
  offset.y = event.clientY - panel.getBoundingClientRect().top
  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', stopDrag)
}

function onDrag(event) {
  if (!dragging) return
  const canvas = document.querySelector('.radar-canvas')
  const container = canvas.parentElement // .main-content

  // Usa o tamanho do floating-panel
  const w = panelWidth.value > 0 ? panelWidth.value : 200
  const h = panelHeight.value > 0 ? panelHeight.value : 25

  const newX = event.clientX - container.getBoundingClientRect().left - offset.x
  const newY = event.clientY - container.getBoundingClientRect().top - offset.y

  // Limites para não sair do RadarCanvas
  let x = Math.max(0, Math.min(newX, canvas.clientWidth - w))
  let y = Math.max(0, Math.min(newY, canvas.clientHeight - h))

  position.value = { x, y }
  emit('update:position', { x, y })
}

function stopDrag() {
  dragging = false
  headerCursor.value = 'grab'
  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', stopDrag)
}

function emitToggleMinimize() {
  emit('update:minimized', !props.minimized)
}
</script>

<style scoped>
.floating-panel {
  position: absolute;
  border: 1px solid var(--color-primary);
  border-radius: 0px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
  user-select: none;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-primary);
  color: var(--color-text);
  height: 25px;
  width: 100%;
  user-select: auto;
  transition: background 0.2s ease;
}
.panel-header:hover {
  background: var(--color-primary-hover);
}
.panel-header span {
  margin-left: 5px;
}
.panel-header .panel-controls {
  display: flex;
  gap: 3px;
  margin-right: 3px;
}
.panel-header button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  user-select: none;
  width: 1.2rem;
  height: 1.2rem;
}
.panel-header button img {
  width: 1.2rem;
  height: 1.2rem;
  transition: transform 0.2s ease;
}

.panel-header button:hover img {
  transform: scale(1.3);
}

.panel-header .minimize-button {
  height: 1.6rem;
  width: 1.6rem;
  transition: transform 0.2s ease, rotate 0.2s ease;
}

.panel-header .minimize-button.up {
  rotate: 180deg;
}

.panel-header .minimize-button.down {
  rotate: 0deg;
}

.panel-content {
  height: auto;
  width: auto;
}
</style>