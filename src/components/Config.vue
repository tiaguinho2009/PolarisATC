<template>
  <Panel
    title="Config"
    :position="position"
    :minimized="minimized"
    @update:minimized="minimized = $event"
    @close="$emit('close')"
    @update:position="updatePosition"
  >
    <div :class="['panel', { minimize: minimized }]">
      <div class="config-panel-content">
      <div class="config-row">
        <label for="sector-select">Sector File:</label>
        <CustomDropdown
            :options="sectorFiles"
            v-model="selectedSector"
          />
      </div>
      <div class="config-row">
        <label for="theme-select">Theme:</label>
        <CustomDropdown
            :options="themes"
            v-model="selectedTheme"
          />
      </div>
      <hr class="config-separator" />
      <div class="config-horizontal">
        <!-- Conteúdo horizontal futuro -->
      </div>
      <!-- Próxima secção será adicionada depois -->
    </div>
    </div>
  </Panel>
</template>

<script setup>
import { ref } from 'vue'
import Panel from './Panel.vue'
import CustomDropdown from './CustomDropdown.vue'

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

const sectorFiles = [
  { value: 'LPPO', label: 'LPPO' },
  { value: 'LPPC', label: 'LPPC' }
]
const themes = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' }
]

const selectedSector = ref(sectorFiles[0].value)
const selectedTheme = ref(themes[0].value)
</script>

<style scoped>
.panel {
  background: var(--color-surface);
  padding: 10px;
  height: 200px;
  width: 300px;
  opacity: 1;
  transform-origin: top;
  transition: all 0.2s ease-in-out;
}

.panel.minimize {
  height: 0;
  opacity: 0;
  padding: 0 10px 0 10px;
  transform: scaleY(0);
}

.config-panel-content {
  background: var(--color-surface);
  height: auto;
  width: auto;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.config-row label {
  min-width: 90px;
  font-weight: 500;
  color: var(--color-heading);
}

.config-row select {
  flex: 1;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-primary);
  background: var(--color-secondary);
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.config-row select:hover {
  outline: none;
  border-color: var(--color-primary-hover);
  background: var(--color-background);
}

.config-separator {
  border: none;
  border-top: 1px solid var(--color-primary);
  margin: 0.5rem 0;
}

.config-horizontal {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  min-height: 2rem;
}
</style>