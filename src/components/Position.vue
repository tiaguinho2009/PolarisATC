<template>
	<Panel title="Position" :position="position" :minimized="minimized" @update:minimized="minimized = $event"
		@close="$emit('close')" @update:position="updatePosition">
		<div :class="['panel', { minimize: minimized }]">
			<p>Position panel content goes here.</p>
		</div>
	</Panel>
</template>

<script setup>
import { ref } from 'vue'
import Panel from './Panel.vue'

const props = defineProps({
	position: { type: Object, required: true }
})
const emit = defineEmits(['close', 'update:position'])

const position = ref({ ...props.position })
const minimized = ref(false)

function updatePosition(pos) {
	position.value = { ...pos }
	emit('update:position', pos)
}
</script>

<style scoped>
.panel {
	background: var(--color-surface);
	padding: 0 10px 0 10px;
	height: 100px;
	width: 300px;
	opacity: 1;
	transform-origin: top;
	transition: all 0.2s ease-in-out;
}

.panel.minimize {
	height: 0;
	opacity: 0;
}
</style>