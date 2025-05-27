<template>
  <div
    class="floating-panel"
    :style="{
      top: position.y + 'px',
      left: position.x + 'px',
      width: panelWidth + 'px',
      height: panelHeight + 'px'
    }"
  >
    <header
      class="panel-header"
      :style="{ cursor: headerCursor }"
      @pointerdown="startDrag"
    >
      <span>{{ title }}</span>
      <button @click="$emit('close')" @pointerdown.stop>
        <slot name="close">
          <img src="/src/assets/close.svg" class="close-button" />
        </slot>
      </button>
    </header>
    <div class="panel-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  position: { type: Object, required: true },
  panelWidth: { type: Number, default: 300 },
  panelHeight: { type: Number, default: 200 }
})
const emit = defineEmits(['close', 'update:position'])

const position = ref({ ...props.position })
let dragging = false
let offset = { x: 0, y: 0 }
const headerCursor = ref('grab')

watch(() => props.position, (val) => {
  position.value = { ...val }
})

function startDrag(event) {
  if (event.button !== 0) return
  event.preventDefault()
  dragging = true
  headerCursor.value = 'grabbing'
  const panel = event.currentTarget.parentElement
  offset.x = event.clientX - panel.getBoundingClientRect().left
  offset.y = event.clientY - panel.getBoundingClientRect().top
  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', stopDrag)
}

function onDrag(event) {
  if (!dragging) return
  const canvas = document.querySelector('.radar-canvas')
  const container = canvas.parentElement // .main-content
  const panelWidth = props.panelWidth
  const panelHeight = props.panelHeight

  const newX = event.clientX - container.getBoundingClientRect().left - offset.x
  const newY = event.clientY - container.getBoundingClientRect().top - offset.y

  // Limites para não sair do RadarCanvas
  let x = Math.max(0, Math.min(newX, canvas.clientWidth - panelWidth))
  let y = Math.max(0, Math.min(newY, canvas.clientHeight - panelHeight))

  emit('update:position', { x, y })
}

function stopDrag() {
  dragging = false
  headerCursor.value = 'grab'
  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', stopDrag)
}
</script>

<style scoped>
.floating-panel {
  position: absolute;
  width: 300px;
  height: 200px;
  background: var(--color-surface);
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
  padding: 0.5rem;
  user-select: auto;
}
.panel-header button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  user-select: none;
  width: auto;
  height: 1.5rem;
}
.panel-header button img {
  width: auto;
  height: 100%;
  transition: transform 0.2s ease;
}
.panel-header button:hover img {
  transform: scale(1.5);
}
.panel-content {
  padding: 1rem;
  color: var(--color-text);
  user-select: text;
}
</style>