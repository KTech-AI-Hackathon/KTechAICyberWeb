<template>
  <section class="cta-section" :class="variantClass">
    <div class="cta-background" aria-hidden="true"></div>
    <div class="cta-content">
      <h2 class="cta-title">{{ title }}</h2>
      <p class="cta-description" v-if="description">{{ description }}</p>
      <div class="cta-actions">
        <component
          :is="buttonComponent"
          v-bind="buttonProps"
          class="cta-button"
          :class="buttonClass"
          :aria-label="ariaLabel"
          @click="handleClick"
        >
          <span class="cta-button-text">{{ buttonText }}</span>
          <span class="cta-button-icon" aria-hidden="true">→</span>
        </component>
        <a
          v-if="secondaryLink && secondaryText"
          :href="secondaryLink"
          class="cta-secondary"
          :aria-label="secondaryAriaLabel"
        >
          {{ secondaryText }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * @component CtaSection
 * @description Reusable CTA (Call-to-Action) section component with cyberpunk styling
 *
 * @props
 * @param {string} title - Main heading text (required)
 * @param {string} description - Supporting description text
 * @param {string} buttonText - Primary button text
 * @param {string} buttonLink - URL for router-link navigation
 * @param {string} ariaLabel - Accessibility label for primary button
 * @param {string} variant - Visual variant: 'primary', 'secondary', 'accent'
 * @param {string} secondaryLink - Optional secondary link URL
 * @param {string} secondaryText - Optional secondary link text
 * @param {string} secondaryAriaLabel - Accessibility label for secondary link
 *
 * @emits click - Emitted when primary button is clicked
 *
 * @example
 * <CtaSection
 *   title="Ready to Get Started?"
 *   description="Join thousands of companies transforming their business."
 *   buttonText="Get Started"
 *   buttonLink="/contact"
 *   ariaLabel="Get started with KTech AI"
 *   variant="primary"
 * />
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: 'Get Started'
  },
  buttonLink: {
    type: String,
    default: ''
  },
  ariaLabel: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'accent'].includes(value)
  },
  secondaryLink: {
    type: String,
    default: ''
  },
  secondaryText: {
    type: String,
    default: ''
  },
  secondaryAriaLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const router = useRouter()

// Determine if we should use router-link or button
const buttonComponent = computed(() => {
  return props.buttonLink ? 'router-link' : 'button'
})

// Props for the button component
const buttonProps = computed(() => {
  if (props.buttonLink) {
    return { to: props.buttonLink }
  }
  return {}
})

// Variant class
const variantClass = computed(() => {
  return `cta-section--${props.variant}`
})

// Button variant class
const buttonClass = computed(() => {
  return `cta-button--${props.variant}`
})

// Handle click event
const handleClick = (event) => {
  if (!props.buttonLink) {
    emit('click', event)
  }
}
</script>

<style scoped>
.cta-section {
  position: relative;
  padding: 5rem 5%;
  overflow: hidden;
}

.cta-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.1) 0%, rgba(255, 0, 170, 0.05) 100%);
}

.cta-section--secondary .cta-background {
  background: linear-gradient(135deg, rgba(255, 0, 170, 0.1) 0%, rgba(0, 255, 204, 0.05) 100%);
}

.cta-section--accent .cta-background {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(0, 255, 204, 0.05) 100%);
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin-bottom: 1rem;
  text-shadow: 0 0 40px rgba(0, 255, 204, 0.3);
}

.cta-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.7;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2.5rem;
  background: transparent;
  border: 2px solid var(--cyan);
  color: var(--cyan);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-normal);
  border-radius: var(--radius-sm);
}

.cta-button:hover {
  background: var(--cyan);
  color: var(--bg-primary);
  box-shadow: var(--shadow-glow-cyan);
  transform: translateY(-2px);
}

.cta-button:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 4px;
}

.cta-button--secondary {
  border-color: var(--magenta);
  color: var(--magenta);
}

.cta-button--secondary:hover {
  background: var(--magenta);
  box-shadow: var(--shadow-glow-magenta);
}

.cta-button--secondary:focus-visible {
  outline-color: var(--magenta);
}

.cta-button--accent {
  border-color: var(--purple);
  color: var(--purple);
}

.cta-button--accent:hover {
  background: var(--purple);
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.5);
}

.cta-button--accent:focus-visible {
  outline-color: var(--purple);
}

.cta-button-icon {
  transition: transform var(--transition-normal);
}

.cta-button:hover .cta-button-icon {
  transform: translateX(4px);
}

.cta-secondary {
  padding: 1rem 2rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
}

.cta-secondary:hover {
  color: var(--cyan);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .cta-button,
  .cta-button-icon,
  .cta-secondary {
    transition: none;
  }

  .cta-button:hover {
    transform: none;
  }

  .cta-button:hover .cta-button-icon {
    transform: none;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .cta-section {
    padding: 3rem 5%;
  }

  .cta-title {
    font-size: 1.8rem;
  }

  .cta-description {
    font-size: 1rem;
  }

  .cta-actions {
    flex-direction: column;
  }

  .cta-button,
  .cta-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
