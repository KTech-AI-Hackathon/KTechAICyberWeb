<template>
  <main class="home-page" role="main">
    <!-- Animated background grid -->
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="grid-bg grid-bg-2" aria-hidden="true"></div>

    <!-- Hero Section -->
    <section class="hero-section" aria-label="Hero">
      <div class="hero-content">
        <h1 class="hero-title glitch-text" :data-text="t('home.hero.heading')">
          {{ t('home.hero.heading') }}
        </h1>
        <p class="hero-subtitle">{{ t('home.hero.description') }}</p>
        <router-link
          to="/about"
          class="hero-cta"
          :aria-label="t('home.cta.primary.ariaLabel')"
        >
          {{ t('home.cta.primary.button') }}
        </router-link>
      </div>
    </section>

    <!-- Features Grid -->
    <FeaturesGrid />

    <!-- Statistics Section -->
    <StatsSection />

    <!-- CTA Section -->
    <CTASection />
  </main>
</template>

<script setup>
/**
 * @component Home
 * @description Home page with hero, features, stats, and CTA sections
 */

import { onMounted } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import FeaturesGrid from '../components/FeaturesGrid.vue'
import StatsSection from '../components/StatsSection.vue'
import CTASection from '../components/CTASection.vue'

const { t } = useLanguage()

onMounted(() => {
  // Initialize entrance animations
  document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px')
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
}

/* Animated grid background */
.grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 255, 204, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  pointer-events: none;
  z-index: 0;
}

.grid-bg-2 {
  background-image:
    linear-gradient(rgba(0, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 100px 100px;
  animation: gridMove 30s linear infinite reverse;
}

@keyframes gridMove {
  0% {
    transform: perspective(500px) rotateX(60deg) translateY(0);
  }
  100% {
    transform: perspective(500px) rotateX(60deg) translateY(50px);
  }
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 2rem;
  text-align: center;
}

.hero-content {
  max-width: 900px;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  font-family: var(--font-display, 'Orbitron', monospace);
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
  text-shadow:
    0 0 10px var(--cyan, #00ffcc),
    0 0 20px var(--cyan, #00ffcc),
    0 0 30px var(--cyan, #00ffcc),
    0 0 40px var(--cyan, #00ffcc);
  animation: neonPulse 3s ease-in-out infinite alternate;
}

@keyframes neonPulse {
  from {
    text-shadow:
      0 0 10px var(--cyan, #00ffcc),
      0 0 20px var(--cyan, #00ffcc),
      0 0 30px var(--cyan, #00ffcc);
  }
  to {
    text-shadow:
      0 0 20px var(--cyan, #00ffcc),
      0 0 30px var(--cyan, #00ffcc),
      0 0 40px var(--cyan, #00ffcc),
      0 0 50px var(--cyan, #00ffcc),
      0 0 60px var(--cyan, #00ffcc);
  }
}

/* Glitch effect */
.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.glitch-text::before {
  color: var(--magenta, #ff00aa);
  animation: glitch 0.3s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}

.glitch-text::after {
  color: var(--cyan, #00ffcc);
  animation: glitch 0.3s infinite reverse;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
}

@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: var(--text-secondary, #e0e0e0);
  line-height: 1.8;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 0 10px rgba(0, 255, 204, 0.5);
}

.hero-cta {
  display: inline-block;
  padding: 1rem 3rem;
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.2) 0%, rgba(0, 255, 204, 0.1) 100%);
  color: var(--cyan, #00ffcc);
  border: 2px solid var(--cyan, #00ffcc);
  border-radius: 4px;
  font-family: var(--font-display, 'Orbitron', monospace);
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
}

.hero-cta:hover {
  background: rgba(0, 255, 204, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 255, 204, 0.5);
}

.hero-cta:focus {
  outline: 2px solid var(--cyan, #00ffcc);
  outline-offset: 4px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    padding: 1rem;
  }

  .hero-content {
    padding-top: 4rem;
  }

  .hero-subtitle {
    margin-bottom: 2rem;
  }

  .hero-cta {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .grid-bg,
  .grid-bg-2 {
    animation: none;
  }

  .hero-content {
    animation: none;
  }

  .hero-title {
    animation: none;
  }

  .glitch-text::before,
  .glitch-text::after {
    animation: none;
  }

  .hero-cta:hover {
    transform: translateY(-1px);
  }
}
</style>
