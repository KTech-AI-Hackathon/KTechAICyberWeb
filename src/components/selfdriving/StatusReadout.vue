<script setup>
/**
 * @component StatusReadout
 * @description Cycle counter + decision readout for the Self-Driving demo (#203).
 *
 * Surfaces the loop iteration and the current phase's decision line. The
 * cycling counter interpolates {n} at render (useLanguage.t does not natively
 * interpolate, so we .replace() here, matching the #203 plan).
 *
 * @ticket #203
 */
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

const props = defineProps({
  loopIteration: { type: Number, default: 0 },
  phaseId: { type: String, default: 'intake' },
  // Key into selfDriving.readout.* ; parent picks merged/cycling/complete.
  readoutKey: { type: String, default: 'cycling' },
})

const readoutText = computed(() => {
  const raw = t(`selfDriving.readout.${props.readoutKey}`)
  // Interpolate {n} with the current cycle count (1-indexed for display).
  return raw.replace('{n}', String(props.loopIteration + 1))
})

// Map a phase to a streaming line key so the readout narrates the live stage.
const PHASE_LINE = {
  planner: 'plannerLine',
  coder: 'coderLine',
  security: 'securityLine',
  evaluator: 'evalLine',
}
const phaseLine = computed(() => {
  const key = PHASE_LINE[props.phaseId]
  return key ? t(`selfDriving.streaming.${key}`) : ''
})
</script>

<template>
  <div class="status-readout">
    <div class="status-readout-cycle neon-text">{{ readoutText }}</div>
    <div v-if="phaseLine" class="status-readout-line">{{ phaseLine }}</div>
  </div>
</template>

<style scoped>
.status-readout {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.status-readout-cycle {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.status-readout-line {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.72rem;
  color: var(--text-secondary);
}
</style>
