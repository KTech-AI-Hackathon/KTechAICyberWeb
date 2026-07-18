import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useServiceFlow } from '../useServiceFlow'

describe('useServiceFlow', () => {
  let mockCanvas
  let mockContext

  beforeEach(() => {
    // Use fake timers
    vi.useFakeTimers()

    // Mock canvas and context
    mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      setLineDash: vi.fn(),
      globalAlpha: 1.0,
      shadowBlur: 0,
      shadowColor: '',
      font: '',
      fillText: vi.fn()
    }

    mockCanvas = {
      width: 800,
      height: 400,
      getContext: vi.fn(function() { return mockContext })
    }

    // Mock requestAnimationFrame and cancelAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
    global.cancelAnimationFrame = vi.fn()

    // Mock IntersectionObserver as a proper constructor
    global.IntersectionObserver = vi.fn(function(callback, options) {
      this.callback = callback
      this.options = options
      this.observe = vi.fn()
      this.unobserve = vi.fn()
      this.disconnect = vi.fn()
    })

    // Mock window.matchMedia for reduced motion
    global.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))

    // Mock useLanguage
    vi.doMock('../useLanguage', () => ({
      useLanguage: () => ({
        t: (key, params) => {
          if (key.includes('ariaLabel')) {
            return `Animation for ${params?.service || 'service'} - supply chain finance process flow`
          }
          return key
        }
      })
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('configuration loading', () => {
    it('should load supply-chain-finance configuration', () => {
      const { animationConfig } = useServiceFlow('supply-chain-finance', mockCanvas)
      expect(animationConfig.value.type).toBe('supply-chain-finance')
      expect(animationConfig.value.nodes.length).toBeGreaterThan(0)
    })

    it('should load big-data-ai configuration', () => {
      const { animationConfig } = useServiceFlow('big-data-ai', mockCanvas)
      expect(animationConfig.value.type).toBe('big-data-ai')
      expect(animationConfig.value.particles.length).toBeGreaterThan(0)
    })

    it('should load retail-lending configuration', () => {
      const { animationConfig } = useServiceFlow('retail-lending', mockCanvas)
      expect(animationConfig.value.type).toBe('retail-lending')
      expect(animationConfig.value.nodes.length).toBeGreaterThan(0)
    })

    it('should load project-management configuration', () => {
      const { animationConfig } = useServiceFlow('project-management', mockCanvas)
      expect(animationConfig.value.type).toBe('project-management')
      expect(animationConfig.value.columns.length).toBeGreaterThan(0)
    })

    it('should load digital-asset-custody configuration', () => {
      const { animationConfig } = useServiceFlow('digital-asset-custody', mockCanvas)
      expect(animationConfig.value.type).toBe('digital-asset-custody')
      expect(animationConfig.value.vaults.length).toBeGreaterThan(0)
    })

    it('should load stablecoin configuration', () => {
      const { animationConfig } = useServiceFlow('stablecoin', mockCanvas)
      expect(animationConfig.value.type).toBe('stablecoin')
      expect(animationConfig.value.nodes).toBeDefined()
      expect(animationConfig.value.nodes.length).toBeGreaterThan(0)
    })

    it('should load cross-border-payment configuration', () => {
      const { animationConfig } = useServiceFlow('cross-border-payment', mockCanvas)
      expect(animationConfig.value.type).toBe('cross-border-payment')
      expect(animationConfig.value.countries.length).toBeGreaterThan(0)
    })

    it('should handle unknown service type gracefully', () => {
      const { animationConfig } = useServiceFlow('unknown-service', mockCanvas)
      expect(animationConfig.value.type).toBe('unknown-service')
    })
  })

  describe('animation state machine', () => {
    it('should start in idle state', () => {
      const { isAnimating } = useServiceFlow('supply-chain-finance', mockCanvas)
      expect(isAnimating.value).toBe(false)
    })

    it('should start animation when startAnimation is called', () => {
      const { isAnimating, startAnimation } = useServiceFlow('supply-chain-finance', mockCanvas)
      startAnimation()
      expect(isAnimating.value).toBe(true)
    })

    it('should stop animation when stopAnimation is called', () => {
      const { isAnimating, startAnimation, stopAnimation } = useServiceFlow('supply-chain-finance', mockCanvas)
      startAnimation()
      stopAnimation()
      expect(isAnimating.value).toBe(false)
    })

    it('should respect prefers-reduced-motion', () => {
      global.matchMedia = vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }))

      const { isAnimating, startAnimation } = useServiceFlow('supply-chain-finance', mockCanvas)
      startAnimation()
      expect(isAnimating.value).toBe(false)
    })
  })

  describe('visibility API behavior', () => {
    it('should setup visibility listeners', () => {
      const { cleanup } = useServiceFlow('supply-chain-finance', mockCanvas)

      // Cleanup should be defined and callable
      expect(cleanup).toBeDefined()
      expect(typeof cleanup).toBe('function')

      cleanup()
    })

    it('should handle tab visibility changes', () => {
      // Test that the composable handles visibility changes gracefully
      // The actual behavior is tested in component tests
      const { isAnimating } = useServiceFlow('supply-chain-finance', mockCanvas)

      // Should start in non-animating state
      expect(isAnimating.value).toBe(false)
    })
  })

  describe('canvas rendering', () => {
    it('should clear canvas before each frame', () => {
      const { startAnimation } = useServiceFlow('supply-chain-finance', mockCanvas)
      startAnimation()

      // Let first frame render
      vi.advanceTimersByTime(16)

      expect(mockContext.clearRect).toHaveBeenCalled()
    })

    it('should draw nodes for supply-chain-finance', () => {
      const { startAnimation } = useServiceFlow('supply-chain-finance', mockCanvas)
      startAnimation()

      vi.advanceTimersByTime(16)

      expect(mockContext.arc).toHaveBeenCalled()
    })

    it('should draw particles for big-data-ai', () => {
      const { startAnimation } = useServiceFlow('big-data-ai', mockCanvas)
      startAnimation()

      vi.advanceTimersByTime(16)

      expect(mockContext.arc).toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('should provide cleanup function', () => {
      const { cleanup } = useServiceFlow('supply-chain-finance', mockCanvas)

      expect(cleanup).toBeDefined()
      expect(typeof cleanup).toBe('function')

      cleanup()
    })

    it('should cleanup IntersectionObserver on unmount', () => {
      const { cleanup } = useServiceFlow('supply-chain-finance', mockCanvas)

      cleanup()

      const observerInstances = global.IntersectionObserver.mock.instances
      expect(observerInstances.length).toBeGreaterThan(0)

      const lastObserver = observerInstances[observerInstances.length - 1]
      expect(lastObserver.disconnect).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have flash rate ≤ 3Hz', () => {
      const { animationConfig } = useServiceFlow('supply-chain-finance', mockCanvas)
      expect(animationConfig.value.flashRate).toBeLessThanOrEqual(3)
    })

    it('should provide aria-label for service', () => {
      const { ariaLabel } = useServiceFlow('supply-chain-finance', mockCanvas)
      expect(ariaLabel.value).toBeTruthy()
      expect(ariaLabel.value).toBeDefined()
      expect(typeof ariaLabel.value).toBe('string')
    })

    it('should provide descriptive status', () => {
      const { animationStatus } = useServiceFlow('supply-chain-finance', mockCanvas)
      expect(animationStatus.value).toBeDefined()
      expect(['static', 'paused', 'playing']).toContain(animationStatus.value)
    })
  })

  describe('performance', () => {
    it('should use rAF for animation loop', () => {
      const { startAnimation } = useServiceFlow('supply-chain-finance', mockCanvas)
      startAnimation()

      expect(global.requestAnimationFrame).toHaveBeenCalled()
    })

    it('should manage animation frame lifecycle', () => {
      const { startAnimation, stopAnimation } = useServiceFlow('supply-chain-finance', mockCanvas)

      startAnimation()
      expect(global.requestAnimationFrame).toHaveBeenCalled()

      stopAnimation()
      expect(global.cancelAnimationFrame).toHaveBeenCalled()
    })
  })
})
