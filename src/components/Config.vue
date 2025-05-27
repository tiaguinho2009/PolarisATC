<template>
    <div
        class="floating-panel"
        :style="{ top: position.y + 'px', left: position.x + 'px' }"
    >
        <header
            class="panel-header"
            @pointerdown="startDrag"
        >
            <span>Config</span>
            <button @click="$emit('close')" @pointerdown.stop>X</button>
        </header>
        <div class="panel-content">
            <p>Config panel content goes here.</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const position = ref({ x: 0, y: 0 })
let dragging = false
let offset = { x: 0, y: 0 }

function startDrag(event) {
    if (event.button !== 0) return
    event.preventDefault()
    dragging = true
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
    const panelWidth = 300
    const panelHeight = 200

    const newX = event.clientX - container.getBoundingClientRect().left - offset.x
    const newY = event.clientY - container.getBoundingClientRect().top - offset.y

    position.value.x = Math.max(0, Math.min(newX, canvas.clientWidth - panelWidth))
    position.value.y = Math.max(0, Math.min(newY, canvas.clientHeight - panelHeight))
}

function stopDrag() {
    dragging = false
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
    cursor: grab;
    user-select: auto;
}
.panel-header button {
    cursor: pointer;
    user-select: none;
}
.panel-content {
    padding: 1rem;
    color: var(--color-text);
    user-select: text;
}
</style>