<template>
  <Panel
    title="Position"
    :position="position"
    :panelWidth="300"
    :panelHeight="200"
    @close="$emit('close')"
    @update:position="updatePosition"
  >
    <p>Position panel content goes here.</p>
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

function updatePosition(pos) {
  position.value = { ...pos }
  emit('update:position', pos)
}
</script>