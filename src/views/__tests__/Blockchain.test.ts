/**
 * @file Blockchain.test.ts
 * @description Unit tests for the Blockchain service detail view
 *
 * Test Categories:
 * - Rendering Tests: Component mount and section structure
 * - Content Tests: All required sections present (hero, overview, features,
 *   benefits, CTA) with their i18n keys
 * - Accessibility Tests: Breadcrumb landmark, single h1, heading hierarchy
 * - i18n Tests: Translation function behavior and key fallback
 * - Behavior Tests: onMounted animation-delay side effects on cards/items
 * - Edge Cases: re-mount consistency, CTA aria-label
 *
 * Note: useLanguage() returns the key itself as fallback when no translations
 * are loaded in the test environment, so content assertions check for keys.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Blockchain from '../Blockchain.vue'

// Stub router-link so rendered links keep their href attribute and can be
// queried via a[href="..."], mirroring how the rest of the suite stubs the
// router when mounting an isolated view.
const RouterLinkStub = {
  name: 'RouterLinkStub',
  props: { to: { type: [String, Object], default: '' } },
  computed: {
    href() {
      return typeof this.to === 'string' ? this.to : (this.to && this.to.path) || ''
    },
  },
  template: '<a :href="href"><slot /></a>',
}

describe('Blockchain.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(Blockchain, {
      global: {
        stubs: {
          'router-link': RouterLinkStub,
        },
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  // ============================================
  // Rendering Tests
  // ============================================
  describe('Rendering', () => {
    it('should mount without errors', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('renders the root .blockchain container', () => {
      expect(wrapper.find('.blockchain').exists()).toBe(true)
    })

    it('renders the hero section', () => {
      expect(wrapper.find('.hero').exists()).toBe(true)
    })

    it('renders the page title as an h1 inside the hero', () => {
      const h1 = wrapper.find('.hero h1')
      expect(h1.exists()).toBe(true)
      expect(h1.element.tagName.toLowerCase()).toBe('h1')
    })

    it('renders the hero accent span', () => {
      expect(wrapper.find('.hero .accent').exists()).toBe(true)
    })

    it('renders the overview section', () => {
      expect(wrapper.find('.overview').exists()).toBe(true)
    })

    it('renders the features section', () => {
      expect(wrapper.find('.features').exists()).toBe(true)
    })

    it('renders the benefits section', () => {
      expect(wrapper.find('.benefits').exists()).toBe(true)
    })

    it('renders the CTA section', () => {
      expect(wrapper.find('.cta').exists()).toBe(true)
    })

    it('renders exactly four feature cards', () => {
      expect(wrapper.findAll('.feature-card')).toHaveLength(4)
    })

    it('renders exactly three benefit items', () => {
      expect(wrapper.findAll('.benefit-item')).toHaveLength(3)
    })

    it('renders the breadcrumb navigation', () => {
      expect(wrapper.find('nav[aria-label="Breadcrumb"]').exists()).toBe(true)
    })

    it('renders a home router-link in the breadcrumb', () => {
      const breadcrumb = wrapper.find('nav[aria-label="Breadcrumb"]')
      expect(breadcrumb.find('a[href="/"]').exists()).toBe(true)
    })

    it('renders the CTA as a button (not a router-link)', () => {
      const cta = wrapper.find('.cta .cyber-button')
      expect(cta.exists()).toBe(true)
      expect(cta.element.tagName.toLowerCase()).toBe('button')
    })

    it('renders two animated background grid layers', () => {
      expect(wrapper.findAll('.grid-bg')).toHaveLength(2)
    })
  })

  // ============================================
  // Content Tests (i18n key fallback)
  // ============================================
  describe('Content', () => {
    it('renders the hero title and accent keys', () => {
      const text = wrapper.text()
      expect(text).toContain('blockchain.hero.title')
      expect(text).toContain('blockchain.hero.accent')
    })

    it('renders the hero subtitle key', () => {
      expect(wrapper.text()).toContain('blockchain.hero.subtitle')
    })

    it('renders the breadcrumb label key', () => {
      expect(wrapper.text()).toContain('blockchain.breadcrumb')
    })

    it('renders the overview title, description and detail keys', () => {
      const text = wrapper.text()
      expect(text).toContain('blockchain.overview.title')
      expect(text).toContain('blockchain.overview.description')
      expect(text).toContain('blockchain.overview.detail')
    })

    it('renders the features section title key', () => {
      expect(wrapper.text()).toContain('blockchain.features.title')
    })

    it('renders all four feature title keys', () => {
      const text = wrapper.text()
      expect(text).toContain('blockchain.features.distributed.title')
      expect(text).toContain('blockchain.features.security.title')
      expect(text).toContain('blockchain.features.efficiency.title')
      expect(text).toContain('blockchain.features.traceability.title')
    })

    it('renders all four feature description keys', () => {
      const text = wrapper.text()
      expect(text).toContain('blockchain.features.distributed.description')
      expect(text).toContain('blockchain.features.security.description')
      expect(text).toContain('blockchain.features.efficiency.description')
      expect(text).toContain('blockchain.features.traceability.description')
    })

    it('renders the benefits section title key', () => {
      expect(wrapper.text()).toContain('blockchain.benefits.title')
    })

    it('renders all three benefit title keys', () => {
      const text = wrapper.text()
      expect(text).toContain('blockchain.benefits.trust.title')
      expect(text).toContain('blockchain.benefits.cost.title')
      expect(text).toContain('blockchain.benefits.speed.title')
    })

    it('renders the numeric labels 01, 02, 03 for the benefit items', () => {
      const numbers = wrapper.findAll('.benefit-number').map((n) => n.text())
      expect(numbers).toEqual(['01', '02', '03'])
    })

    it('renders the CTA title, description and button keys', () => {
      const text = wrapper.text()
      expect(text).toContain('blockchain.cta.title')
      expect(text).toContain('blockchain.cta.description')
      expect(text).toContain('blockchain.cta.button')
    })
  })

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('Accessibility', () => {
    it('uses exactly one h1 for the page title', () => {
      expect(wrapper.findAll('h1')).toHaveLength(1)
    })

    it('uses h2 for each section title', () => {
      // overview, features, benefits, cta => 4 section h2s
      expect(wrapper.findAll('h2')).toHaveLength(4)
    })

    it('uses h3 for every feature and benefit card title', () => {
      // 4 features + 3 benefits = 7 h3s
      expect(wrapper.findAll('h3')).toHaveLength(7)
    })

    it('labels the breadcrumb nav region', () => {
      const nav = wrapper.find('nav[aria-label="Breadcrumb"]')
      expect(nav.exists()).toBe(true)
    })

    it('provides an aria-label on the CTA button', () => {
      const button = wrapper.find('.cta .cyber-button')
      expect(button.attributes('aria-label')).toBe('blockchain.cta.ariaLabel')
    })

    it('exposes the home link for keyboard/screen-reader navigation', () => {
      const homeLink = wrapper.find('nav[aria-label="Breadcrumb"] a[href="/"]')
      expect(homeLink.exists()).toBe(true)
    })
  })

  // ============================================
  // Behavior Tests (onMounted side effects)
  // ============================================
  describe('Behavior', () => {
    // The view computes delays as index * 0.1 (features) and index * 0.15
    // (benefits), which produces floating-point artifacts. Parse the seconds
    // value rather than comparing against a string literal.
    const extractDelay = (style: string): number | null => {
      const match = style.match(/animation-delay:\s*([\d.]+)s/)
      return match ? parseFloat(match[1]) : null
    }

    // The view's onMounted uses document.querySelectorAll to set per-card
    // animation-delay inline styles. That only finds elements attached to the
    // real document, so these tests mount with attachTo: document.body to drive
    // the real lifecycle rather than inspecting wrapper internals.
    it('applies staggered animation-delay to feature cards on mount', async () => {
      document.querySelectorAll('.feature-card').forEach((el) => el.remove())
      const w = mount(Blockchain, {
        attachTo: document.body,
        global: { stubs: { 'router-link': RouterLinkStub } },
      })
      await w.vm.$nextTick()
      expect(document.querySelectorAll('.feature-card')).toHaveLength(4)
      const delays = Array.from(document.querySelectorAll('.feature-card')).map(
        (el) => extractDelay((el as HTMLElement).getAttribute('style') || '')
      )
      expect(delays[0]).toBeCloseTo(0, 5)
      expect(delays[1]).toBeCloseTo(0.1, 5)
      expect(delays[2]).toBeCloseTo(0.2, 5)
      expect(delays[3]).toBeCloseTo(0.3, 5)
      w.unmount()
    })

    it('applies staggered animation-delay to benefit items on mount', async () => {
      document.querySelectorAll('.benefit-item').forEach((el) => el.remove())
      const w = mount(Blockchain, {
        attachTo: document.body,
        global: { stubs: { 'router-link': RouterLinkStub } },
      })
      await w.vm.$nextTick()
      expect(document.querySelectorAll('.benefit-item')).toHaveLength(3)
      const delays = Array.from(document.querySelectorAll('.benefit-item')).map(
        (el) => extractDelay((el as HTMLElement).getAttribute('style') || '')
      )
      expect(delays[0]).toBeCloseTo(0, 5)
      expect(delays[1]).toBeCloseTo(0.15, 5)
      expect(delays[2]).toBeCloseTo(0.3, 5)
      w.unmount()
    })
  })

  // ============================================
  // i18n Tests
  // ============================================
  describe('Internationalization', () => {
    it('exposes a translation function on the component instance', () => {
      expect(typeof (wrapper.vm as any).t).toBe('function')
    })

    it('returns the key as fallback when translation is not loaded', () => {
      const result = (wrapper.vm as any).t('blockchain.hero.title')
      expect(result).toBe('blockchain.hero.title')
    })
  })

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('renders consistently across multiple mounts', () => {
      const w1 = mount(Blockchain, { global: { stubs: { 'router-link': RouterLinkStub } } })
      const w2 = mount(Blockchain, { global: { stubs: { 'router-link': RouterLinkStub } } })
      expect(w1.findAll('section').length).toBe(w2.findAll('section').length)
      expect(w1.findAll('.feature-card').length).toBe(w2.findAll('.feature-card').length)
      w1.unmount()
      w2.unmount()
    })
  })
})
