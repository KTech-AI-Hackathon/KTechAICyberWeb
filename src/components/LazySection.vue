<script setup>
// ========== IMPORTS ==========
import { ref, onMounted } from 'vue'
import { useIntersectionObserver } from '../composables/useIntersectionObserver'

// ========== PROPS ==========
// tag: the wrapper element type. Default 'section' (semantic landmark, matches
//   Home's existing module section wrappers).
// rootMargin + threshold: forwarded to useIntersectionObserver. Defaults bias
//   toward early-mount (200px / 0.01) so a fast scroll does not reveal an empty
//   wrapper — the module is pre-loaded just before it enters the viewport.
// dataTest: forwarded to the wrapper so E2E/unit tests can target the lazy
//   boundary deterministically (e.g. [data-test="lazy-neural-core"]).
const props = defineProps({
  tag: { type: String, default: 'section' },
  rootMargin: { type: String, default: '200px' },
  threshold: { type: Number, default: 0.01 },
  dataTest: { type: String, default: '' },
})

// ========== STATE ==========
// Sentinel <div ref> observed by the composable. The slot renders only after
// the sentinel first intersects the viewport (isVisible -> true).
const sentinel = ref(null)
const { isVisible, observe } = useIntersectionObserver({
  rootMargin: props.rootMargin,
  threshold: props.threshold,
})

// ========== LIFECYCLE ==========
onMounted(() => {
  // observe() is SSR-safe: if IntersectionObserver is undefined (jsdom without
  // a polyfill, or a legacy browser), the composable sets isVisible=true
  // immediately, so content never disappears forever.
  if (sentinel.value) {
    observe(sentinel.value)
  }
})
</script>

<template>
  <component
    :is="tag"
    class="lazy-section"
    :data-test="dataTest || undefined"
  >
    <!-- Sentinel: a zero-height marker observed for intersection. Always in
         the DOM so the wrapper holds its layout slot even before the slot
         renders (CLS guard, iter-16 perf). -->
    <div ref="sentinel" class="lazy-section__sentinel" aria-hidden="true"></div>
    <!-- The slot payload mounts ONLY after first intersection. Once mounted it
         stays mounted (isVisible never flips back to false in the composable
         — it unobserves after the first hit). -->
    <slot v-if="isVisible" />
  </component>
</template>

<style scoped>
/* Reserve a min-height on the wrapper so the page does not jump (CLS) when the
   lazy module mounts below the fold. 200px is a conservative placeholder that
   covers the typical interactive-module footprint; the real module overrides
   it once mounted. */
.lazy-section {
  position: relative;
  min-height: 200px;
}

.lazy-section__sentinel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  pointer-events: none;
}
</style>
