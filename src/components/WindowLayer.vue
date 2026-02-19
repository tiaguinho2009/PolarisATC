<script setup lang="ts">
import { computed } from "vue"
import { windowManager } from '../main';
import Window from "./presets/Window.vue"

const windows = computed(() => windowManager.windows.value)
</script>

<template>
    <Window v-for="w in windows" :key="w.id" :window="w" @close="windowManager.removeWindow(w.id)" />
</template>
