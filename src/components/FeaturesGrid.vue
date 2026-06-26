<template>
  <section class="features-grid" :aria-label="t('home.features.heading')">
    <h2 class="section-title">{{ t('home.features.heading') }}</h2>
    <div class="grid-container">
      <article
        v-for="feature in features"
        :key="feature.key"
        class="feature-card"
        :class="`feature-${feature.key}`"
      >
        <div class="feature-icon" :aria-hidden="true">{{ feature.icon }}</div>
        <h3 class="feature-title">{{ t(`home.features.${feature.key}.title`) }}</h3>
        <p class="feature-description">{{ t(`home.features.${feature.key}.description`) }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
/**
 * @component FeaturesGrid
 * @description Grid of feature cards showcasing KTech's core capabilities
 */

import { computed } from 'vue'
import { useLanguage } from '../composables/useLanguage'

const { t, currentLocale } = useLanguage()

// Feature data with icons and keys
const features = computed(() => [
  { key: 'ai', icon: '🤖' },
  { key: 'realtime', icon: '⚡' },
  { key: 'secure', icon: '🔒' },
  { key: 'blockchain', icon: '⛓️' },
  { key: 'cloud', icon: '☁️' },
  { key: 'analytics', icon: '📊' }
])
</script>

<style scoped>
.features-grid {
  padding: 4rem 2rem;
  position: relative;
}

.section-title {
  font-family: var(--font-display, 'Orbitron', monospace);
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  text-align: center;
  color: var(--text-primary, #ffffff);
  margin-bottom: 3rem;
  text-shadow: 0 0 20px var(--cyan, #00ffcc);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%);
  border: 1px solid rgba(0, 255, 204, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: var(--cyan, #00ffcc);
  box-shadow: 0 8px 30px rgba(0, 255, 204, 0.3);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: inline-block;
  filter: drop-shadow(0 0 10px var(--cyan, #00ffcc));
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-title {
  font-family: var(--font-display, 'Orbitron', monospace);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--cyan, #00ffcc);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.feature-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary, #e0e0e0);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .features-grid {
    padding: 3rem 1rem;
  }

  .grid-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .feature-icon {
    font-size: 2.5rem;
  }

  .feature-title {
    font-size: 1.1rem;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .feature-card:hover {
    transform: translateY(-4px);
  }

  .feature-card:hover .feature-icon {
    transform: scale(1.05);
  }
}
</style>
