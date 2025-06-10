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
      <div class="config-row">
        <div class="radar-list">
          <template v-if="sector" v-for="(group, idx) in radarOptions" :key="idx">
            <RadarGroup :group="group" />
          </template>
        </div>
      </div>
    </div>
    </div>
  </Panel>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import Panel from './Panel.vue'
import CustomDropdown from './CustomDropdown.vue'
import RadarGroup from './RadarGroup.vue'
import { sector } from '@/API'
import { radarEvents, uiEvents } from '../events'

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

// Radar options: estrutura hierárquica
const radarOptions = ref([])

watchEffect(() => {
  if (sector && sector.data) {
    radarOptions.value = [
      sector.data.airspaces,
      {
        name: sector.data.navaids.name,
        visible: true,
        data: [
          sector.data.navaids.data.VOR,
          sector.data.navaids.data.NDB,
          sector.data.navaids.data.Airways,
          sector.data.navaids.data.Fixs,
        ]
      }
    ]
  } else {
    radarOptions.value = []
  }
})
</script>

<style scoped>
.panel {
  background: var(--panel-background);
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
  background: none;
  opacity: 1;
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
}

.radar-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background-color: var(--color-secondary);
  max-height: 200px;
  overflow-y: auto;
  /* Minimal scrollbar: só aparece no hover */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: box-shadow 0.2s;
}
.radar-list:hover {
  scrollbar-color: var(--color-primary) transparent;
}
.radar-list::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}
.radar-list::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 4px;
  opacity: 0.5;
}
.radar-list::-webkit-scrollbar-track {
  background: transparent;
}
.radar-list:not(:hover)::-webkit-scrollbar-thumb {
  background: transparent;
}
/* Corrige bug do overflow durante expansão dos grupos internos */
.radar-group-slide-enter-active, .radar-group-slide-leave-active {
  transition: max-height 0.5s ease, opacity 0.5s ease;
  overflow: hidden !important;
}
</style>