<template>
  <div class="custom-dropdown" @click="toggle">
    <div class="selected">
      <span class="selected-label">{{ selectedLabel }}</span>
      <span class="dropdown-arrow" :class="{ open }">
        <img src="@/assets/arrow-up.svg" alt="arrow" />
      </span>
    </div>
    <ul v-if="open" class="dropdown-list">
      <li
        v-for="option in options"
        :key="option.value"
        :class="{ active: option.value === modelValue }"
        @click.stop="select(option.value)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
const props = defineProps({
  options: Array,
  modelValue: [String, Number]
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
function toggle() { open.value = !open.value }
function select(val) {
  emit('update:modelValue', val)
  open.value = false
}
const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found ? found.label : ''
})
function onClickOutside(e) {
  if (!e.target.closest('.custom-dropdown')) open.value = false
}
watch(open, (val) => {
  if (val) document.addEventListener('click', onClickOutside)
  else document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.custom-dropdown {
  position: relative;
  width: 100%;
  background: var(--color-secondary);
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text);
  font-size: 1rem;
  user-select: none;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.selected {
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  padding: 0 0.5rem;
  box-sizing: border-box;
  justify-content: space-between;
}

.selected-label {
  flex: 1;
  display: flex;
  align-items: center;
}

.dropdown-arrow {
  display: flex;
  align-items: center;
  transition: transform 0.2s;
  margin-left: 0.5rem;
}
.dropdown-arrow img {
  width: 18px;
  height: 18px;
  display: block;
}
.dropdown-arrow.open {
  transform: rotate(-180deg);
}

.dropdown-list {
  position: absolute;
  left: 0; right: 0; top: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-primary);
  border-radius: 0 0 4px 4px;
  z-index: 10;
  margin: 0;
  padding: 0;
  list-style: none;
}
.dropdown-list li {
  padding: 0.2rem 0.5rem;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  min-height: 32px;
}
.dropdown-list li:hover,
.dropdown-list li.active {
  background: var(--color-primary);
  color: var(--color-heading);
}
</style>