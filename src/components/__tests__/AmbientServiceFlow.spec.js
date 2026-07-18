import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AmbientServiceFlow from '../AmbientServiceFlow.vue'

describe('AmbientServiceFlow.vue', () => {
  let router

  beforeEach(() => {
    vi.useFakeTimers()

    // Mock router
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/services/supply-chain-finance', component: { template: '<div>Supply Chain</div>' } }
      ]
    })

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
    global.cancelAnimationFrame = vi.fn()

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn(function(callback, options) {
      this.callback = callback
      this.options = options
      this.observe = vi.fn()
      this.unobserve = vi.fn()
      this.disconnect = vi.fn()
    })

    // Mock matchMedia
    global.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('component rendering', () => {
    it('should render canvas element', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'supply-chain-finance'
        },
        global: {
          plugins: [router]
        }
      })

      const canvas = wrapper.find('canvas')
      expect(canvas.exists()).toBe(true)
    })

    it('should have correct aria-label', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'supply-chain-finance'
        },
        global: {
          plugins: [router]
        }
      })

      const canvas = wrapper.find('canvas')
      expect(canvas.attributes('aria-label')).toBeTruthy()
      expect(canvas.attributes('aria-label').length).toBeGreaterThan(0)
    })

    it('should have role="img" for accessibility', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'supply-chain-finance'
        },
        global: {
          plugins: [router]
        }
      })

      const canvas = wrapper.find('canvas')
      expect(canvas.attributes('role')).toBe('img')
    })

    it('should accept serviceType prop', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'big-data-ai'
        },
        global: {
          plugins: [router]
        }
      })

      expect(wrapper.props('serviceType')).toBe('big-data-ai')
    })

    it('should validate serviceType prop', () => {
      // Valid service types should work
      const validTypes = [
        'supply-chain-finance',
        'big-data-ai',
        'retail-lending',
        'project-management',
        'digital-asset-custody',
        'stablecoin',
        'cross-border-payment'
      ]

      validTypes.forEach(type => {
        expect(() => {
          mount(AmbientServiceFlow, {
            props: { serviceType: type },
            global: { plugins: [router] }
          })
        }).not.toThrow()
      })
    })
  })

  describe('cyber styling', () => {
    it('should have ambient-service-flow class', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'supply-chain-finance'
        },
        global: {
          plugins: [router]
        }
      })

      const container = wrapper.find('.ambient-service-flow')
      expect(container.exists()).toBe(true)
    })

    it('should apply cyber-theme class', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'supply-chain-finance'
        },
        global: {
          plugins: [router]
        }
      })

      const container = wrapper.find('.ambient-service-flow')
      expect(container.classes()).toContain('cyber-theme')
    })

    it('should apply service-specific class', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'big-data-ai'
        },
        global: {
          plugins: [router]
        }
      })

      const container = wrapper.find('.ambient-service-flow')
      expect(container.classes()).toContain('service-big-data-ai')
    })
  })

  describe('accessibility features', () => {
    it('should provide animation status for screen readers', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'supply-chain-finance'
        },
        global: {
          plugins: [router]
        }
      })

      const status = wrapper.find('.animation-status')
      expect(status.exists()).toBe(true)
      expect(status.attributes('aria-live')).toBe('polite')
    })

    it('should have proper canvas semantics', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'supply-chain-finance'
        },
        global: {
          plugins: [router]
        }
      })

      const canvas = wrapper.find('canvas')
      expect(canvas.attributes('role')).toBe('img')
      expect(canvas.attributes('aria-label')).toBeTruthy()
    })
  })

  describe('error handling', () => {
    it('should handle mounting gracefully', () => {
      expect(() => {
        mount(AmbientServiceFlow, {
          props: {
            serviceType: 'supply-chain-finance'
          },
          global: {
            plugins: [router]
          }
        })
      }).not.toThrow()
    })

    it('should handle unmounting gracefully', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'supply-chain-finance'
        },
        global: {
          plugins: [router]
        }
      })

      expect(() => wrapper.unmount()).not.toThrow()
    })
  })

  describe('responsive behavior', () => {
    it('should render with proper container structure', () => {
      const wrapper = mount(AmbientServiceFlow, {
        props: {
          serviceType: 'supply-chain-finance'
        },
        global: {
          plugins: [router]
        }
      })

      const container = wrapper.find('.ambient-service-flow')
      expect(container.exists()).toBe(true)

      const canvas = wrapper.find('canvas')
      expect(canvas.exists()).toBe(true)
    })
  })

  describe('service type variations', () => {
    const serviceTypes = [
      'supply-chain-finance',
      'big-data-ai',
      'retail-lending',
      'project-management',
      'digital-asset-custody',
      'stablecoin',
      'cross-border-payment'
    ]

    serviceTypes.forEach(serviceType => {
      it(`should render ${serviceType} correctly`, () => {
        const wrapper = mount(AmbientServiceFlow, {
          props: { serviceType },
          global: { plugins: [router] }
        })

        const canvas = wrapper.find('canvas')
        expect(canvas.exists()).toBe(true)

        const container = wrapper.find('.ambient-service-flow')
        expect(container.classes()).toContain(`service-${serviceType}`)
      })
    })
  })
})
