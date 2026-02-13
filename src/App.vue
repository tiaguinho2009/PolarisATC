<script setup lang="ts">
import { onMounted } from "vue"
import { useColorSchemeStore } from "./stores/UIColorScheme"
import { appWindow } from "./platform"

import Header from "./components/Header.vue"
import Radar from "./components/Radar.vue"
import WindowLayer from "./components/WindowLayer.vue"
import Notifications from "./components/Notifications.vue"

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
