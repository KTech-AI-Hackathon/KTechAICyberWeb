<template>
  <section class="stats-section" :aria-label="t('home.stats.heading')">
    <h2 class="section-title">{{ t('home.stats.heading') }}</h2>
    <div class="stats-grid">
      <article
        v-for="stat in stats"
        :key="stat.key"
        class="stat-card"
      >
        <div class="stat-value" :data-value="stat.displayValue">
          {{ animatedValues[stat.key] || '0' }}
        </div>
        <div class="stat-label">{{ t(`home.stats.${stat.key}.label`) }}</div>
      </article>
    </div>
  </section>
</template>

<script setup>
/**
 * @component StatsSection
 * @description Statistics section with count-up animation
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useLanguage } from '../composables/useLanguage'

const { t } = useLanguage()

// Stats configuration
const stats = [
  { key: 'uptime', displayValue: '99.9%' },
  { key: 'requests', displayValue: '1M+' },
  { key: 'clients', displayValue: '50+' },
  { key: 'support', displayValue: '24/7' }
]

// Animated values
const animatedValues = ref({})
const animationRefs = ref({})
let intersectionObserver = null

// Count-up animation
const animateValue = (key, endValue) => {
  const element = animationRefs.value[key]
  if (!element) return

  // Handle different value formats
  const isPercentage = endValue.includes('%')
  const isPlus = endValue.includes('+')
  const isSlash = endValue.includes('/')

  if (isSlash) {
    // Direct set for values like "24/7"
    animatedValues.value[key] = endValue
    return
  }

  const numericValue = parseFloat(endValue.replace(/[^0-9.]/g, ''))
  const duration = 2000
  const startTime = performance.now()

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function
    const easeOut = 1 - Math.pow(1 - progress, 3)
    const current = numericValue * easeOut

    // Format the value
    let formatted = current.toFixed(numericValue < 10 ? 1 : 0)
    if (isPercentage) formatted += '%'
    if (isPlus) formatted += '+'

    animatedValues.value[key] = formatted

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// Setup intersection observer for animations
const setupObserver = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const key = entry.target.dataset.key
          animateValue(key, stats.find(s => s.key === key)?.displayValue)
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.5 }
  )

  // Observe all stat value elements
  document.querySelectorAll('.stat-value').forEach((el) => {
    observer.observe(el)
  })

  intersectionObserver = observer
}

onMounted(() => {
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    setupObserver()
  })
})

onUnmounted(() => {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
})
</script>

<style scoped>
.stats-section {
  padding: 4rem 2rem;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 255, 204, 0.05) 50%, transparent 100%);
  position: relative;
}

.section-title {
  font-family: var(--font-display, 'Orbitron', monospace);
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  text-align: center;
  color: var(--text-primary, #ffffff);
  margin-bottom: 3rem;
  text-shadow: 0 0 20px var(--magenta, #ff00aa);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  text-align: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, transparent 100%);
  border: 1px solid rgba(255, 0, 170, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--magenta, #ff00aa);
  box-shadow: 0 8px 30px rgba(255, 0, 170, 0.2);
  transform: translateY(-4px);
}

.stat-value {
  font-family: var(--font-display, 'Orbitron', monospace);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--magenta, #ff00aa);
  text-shadow: 0 0 20px var(--magenta, #ff00aa);
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-value {
  transform: scale(1.1);
}

.stat-label {
  font-size: clamp(0.85rem, 2vw, 1rem);
  color: var(--text-secondary, #e0e0e0);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-section {
    padding: 3rem 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .stat-card {
    padding: 1.5rem 1rem;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-card:hover .stat-value {
    transform: scale(1.05);
  }

  .stat-value {
    transition: none;
  }
}
</style>
