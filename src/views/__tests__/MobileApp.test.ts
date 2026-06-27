/**
 * @file MobileApp.test.ts
 * @description Unit tests for the Mobile App service detail view
 *
 * Test Categories:
 * - Rendering Tests: section structure and landmark counts
 * - Content Tests: i18n-driven copy for hero, overview, features, benefits, CTA,
 *   related services, plus static icon/emoji rendering
 * - Accessibility Tests: breadcrumb landmark, single h1, heading hierarchy,
 *   aria-hidden on decorative icons, router-link navigation targets
 * - Behavior Tests: CTA button sets window.location.href to the contact anchor
 * - Edge Cases: re-mount consistency
 *
 * The view pulls translations through useLanguage(), which is mocked to return
 * real English strings so assertions check rendered values (not bare keys).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import MobileApp from '../MobileApp.vue'
import RouterLinkStub from '../../components/__tests__/RouterLinkStub.vue'

// Realistic translations so assertions check rendered content, not just keys.
const mockTranslations: Record<string, string> = {
  'nav.home': 'Home',
  'mobileApp.title': 'Mobile App',
  'mobileApp.hero.title': 'Build Mobile Apps',
  'mobileApp.hero.accent': 'That Delight Users',
  'mobileApp.hero.subtitle': 'Native and cross-platform mobile engineering.',
  'mobileApp.hero.tag1': 'iOS',
  'mobileApp.hero.tag2': 'Android',
  'mobileApp.hero.tag3': 'Cross-Platform',
  'mobileApp.overview.title': 'Overview',
  'mobileApp.overview.description': 'Three pillars of mobile delivery.',
  'mobileApp.overview.card1Title': 'Native iOS',
  'mobileApp.overview.card1Desc': 'Swift and Objective-C.',
  'mobileApp.overview.card2Title': 'Secure',
  'mobileApp.overview.card2Desc': 'Bank-grade encryption.',
  'mobileApp.overview.card3Title': 'Fast',
  'mobileApp.overview.card3Desc': 'Sub-second launches.',
  'mobileApp.features.title': 'Key Features',
  'mobileApp.features.feature1Title': 'Offline First',
  'mobileApp.features.feature1Desc': 'Works without a network.',
  'mobileApp.features.feature2Title': 'Push Notifications',
  'mobileApp.features.feature2Desc': 'Re-engage users instantly.',
  'mobileApp.features.feature3Title': 'Biometric Auth',
  'mobileApp.features.feature3Desc': 'Face ID and fingerprint.',
  'mobileApp.features.feature4Title': 'Analytics',
  'mobileApp.features.feature4Desc': 'Track engagement metrics.',
  'mobileApp.features.feature5Title': 'Localization',
  'mobileApp.features.feature5Desc': 'Multi-language support.',
  'mobileApp.features.feature6Title': 'Dark Mode',
  'mobileApp.features.feature6Desc': 'Theme-aware interfaces.',
  'mobileApp.benefits.title': 'Why Choose Us',
  'mobileApp.benefits.description': 'Tangible outcomes for our clients.',
  'mobileApp.benefits.benefit1': 'Faster time to market',
  'mobileApp.benefits.benefit2': 'Lower maintenance cost',
  'mobileApp.benefits.benefit3': 'Higher user retention',
  'mobileApp.benefits.benefit4': 'Cross-platform reach',
  'mobileApp.benefits.benefit5': 'Enterprise security',
  'mobileApp.benefits.benefit6': 'Scalable architecture',
  'mobileApp.cta.title': 'Start Your Project',
  'mobileApp.cta.description': 'Tell us about your mobile goals.',
  'mobileApp.cta.button': 'Contact Us',
  'mobileApp.related.title': 'Related Services',
  'services.projectManagement': 'Project Management',
  'services.blockchain': 'Blockchain',
  'services.bigData': 'Big Data',
}

vi.mock('../../composables/useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: { value: 'en' },
    languageDisplay: { value: 'EN' },
    isEnglish: { value: true },
    initLanguage: vi.fn(),
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    t: (key: string) => mockTranslations[key] || key,
  }),
}))

describe('MobileApp.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(MobileApp, {
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
    it('renders the root .mobile-app-page container', () => {
      expect(wrapper.find('.mobile-app-page').exists()).toBe(true)
    })

    it('renders the breadcrumb navigation', () => {
      expect(wrapper.find('nav[aria-label="Breadcrumb"]').exists()).toBe(true)
    })

    it('renders the hero section', () => {
      expect(wrapper.find('section.hero').exists()).toBe(true)
    })

    it('renders the animated grid overlay inside the hero background', () => {
      expect(wrapper.find('.hero .grid-overlay').exists()).toBe(true)
    })

    it('renders the overview, features, benefits, CTA and related sections', () => {
      expect(wrapper.find('section.overview').exists()).toBe(true)
      expect(wrapper.find('section.features').exists()).toBe(true)
      expect(wrapper.find('section.benefits').exists()).toBe(true)
      expect(wrapper.find('section.cta').exists()).toBe(true)
      expect(wrapper.find('section.related-services').exists()).toBe(true)
    })

    it('renders exactly three overview cards', () => {
      expect(wrapper.findAll('.overview-card')).toHaveLength(3)
    })

    it('renders exactly six feature items', () => {
      expect(wrapper.findAll('.feature-item')).toHaveLength(6)
    })

    it('renders exactly six benefit items', () => {
      expect(wrapper.findAll('.benefit-item')).toHaveLength(6)
    })

    it('renders exactly three related service cards as router-links', () => {
      const cards = wrapper.findAll('.related-card')
      expect(cards).toHaveLength(3)
      cards.forEach((card) => {
        expect(card.element.tagName.toLowerCase()).toBe('a')
      })
    })

    it('renders the CTA as a <button> element', () => {
      const cta = wrapper.find('.cta .cta-button')
      expect(cta.exists()).toBe(true)
      expect(cta.element.tagName.toLowerCase()).toBe('button')
    })

    it('renders three hero tags', () => {
      expect(wrapper.findAll('.hero-tags .tag')).toHaveLength(3)
    })
  })

  // ============================================
  // Content Tests (real rendered values)
  // ============================================
  describe('Content', () => {
    it('renders the hero title and accent on separate spans', () => {
      const h1 = wrapper.find('.hero h1')
      expect(h1.text()).toContain('Build Mobile Apps')
      expect(h1.find('.accent').text()).toBe('That Delight Users')
    })

    it('renders the hero subtitle value', () => {
      expect(wrapper.find('.hero-subtitle').text()).toBe(
        'Native and cross-platform mobile engineering.'
      )
    })

    it('renders the three hero tag values', () => {
      const tags = wrapper.findAll('.hero-tags .tag').map((t) => t.text())
      expect(tags).toEqual(['iOS', 'Android', 'Cross-Platform'])
    })

    it('renders overview card icons as emoji glyphs', () => {
      const icons = wrapper.findAll('.overview-card .card-icon').map((i) => i.text())
      expect(icons).toEqual(['📱', '🔒', '⚡'])
    })

    it('renders overview card titles and descriptions from i18n', () => {
      const cards = wrapper.findAll('.overview-card')
      expect(cards[0].find('h3').text()).toBe('Native iOS')
      expect(cards[0].find('p').text()).toBe('Swift and Objective-C.')
      expect(cards[2].find('h3').text()).toBe('Fast')
    })

    it('renders sequential zero-padded numbers on feature items', () => {
      const numbers = wrapper.findAll('.feature-number').map((n) => n.text())
      expect(numbers).toEqual(['01', '02', '03', '04', '05', '06'])
    })

    it('renders feature titles and descriptions', () => {
      const items = wrapper.findAll('.feature-item')
      expect(items[0].find('h3').text()).toBe('Offline First')
      expect(items[0].find('p').text()).toBe('Works without a network.')
      expect(items[5].find('h3').text()).toBe('Dark Mode')
    })

    it('renders a check mark on every benefit item', () => {
      const checks = wrapper.findAll('.benefit-check')
      expect(checks).toHaveLength(6)
      checks.forEach((c) => expect(c.text()).toBe('✓'))
    })

    it('renders the benefit text values', () => {
      const spans = wrapper.findAll('.benefit-item span').map((s) => s.text())
      expect(spans).toContain('Faster time to market')
      expect(spans).toContain('Enterprise security')
    })

    it('renders the CTA title, description and button label', () => {
      const cta = wrapper.find('.cta')
      expect(cta.find('h2').text()).toBe('Start Your Project')
      expect(cta.find('p').text()).toBe('Tell us about your mobile goals.')
      expect(cta.find('button').text()).toBe('Contact Us')
    })

    it('renders the related service icons and titles', () => {
      const cards = wrapper.findAll('.related-card')
      expect(cards[0].find('.card-icon').text()).toBe('🏗️')
      expect(cards[0].find('h3').text()).toBe('Project Management')
      expect(cards[2].find('h3').text()).toBe('Big Data')
    })
  })

  // ============================================
  // Navigation / Interaction
  // ============================================
  describe('Navigation', () => {
    it('links the breadcrumb home to /', () => {
      const home = wrapper.find('nav[aria-label="Breadcrumb"] a[href="/"]')
      expect(home.exists()).toBe(true)
      expect(home.text()).toBe('Home')
    })

    it('renders the current page name as plain text in the breadcrumb', () => {
      const current = wrapper.find('.breadcrumb > span:last-of-type')
      expect(current.exists()).toBe(true)
      expect(current.element.tagName.toLowerCase()).toBe('span')
      expect(current.text()).toBe('Mobile App')
    })

    it('points each related card to its service detail route', () => {
      const hrefs = wrapper.findAll('.related-card').map((c) => c.attributes('href'))
      expect(hrefs).toEqual([
        '/services/project-management',
        '/services/blockchain',
        '/services/big-data',
      ])
    })

    it('sets window.location.href to the contact anchor when the CTA is clicked', async () => {
      const original = window.location
      const hrefSetter = vi.fn()
      // window.location is not fully reassignable under JSDOM; spy on the
      // href setter via a defining property on the prototype.
      const descriptor = Object.getOwnPropertyDescriptor(window, 'location')
      try {
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: new Proxy(original, {
            set(target, prop, value) {
              if (prop === 'href') {
                hrefSetter(value)
                return true
              }
              return Reflect.set(target, prop, value)
            },
          }),
        })
        await wrapper.find('.cta-button').trigger('click')
        expect(hrefSetter).toHaveBeenCalledWith('/#contact')
      } finally {
        if (descriptor) Object.defineProperty(window, 'location', descriptor)
      }
    })
  })

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('Accessibility', () => {
    it('uses exactly one h1 for the page title', () => {
      expect(wrapper.findAll('h1')).toHaveLength(1)
    })

    it('uses an h2 for every section title (overview, features, benefits, cta, related)', () => {
      expect(wrapper.findAll('h2')).toHaveLength(5)
    })

    it('uses h3 for every overview card and related card title', () => {
      // 3 overview cards + 6 feature items + 3 related cards = 12 h3s
      expect(wrapper.findAll('h3')).toHaveLength(12)
    })

    it('hides decorative card icons and check marks from assistive tech', () => {
      const icons = wrapper.findAll('.overview-card .card-icon')
      icons.forEach((icon) => {
        expect(icon.attributes('aria-hidden')).toBe('true')
      })
      wrapper.findAll('.benefit-check').forEach((check) => {
        expect(check.attributes('aria-hidden')).toBe('true')
      })
    })

    it('hides the feature-number decoration from assistive tech', () => {
      wrapper.findAll('.feature-number').forEach((num) => {
        expect(num.attributes('aria-hidden')).toBe('true')
      })
    })

    it('labels the breadcrumb nav region', () => {
      expect(wrapper.find('nav[aria-label="Breadcrumb"]').exists()).toBe(true)
    })
  })

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('renders a consistent structure across repeated mounts', () => {
      const w1 = mount(MobileApp, {
        global: { stubs: { 'router-link': RouterLinkStub } },
      })
      const w2 = mount(MobileApp, {
        global: { stubs: { 'router-link': RouterLinkStub } },
      })
      expect(w1.findAll('section').length).toBe(w2.findAll('section').length)
      expect(w1.findAll('.feature-item').length).toBe(w2.findAll('.feature-item').length)
      expect(w1.findAll('.related-card').length).toBe(w2.findAll('.related-card').length)
      w1.unmount()
      w2.unmount()
    })
  })
})
