<script setup>
/**
 * @component PipelineTrack
 * @description The 8-stage horizontal rail for the Self-Driving demo (#203).
 *
 * Renders one PipelineCard per phase and lights the current one based on the
 * phaseId/phaseIndex the parent composable drives. Done-cards are the phases
 * already passed this cycle.
 *
 * @ticket #203
 */
import PipelineCard from './PipelineCard.vue'

// Phase order matches useAutoDemoLoop.PHASES exactly.
const PHASES = [
  'intake',
  'triage',
  'planner',
  'coder',
  'security',
  'evaluator',
  'merger',
  'resolved',
]

// Map each phase to an EXISTING cyber palette CSS variable. Rotating the
// accent across the rail gives each stage a distinct identity without
// inventing a new palette.
const ACCENT = {
  intake: '--neon-blue',
  triage: '--cyan',
  planner: '--neon-green',
  coder: '--neon-pink',
  security: '--magenta',
  evaluator: '--neon-green',
  merger: '--cyan',
  resolved: '--neon-blue',
}

const props = defineProps({
  // Current phase id (e.g. 'planner').
  phaseId: { type: String, default: 'intake' },
})

function isDone(phase) {
  const cur = PHASES.indexOf(props.phaseId)
  const idx = PHASES.indexOf(phase)
  return idx < cur
}
</script>

<template>
  <div class="pipeline-track" role="list">
    <PipelineCard
      v-for="phase in PHASES"
      :key="phase"
      :phase="phase"
      :is-current="phase === phaseId"
      :is-done="isDone(phase)"
      :accent-var="ACCENT[phase] || '--cyan'"
    />
  </div>
</template>

<style scoped>
.pipeline-track {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: stretch;
  width: 100%;
}
@media (max-width: 768px) {
  .pipeline-track {
    /* Mobile: stack vertically so cards stay readable on a narrow screen. */
    flex-direction: column;
  }
}
</style>
