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
        <div class="radar-list-dropdown">
          <button class="radar-list-toggle" @click="showRadarList = !showRadarList" :class="{ open: showRadarList }">
            Radar Options
            <span class="arrow" :class="{ open: showRadarList }">
              <img src="/src/assets/arrow-up.svg" />
            </span>
          </button>
          <transition name="radar-group-slide">
            <div v-if="showRadarList" class="radar-list integrated">
              <template v-if="sector" v-for="(group, idx) in radarOptions" :key="idx">
                <RadarGroup :group="group" />
              </template>
            </div>
          </transition>
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
        visible: sector.data.navaids.visible,
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

const showRadarList = ref(false)
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

.radar-list-dropdown {
  width: 100%;
  position: relative;
}
.radar-list-toggle {
  width: 100%;
  min-height: 2.2rem;
  padding: 0.2rem 0.5rem;
  background: var(--color-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s, border-radius 0.2s, border-bottom 0.2s;
  border-bottom: 1px solid var(--color-primary);
  box-sizing: border-box;
}
.radar-list-toggle.open {
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}
.radar-list-toggle:hover {
  background: var(--color-background);
}
.arrow {
  margin-left: 0.5rem;
  display: inline-block;
  font-size: 0;
  transition: transform 0.2s;
}
.arrow img {
  width: 1.25rem;
  height: 1.25rem;
  transform: rotate(90deg);
  transition: all 0.2s;
}
.arrow.open img {
  transform: rotate(180deg);
}
.radar-list {
  background: var(--color-secondary);
  border: 1px solid var(--color-primary);
  border-top: none;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s cubic-bezier(0.4,0,0.2,1);
  max-height: 500px;
  opacity: 1;
  margin-top: 0;
  position: static;
  z-index: 10;
}
.radar-list.integrated {
  box-shadow: none;
}
.radar-list[style*='display: none'], .radar-list[style*='display:none'] {
  max-height: 0 !important;
  opacity: 0 !important;
}
.radar-group-slide-enter-active, .radar-group-slide-leave-active {
  transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden !important;
}
.radar-group-slide-enter-from, .radar-group-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.radar-group-slide-enter-to, .radar-group-slide-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>