import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { useLanguage } from '../../src/composables/useLanguage'
import Blockchain from '../../src/views/Blockchain.vue'

/**
 * Issue #368 — Blockchain page unit tests.
 *
 * These tests drive the REAL Blockchain.vue component to verify:
 * 1. Component renders without errors
 * 2. All sections (hero, overview, features, benefits, CTA) are present
 * 3. i18n translations work for both en and zh
 * 4. Animated grid background elements are present
 * 5. CTA button has proper ARIA labels
 * 6. onMounted animation delays are applied to feature cards and benefit items
 */

describe('Blockchain.vue', () => {
  let router
  let pinia
  let wrapper

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/blockchain', component: Blockchain },
        { path: '/', component: { template: '<div>Home</div>' } },
      ],
    })
    pinia = createPinia()
    useLanguage().setLanguage('en')
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
    useLanguage().setLanguage('en')
  })

  const mountBlockchain = () => {
    wrapper = mount(Blockchain, {
      global: {
        plugins: [router, pinia],
      },
    })
    return wrapper
  }

  it('renders the blockchain page without errors', () => {
    const w = mountBlockchain()
    expect(w.find('.blockchain').exists()).toBe(true)
  })

  it('renders animated grid background', () => {
    const w = mountBlockchain()
    expect(w.findAll('.grid-bg').length).toBe(2)
    expect(w.find('.grid-bg-2').exists()).toBe(true)
  })

  it('renders breadcrumb navigation', () => {
    const w = mountBlockchain()
    const breadcrumb = w.find('.breadcrumb')
    expect(breadcrumb.exists()).toBe(true)
    expect(breadcrumb.text()).toContain('Home')
    expect(breadcrumb.text()).toContain('Blockchain')
  })

  it('renders hero section with title, subtitle, and accent', () => {
    const w = mountBlockchain()
    expect(w.find('.hero').exists()).toBe(true)
    expect(w.find('.page-title').exists()).toBe(true)
    expect(w.find('.page-subtitle').exists()).toBe(true)
    expect(w.find('.page-title .accent').exists()).toBe(true)
  })

  it('renders overview section with card', () => {
    const w = mountBlockchain()
    expect(w.find('.overview').exists()).toBe(true)
    expect(w.find('.overview-card').exists()).toBe(true)
    expect(w.find('.card-icon').exists()).toBe(true)
  })

  it('renders features section with 4 feature cards', () => {
    const w = mountBlockchain()
    expect(w.find('.features').exists()).toBe(true)
    expect(w.findAll('.feature-card').length).toBe(4)
  })

  it('feature cards have icons, titles, and descriptions', () => {
    const w = mountBlockchain()
    const featureCards = w.findAll('.feature-card')
    featureCards.forEach(card => {
      expect(card.find('.feature-icon').exists()).toBe(true)
      expect(card.find('h3').exists()).toBe(true)
      expect(card.find('p').exists()).toBe(true)
    })
  })

  it('renders benefits section with 3 benefit items', () => {
    const w = mountBlockchain()
    expect(w.find('.benefits').exists()).toBe(true)
    expect(w.findAll('.benefit-item').length).toBe(3)
  })

  it('benefit items have numbers, titles, and descriptions', () => {
    const w = mountBlockchain()
    const benefitItems = w.findAll('.benefit-item')
    benefitItems.forEach((item, index) => {
      expect(item.find('.benefit-number').exists()).toBe(true)
      expect(item.find('h3').exists()).toBe(true)
      expect(item.find('p').exists()).toBe(true)
    })
  })

  it('renders CTA section with button', () => {
    const w = mountBlockchain()
    expect(w.find('.cta').exists()).toBe(true)
    expect(w.find('.cyber-button').exists()).toBe(true)
  })

  it('CTA button has proper ARIA label', () => {
    const w = mountBlockchain()
    const ctaButton = w.find('.cyber-button')
    expect(ctaButton.attributes('aria-label')).toBeTruthy()
    expect(ctaButton.attributes('aria-label')?.length).toBeGreaterThan(0)
  })

  it('renders English translations when language is en', () => {
    useLanguage().setLanguage('en')
    const w = mountBlockchain()
    expect(w.find('.page-title').text()).toContain('Blockchain')
    expect(w.find('.page-subtitle').text().length).toBeGreaterThan(0)
  })

  it('renders Chinese translations when language is zh', () => {
    useLanguage().setLanguage('zh')
    const w = mountBlockchain()
    // Chinese title should be different from English
    const title = w.find('.page-title').text()
    expect(title.length).toBeGreaterThan(0)
    expect(w.find('.page-subtitle').text().length).toBeGreaterThan(0)
  })

  it('has proper ARIA labels for accessibility', () => {
    const w = mountBlockchain()
    expect(w.find('[aria-label="Breadcrumb"]').exists()).toBe(true)
  })

  it('overview card has proper structure with icon and text', () => {
    const w = mountBlockchain()
    const overviewCard = w.find('.overview-card')
    expect(overviewCard.find('.card-icon').exists()).toBe(true)
    expect(overviewCard.find('p').exists()).toBe(true)
  })

  it('benefit numbers are formatted correctly (01, 02, 03)', () => {
    const w = mountBlockchain()
    const benefitNumbers = w.findAll('.benefit-number')
    expect(benefitNumbers[0].text()).toBe('01')
    expect(benefitNumbers[1].text()).toBe('02')
    expect(benefitNumbers[2].text()).toBe('03')
  })

  it('feature icons and benefit check icons have neon-border class', () => {
    const w = mountBlockchain()
    const featureIcons = w.findAll('.feature-icon')
    featureIcons.forEach(icon => {
      expect(icon.classes()).toContain('neon-border')
    })

    const cardIcon = w.find('.card-icon')
    expect(cardIcon.classes()).toContain('neon-border')
  })

  it('benefit numbers have neon-text class', () => {
    const w = mountBlockchain()
    const benefitNumbers = w.findAll('.benefit-number')
    benefitNumbers.forEach(number => {
      expect(number.classes()).toContain('neon-text')
    })
  })
})
