<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useColorSchemeStore } from "./stores/UIColorScheme";

import Header from "./components/Header.vue";
import Radar from "./components/Radar.vue";
import Window from "./components/windows/Window.vue";

const colorStore = useColorSchemeStore();

onMounted(() => {
	colorStore.update();
});

interface WindowData {
	id: number
	title: string
	width: number
	height: number
}

let nextId = 1
const windows = ref<WindowData[]>([
	{ id: nextId++, title: 'Aircraft Info', width: 350, height: 250 },
	{ id: nextId++, title: 'Aircraft Info 2', width: 350, height: 250 },
])

const removeWindow = (id: number) => {
	windows.value = windows.value.filter(w => w.id !== id)
}
</script>

<template>
	<Header></Header>
	<Radar></Radar>
	<Window v-for="w in windows" :key="w.id" :title="w.title" :width="w.width" :height="w.height"
		@close="removeWindow(w.id)">
		<div>
			<p>Dados do avião vão aqui</p>
		</div>
	</Window>
</template>