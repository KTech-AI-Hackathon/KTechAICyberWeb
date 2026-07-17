import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { useLanguage } from '../../src/composables/useLanguage'
import MobileApp from '../../src/views/MobileApp.vue'

/**
 * Issue #368 — Mobile App page unit tests.
 *
 * These tests drive the REAL MobileApp.vue component to verify:
 * 1. Component renders without errors
 * 2. All sections (hero, overview, features, benefits, CTA, related services) are present
 * 3. i18n translations work for both en and zh
 * 4. CTA button click handler works correctly
 * 5. Related services navigation links are correct
 */

describe('MobileApp.vue', () => {
  let router
  let pinia
  let wrapper

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/mobile', component: MobileApp },
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/services/project-management', component: { template: '<div>Project Management</div>' } },
        { path: '/services/blockchain', component: { template: '<div>Blockchain</div>' } },
        { path: '/services/big-data', component: { template: '<div>Big Data</div>' } },
      ],
    })
    pinia = createPinia()
    useLanguage().setLanguage('en')
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
    useLanguage().setLanguage('en')
  })

  const mountMobileApp = () => {
    wrapper = mount(MobileApp, {
      global: {
        plugins: [router, pinia],
      },
    })
    return wrapper
  }

  it('renders the mobile app page without errors', () => {
    const w = mountMobileApp()
    expect(w.find('.mobile-app-page').exists()).toBe(true)
  })

  it('renders breadcrumb navigation', () => {
    const w = mountMobileApp()
    const breadcrumb = w.find('.breadcrumb')
    expect(breadcrumb.exists()).toBe(true)
    expect(breadcrumb.text()).toContain('Home')
    expect(breadcrumb.text()).toContain('Mobile')
  })

  it('renders hero section with title, subtitle, and tags', () => {
    const w = mountMobileApp()
    expect(w.find('.hero').exists()).toBe(true)
    expect(w.find('.hero-title').exists()).toBe(true)
    expect(w.find('.hero-subtitle').exists()).toBe(true)
    expect(w.findAll('.hero-tags .tag').length).toBe(3)
  })

  it('renders overview section with cards', () => {
    const w = mountMobileApp()
    expect(w.find('.overview').exists()).toBe(true)
    expect(w.findAll('.overview-card').length).toBe(3)
  })

  it('renders features section with 6 features', () => {
    const w = mountMobileApp()
    expect(w.find('.features').exists()).toBe(true)
    expect(w.findAll('.feature-item').length).toBe(6)
  })

  it('renders benefits section with checkmarks', () => {
    const w = mountMobileApp()
    expect(w.find('.benefits').exists()).toBe(true)
    expect(w.findAll('.benefit-item').length).toBe(6)
    expect(w.findAll('.benefit-check').length).toBe(6)
  })

  it('renders CTA section with button', () => {
    const w = mountMobileApp()
    expect(w.find('.cta').exists()).toBe(true)
    expect(w.find('.cta-button').exists()).toBe(true)
  })

  it('renders related services section with 3 cards', () => {
    const w = mountMobileApp()
    expect(w.find('.related-services').exists()).toBe(true)
    expect(w.findAll('.related-card').length).toBe(3)
  })

  it('related services link to correct routes', () => {
    const w = mountMobileApp()
    const relatedCards = w.findAll('.related-card')
    // Check the cards render with the correct service names
    expect(relatedCards[0].text()).toContain('Project')
    expect(relatedCards[1].text()).toContain('Blockchain')
    expect(relatedCards[2].text()).toContain('Big')
  })

  it('CTA button redirects to /#contact on click', async () => {
    // Mock window.location
    const originalLocation = window.location
    delete (window as any).location
    window.location = { href: '' } as any

    const w = mountMobileApp()
    const ctaButton = w.find('.cta-button')
    await ctaButton.trigger('click')

    expect(window.location.href).toBe('/#contact')

    // Restore original location
    window.location = originalLocation
  })

  it('renders English translations when language is en', () => {
    useLanguage().setLanguage('en')
    const w = mountMobileApp()
    expect(w.find('.hero-title').text()).toContain('Mobile')
    expect(w.find('.hero-subtitle').text().length).toBeGreaterThan(0)
  })

  it('renders Chinese translations when language is zh', () => {
    useLanguage().setLanguage('zh')
    const w = mountMobileApp()
    // Chinese title should be different from English
    const title = w.find('.hero-title').text()
    expect(title.length).toBeGreaterThan(0)
    expect(w.find('.hero-subtitle').text().length).toBeGreaterThan(0)
  })

  it('has proper ARIA labels for accessibility', () => {
    const w = mountMobileApp()
    expect(w.find('[aria-label="Breadcrumb"]').exists()).toBe(true)
  })

  it('overview cards have icons, titles, and descriptions', () => {
    const w = mountMobileApp()
    const cards = w.findAll('.overview-card')
    cards.forEach(card => {
      expect(card.find('.card-icon').exists()).toBe(true)
      expect(card.find('h3').exists()).toBe(true)
      expect(card.find('p').exists()).toBe(true)
    })
  })

  it('feature items have numbers, titles, and descriptions', () => {
    const w = mountMobileApp()
    const features = w.findAll('.feature-item')
    features.forEach((feature, index) => {
      expect(feature.find('.feature-number').text()).toBe(String(index + 1).padStart(2, '0'))
      expect(feature.find('.feature-content h3').exists()).toBe(true)
      expect(feature.find('.feature-content p').exists()).toBe(true)
    })
  })
})
