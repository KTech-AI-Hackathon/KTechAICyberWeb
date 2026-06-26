<template>
  <section class="cta-section" aria-label="Call to action">
    <div class="cta-content">
      <h2 class="cta-title">{{ t('home.cta.secondary.button') }}</h2>
      <p class="cta-description">{{ t('home.hero.description') }}</p>
      <div class="cta-buttons">
        <router-link
          to="/about"
          class="cta-button primary"
          :aria-label="t('home.cta.secondary.ariaLabel')"
        >
          <span class="button-text">{{ t('home.cta.secondary.button') }}</span>
          <span class="button-glow" aria-hidden="true"></span>
        </router-link>
        <router-link
          to="/news"
          class="cta-button secondary"
          :aria-label="t('home.cta.primary.ariaLabel')"
        >
          <span class="button-text">{{ t('home.cta.primary.button') }}</span>
          <span class="button-glow" aria-hidden="true"></span>
        </router-link>
      </div>
    </div>
    <div class="cta-bg" aria-hidden="true"></div>
  </section>
</template>

<script setup>
/**
 * @component CTASection
 * @description Call-to-action section with navigation buttons
 */

import { useLanguage } from '../composables/useLanguage'

const { t } = useLanguage()
</script>

<style scoped>
.cta-section {
  padding: 6rem 2rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cta-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 50%, rgba(0, 255, 204, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 50%, rgba(255, 0, 170, 0.15) 0%, transparent 50%);
  animation: bgPulse 4s ease-in-out infinite alternate;
}

@keyframes bgPulse {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}

.cta-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 600px;
}

.cta-title {
  font-family: var(--font-display, 'Orbitron', monospace);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin-bottom: 1.5rem;
  text-shadow: 0 0 30px var(--cyan, #00ffcc);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.cta-description {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--text-secondary, #e0e0e0);
  line-height: 1.8;
  margin-bottom: 3rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2.5rem;
  font-family: var(--font-display, 'Orbitron', monospace);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 4px;
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 160px;
}

.cta-button.primary {
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.2) 0%, rgba(0, 255, 204, 0.1) 100%);
  color: var(--cyan, #00ffcc);
  border: 2px solid var(--cyan, #00ffcc);
}

.cta-button.secondary {
  background: linear-gradient(135deg, rgba(255, 0, 170, 0.2) 0%, rgba(255, 0, 170, 0.1) 100%);
  color: var(--magenta, #ff00aa);
  border: 2px solid var(--magenta, #ff00aa);
}

.button-glow {
  position: absolute;
  inset: 0;
  background: inherit;
  filter: blur(15px);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 255, 204, 0.4);
}

.cta-button.primary:hover {
  background: rgba(0, 255, 204, 0.3);
  box-shadow: 0 8px 30px rgba(0, 255, 204, 0.5);
}

.cta-button.secondary:hover {
  background: rgba(255, 0, 170, 0.3);
  box-shadow: 0 8px 30px rgba(255, 0, 170, 0.5);
}

.cta-button:hover .button-glow {
  opacity: 0.6;
}

.cta-button:focus {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}

/* Responsive Design */
@media (max-width: 640px) {
  .cta-section {
    padding: 4rem 1rem;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-description {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .cta-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .cta-button {
    width: 100%;
    max-width: 300px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .cta-bg {
    animation: none;
  }

  .cta-button:hover {
    transform: translateY(-1px);
  }

  .button-glow {
    transition: none;
  }
}
</style>
