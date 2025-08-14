<template>
	<div v-if="group.showOptions !== false" class="radar-group">
		<div class="radar-group-label" :class="{ active: group.visible }" @click="toggleGroup(group)"
			@contextmenu.prevent="togglevisible(group)">
			<span v-if="group.data && group.data.length" class="arrow" :class="{ open: group.open }">
				<img src="/src/assets/arrow-up.svg" />
			</span>
			<span>{{ group.name }}</span>
		</div>
		<transition name="radar-group-slide">
			<div v-if="group.open && group.data && group.data.length" class="radar-group-data">
				<template v-for="(child, idx) in group.data" :key="idx">
					<RadarGroup v-if="child.data" :group="child" />
					<div v-else class="radar-group-item" :class="{ active: child.visible }"
						@click.stop="togglevisible(child)" @contextmenu.prevent.stop="togglevisible(child)">
						{{ child.name }}
					</div>
				</template>
			</div>
		</transition>
	</div>
</template>

<script setup>
import { radarEvents } from '@/events'
import { defineProps } from 'vue'
const props = defineProps({ group: Object })
const group = props.group
const emit = defineEmits(['toggle'])

function toggleGroup(g) {
	g.open = !g.open
}
function togglevisible(item) {
	item.visible = !item.visible
	radarEvents.emit('draw');
}

// Só trabalha se group existir
if (!group) {
	// Não faz nada se não houver group
} else {
	if (typeof group.visible === 'undefined') {
		group.visible = true;
	}
	if (Array.isArray(group.data)) {
		for (const child of group.data) {
			if (typeof child.visible === 'undefined') {
				child.visible = true;
			}
		}
	}
}
</script>

<style scoped>
.radar-group-label {
	cursor: pointer;
	display: flex;
	align-items: center;
	user-select: none;
	color: var(--color-accent);
	transition: all 0.2s ease;
}

.radar-group-label.active {
	color: var(--color-accent);
}

.radar-group-label:not(.active) {
	color: var(--color-primary);
}

.radar-group-label:hover {
	background: var(--color-primary-hover);
}

.radar-group-label .arrow {
	display: inline-block;
	font-size: 0;
}

.radar-group-label .arrow img {
	width: 1.25rem;
	height: 1.25rem;
	transform: rotate(90deg);
	transition: all 0.2s ease;
}

.radar-group-label .arrow.open img {
	transform: rotate(180deg);
}

.radar-group-data {
	border-left: 1.5px solid var(--color-primary);
	padding-left: 0.7rem;
	margin: 0.3rem 1.2rem;
}

.radar-group-item {
	padding-left: 0.2rem;
	cursor: pointer;
	color: var(--color-primary);
	transition: all 0.2s ease;
}

.radar-group-item.active {
	color: var(--color-accent);
}

.radar-group-item:hover {
	background: var(--color-primary-hover);
}

/* Slide down/up animation for group open/close */
.radar-group-slide-enter-active,
.radar-group-slide-leave-active {
	transition: all 0.5s ease;
}

.radar-group-slide-enter-from,
.radar-group-slide-leave-to {
	max-height: 0;
	opacity: 0;
}

.radar-group-slide-enter-to,
.radar-group-slide-leave-from {
	max-height: 500px;
	opacity: 1;
}
</style>