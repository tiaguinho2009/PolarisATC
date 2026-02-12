<script setup lang="ts">
import { onMounted } from "vue"
import { useColorSchemeStore } from "./stores/UIColorScheme"
import Header from "./components/Header.vue"
import Radar from "./components/Radar.vue"
import WindowLayer from "./components/windows/WindowLayer.vue"

const colorStore = useColorSchemeStore()

onMounted(() => {
	colorStore.update()
})
</script>

<template>
	<Header />
	<Radar />
	<WindowLayer />
</template>
