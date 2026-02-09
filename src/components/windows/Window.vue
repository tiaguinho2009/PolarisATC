<template>
    <div :class="['window', { collapsed }]" :style="{
        top: position.y + 'px',
        left: position.x + 'px',
        zIndex: zIndex,
        width: width + 'px',
        height: collapsed ? headerHeight + 'px' : height + 'px'
    }" @mousedown="bringToFront">

        <div ref="headerRef" class="window-header" @mousedown.stop.prevent="startDrag">
            <span class="window-title">{{ title }}</span>
            <div class="window-buttons">
                <button @click="toggleCollapse">{{ collapsed ? '▼' : '▲' }}</button>
                <button @click="$emit('close')">✕</button>
            </div>
        </div>

        <div v-show="!collapsed" class="window-body">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";

interface Position {
    x: number;
    y: number;
}

const props = defineProps<{
    title: string;
    width?: number;
    height?: number;
    zIndex?: number;
}>();

const width = props.width || 300;
const height = props.height || 200;
const headerHeight = 30;

const position = reactive<Position>({ x: 50, y: 50 });
const collapsed = ref(false);
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let zIndex = ref(props.zIndex || 1);

const headerRef = ref<HTMLElement | null>(null);

const startDrag = (e: MouseEvent) => {
    isDragging = true;
    offsetX = e.clientX - position.x;
    offsetY = e.clientY - position.y;

    if (headerRef.value) headerRef.value.classList.add("Dragging");

    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
};

const onDrag = (e: MouseEvent) => {
    if (!isDragging) return;

    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    newX = Math.max(0, Math.min(newX, window.innerWidth - width));
    newY = Math.max(32, Math.min(newY, window.innerHeight - (collapsed ? headerHeight : height)));

    position.x = newX;
    position.y = newY;
};

const stopDrag = () => {
    isDragging = false;

    if (headerRef.value) headerRef.value.classList.remove("Dragging");

    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);
};

const toggleCollapse = () => {
    collapsed.value = !collapsed.value;
};

const bringToFront = () => {
    zIndex.value = Window.topZIndex++;
};

// Z-index global tracker
interface WindowStatic {
    topZIndex: number;
}
const Window = (window as unknown as WindowStatic);
Window.topZIndex = Window.topZIndex || 10;
</script>

<style scoped>
.window {
    position: absolute;
    background: var(--ui-panelBackground);
    border: 1px solid var(--ui-panelBorder);
    color: var(--ui-textPrimary);
    font-size: 13px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    user-select: none;
    overflow: hidden;
}

.window-header {
    height: 31px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--ui-panelBackground);
    border-bottom: 1px solid var(--ui-panelBorder);
    padding: 0 8px;
    cursor: grab;
    transition: background ease-in-out 0.2s;
}

.window-header.Dragging {
    background: var(--ui-secondary);
    cursor: grabbing;
}

.window-title {
    font-weight: 500;
}

.window-buttons button {
    background: transparent;
    border: none;
    color: var(--ui-textPrimary);
    cursor: pointer;
    font-size: 12px;
}

.window-buttons button:hover {
    color: var(--ui-secondary);
}

.window-body {
    flex: 1;
    padding: 8px;
    overflow: auto;
}

.window.collapsed .window-body {
    display: none;
    border: none;
    padding: 0;
    margin: 0;
}

.window.collapsed .window-header {
    border-bottom: none;
}
</style>
