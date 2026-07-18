import { ref, computed, onUnmounted } from 'vue'

const MOBILE_BREAKPOINT = 768

/**
 * Composable for detecting mobile vs desktop devices based on viewport width
 * @returns {Object} { isMobile, isDesktop, cleanup }
 */
export function useDeviceDetection() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }

  // Initial detection
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateWidth)
  }

  const isMobile = computed(() => windowWidth.value <= MOBILE_BREAKPOINT)
  const isDesktop = computed(() => windowWidth.value > MOBILE_BREAKPOINT)

  const cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateWidth)
    }
  }

  // Auto cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    isMobile,
    isDesktop,
    cleanup,
  }
}
