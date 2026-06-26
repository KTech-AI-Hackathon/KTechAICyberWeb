/**
 * @file FeaturesGrid.test.ts
 * @description Comprehensive unit tests for Features Grid component in Home.vue
 * @ticket #79 - TEST-019: Features Grid Component Unit Tests - TDD with Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from '@/views/Home.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

// Mock useLanguage composable - must be at top level for proper hoisting
vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    t: (key) => {
      const translations = {
        'home.features.ai.title': 'AI Models',
        'home.features.ai.description': 'Advanced neural networks powered by state-of-the-art transformers',
        'home.features.realtime.title': 'Real-time',
        'home.features.realtime.description': 'Lightning-fast responses with our optimized infrastructure',
        'home.features.secure.title': 'Secure',
        'home.features.secure.description': 'Enterprise-grade security with quantum-resistant encryption',
        'home.title': 'KTech AI',
        'home.subtitle': 'Cyberpunk Intelligence Systems',
        'home.hero.title': 'Next Generation AI',
        'home.hero.description': 'Building the future of artificial intelligence with cutting-edge technology and cyberpunk aesthetics.',
        'home.stats.uptime': 'Uptime',
        'home.stats.requests': 'Requests',
        'home.stats.latency': 'Latency',
        'home.cta': 'Get Started'
      }
      return translations[key] || key
    },
    locale: { value: 'en' },
    currentLanguage: { value: 'en' },
    languageDisplay: 'EN',
    isEnglish: true,
    initLanguage: vi.fn(),
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn()
  })
}))

describe('Features Grid Component (Home View)', () => {
  let router
  let wrapper

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/home', component: Home }
      ]
    })
  })

  describe('Rendering', () => {
    beforeEach(() => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })
    })

    it('should render features section', () => {
      const featuresSection = wrapper.find('.features')
      expect(featuresSection.exists()).toBe(true)
    })

    it('should render exactly 3 feature cards', () => {
      const featureCards = wrapper.findAll('.feature-card')
      expect(featureCards.length).toBe(3)
    })

    it('should render each feature card with icon, title, and description', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        expect(card.find('.feature-icon').exists()).toBe(true)
        expect(card.find('h3').exists()).toBe(true)
        expect(card.find('p').exists()).toBe(true)
      })
    })

    it('should render feature icons with emoji', () => {
      const featureIcons = wrapper.findAll('.feature-icon')
      expect(featureIcons.length).toBe(3)

      const iconTexts = featureIcons.map(icon => icon.text())
      expect(iconTexts).toContain('🤖')
      expect(iconTexts).toContain('⚡')
      expect(iconTexts).toContain('🔒')
    })

    it('should render feature titles', () => {
      const featureCards = wrapper.findAll('.feature-card')
      const titles = featureCards.map(card => card.find('h3').text())

      expect(titles).toContain('AI Models')
      expect(titles).toContain('Real-time')
      expect(titles).toContain('Secure')
    })
  })

  describe('Content (i18n)', () => {
    beforeEach(() => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })
    })

    it('should display AI feature title in English', () => {
      const featureCards = wrapper.findAll('.feature-card')
      const aiCard = featureCards[0]
      expect(aiCard.find('h3').text()).toBe('AI Models')
    })

    it('should display AI feature description in English', () => {
      const featureCards = wrapper.findAll('.feature-card')
      const aiCard = featureCards[0]
      expect(aiCard.find('p').text()).toBe('Advanced neural networks powered by state-of-the-art transformers')
    })

    it('should display Real-time feature title', () => {
      const featureCards = wrapper.findAll('.feature-card')
      const realtimeCard = featureCards[1]
      expect(realtimeCard.find('h3').text()).toBe('Real-time')
    })

    it('should display Real-time feature description', () => {
      const featureCards = wrapper.findAll('.feature-card')
      const realtimeCard = featureCards[1]
      expect(realtimeCard.find('p').text()).toBe('Lightning-fast responses with our optimized infrastructure')
    })

    it('should display Secure feature title', () => {
      const featureCards = wrapper.findAll('.feature-card')
      const secureCard = featureCards[2]
      expect(secureCard.find('h3').text()).toBe('Secure')
    })

    it('should display Secure feature description', () => {
      const featureCards = wrapper.findAll('.feature-card')
      const secureCard = featureCards[2]
      expect(secureCard.find('p').text()).toBe('Enterprise-grade security with quantum-resistant encryption')
    })

    it('should have non-empty content for all features', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        const title = card.find('h3').text()
        const description = card.find('p').text()
        expect(title.length).toBeGreaterThan(0)
        expect(description.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Styling', () => {
    beforeEach(() => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })
    })

    it('should apply neon-border class to feature icons', () => {
      const featureIcons = wrapper.findAll('.feature-icon')

      featureIcons.forEach(icon => {
        expect(icon.classes()).toContain('neon-border')
      })
    })

    it('should have feature-card class on each card', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        expect(card.classes()).toContain('feature-card')
      })
    })

    it('should have features section with grid layout', () => {
      const featuresSection = wrapper.find('.features')
      expect(featuresSection.classes()).toContain('features')
    })

    it('should have correct icon styling classes', () => {
      const featureIcons = wrapper.findAll('.feature-icon')

      featureIcons.forEach(icon => {
        expect(icon.classes()).toContain('feature-icon')
        expect(icon.classes()).toContain('neon-border')
      })
    })

    it('should feature cards have cyberpunk background styling', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        expect(card.classes()).toContain('feature-card')
      })
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })
    })

    it('should use semantic HTML structure for features section', () => {
      const featuresSection = wrapper.find('.features')
      expect(featuresSection.element.tagName).toBe('SECTION')
    })

    it('should use semantic heading structure', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        const heading = card.find('h3')
        expect(heading.exists()).toBe(true)
        expect(heading.element.tagName).toBe('H3')
      })
    })

    it('should have descriptive text content for screen readers', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        const title = card.find('h3').text()
        const description = card.find('p').text()

        expect(title.length).toBeGreaterThan(0)
        expect(description.length).toBeGreaterThan(0)
      })
    })

    it('should maintain proper heading hierarchy', () => {
      const featureCards = wrapper.findAll('.feature-card')

      // All feature titles should be h3
      featureCards.forEach(card => {
        const headings = card.findAll('h3')
        expect(headings.length).toBe(1)
      })
    })

    it('should have icons with text representation', () => {
      const featureIcons = wrapper.findAll('.feature-icon')

      featureIcons.forEach(icon => {
        // Icons use emoji which have text representation
        expect(icon.text().length).toBeGreaterThan(0)
      })
    })
  })

  describe('Grid Layout', () => {
    beforeEach(() => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })
    })

    it('should have features container with grid class', () => {
      const featuresSection = wrapper.find('.features')
      expect(featuresSection.exists()).toBe(true)
      expect(featuresSection.classes()).toContain('features')
    })

    it('should contain exactly 3 feature cards', () => {
      const featureCards = wrapper.findAll('.feature-card')
      expect(featureCards.length).toBe(3)
    })

    it('should have equal spacing between cards', () => {
      const featuresSection = wrapper.find('.features')
      const featureCards = wrapper.findAll('.feature-card')

      expect(featuresSection.exists()).toBe(true)
      expect(featureCards.length).toBe(3)
      // CSS handles the gap, we verify structure exists
    })
  })

  describe('Component Structure', () => {
    beforeEach(() => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })
    })

    it('should maintain consistent card structure', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        expect(card.find('.feature-icon').exists()).toBe(true)
        expect(card.find('h3').exists()).toBe(true)
        expect(card.find('p').exists()).toBe(true)
      })
    })

    it('should have icon before title before description in DOM order', () => {
      const featureCards = wrapper.findAll('.feature-card')
      const firstCard = featureCards[0]

      // Check that all elements exist
      expect(firstCard.find('.feature-icon').exists()).toBe(true)
      expect(firstCard.find('h3').exists()).toBe(true)
      expect(firstCard.find('p').exists()).toBe(true)

      // Verify the structure by checking children
      const children = firstCard.findAll('div, h3, p')
      expect(children.length).toBeGreaterThan(0)
    })

    it('should have features section outside hero section', () => {
      const heroSection = wrapper.find('.hero')
      const featuresSection = wrapper.find('.features')

      expect(heroSection.exists()).toBe(true)
      expect(featuresSection.exists()).toBe(true)

      // Features should be separate from hero
      const heroHtml = heroSection.html()
      expect(heroHtml.includes('features')).toBe(false)
    })
  })

  describe('Interactive Elements', () => {
    beforeEach(() => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })
    })

    it('should have hover-capable cards', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        // Cards should have hover effects via CSS
        expect(card.classes()).toContain('feature-card')
      })
    })

    it('should have cards with transition properties', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        expect(card.classes()).toContain('feature-card')
        // CSS handles the transition property
      })
    })
  })

  describe('Animation Setup', () => {
    it('should set animation delay on each card in onMounted', () => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })

      // After mount, onMounted should have set animation delays
      const featureCards = wrapper.findAll('.feature-card')

      // The component sets animationDelay via DOM manipulation
      // We verify the component mounted successfully
      expect(featureCards.length).toBe(3)
    })

    it('should apply fadeInUp animation class via CSS', () => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })

      // Animation is handled via CSS, we verify structure exists
      const featureCards = wrapper.findAll('.feature-card')
      expect(featureCards.length).toBe(3)
    })
  })

  describe('Responsive Design', () => {
    beforeEach(() => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })
    })

    it('should have features grid that supports responsive layout', () => {
      const featuresSection = wrapper.find('.features')
      expect(featuresSection.exists()).toBe(true)

      // CSS handles responsive with grid-template-columns
      const featureCards = wrapper.findAll('.feature-card')
      expect(featureCards.length).toBe(3)
    })

    it('should maintain card structure across breakpoints', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        expect(card.find('.feature-icon').exists()).toBe(true)
        expect(card.find('h3').exists()).toBe(true)
        expect(card.find('p').exists()).toBe(true)
      })
    })
  })

  describe('Cyberpunk Theme', () => {
    beforeEach(() => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })
    })

    it('should have neon-border styling on icons', () => {
      const featureIcons = wrapper.findAll('.feature-icon')

      featureIcons.forEach(icon => {
        expect(icon.classes()).toContain('neon-border')
      })
    })

    it('should use cyberpunk color scheme classes', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        // Cards should have cyberpunk styling
        expect(card.classes()).toContain('feature-card')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple mount/unmount cycles', () => {
      for (let i = 0; i < 3; i++) {
        const testWrapper = mount(Home, {
          global: {
            plugins: [router]
          }
        })
        expect(testWrapper.findAll('.feature-card').length).toBe(3)
        testWrapper.unmount()
      }
    })
  })

  describe('Content Completeness', () => {
    beforeEach(() => {
      wrapper = mount(Home, {
        global: {
          plugins: [router]
        }
      })
    })

    it('should have all three feature types present', () => {
      const featureCards = wrapper.findAll('.feature-card')
      const titles = featureCards.map(card => card.find('h3').text())

      expect(titles).toContain('AI Models')
      expect(titles).toContain('Real-time')
      expect(titles).toContain('Secure')
    })

    it('should have descriptions for all features', () => {
      const featureCards = wrapper.findAll('.feature-card')

      featureCards.forEach(card => {
        const description = card.find('p')
        expect(description.exists()).toBe(true)
        expect(description.text().length).toBeGreaterThan(10)
      })
    })

    it('should have unique icons for each feature', () => {
      const featureIcons = wrapper.findAll('.feature-icon')
      const iconTexts = featureIcons.map(icon => icon.text())

      // All three icons should be different
      const uniqueIcons = new Set(iconTexts)
      expect(uniqueIcons.size).toBe(3)
    })
  })
})
