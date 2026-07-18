/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDeviceDetection } from '../useDeviceDetection'

describe('useDeviceDetection', () => {
  let originalInnerWidth: number
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    // Store original values
    originalInnerWidth = window.innerWidth
    originalMatchMedia = window.matchMedia

    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    // Restore original values
    window.innerWidth = originalInnerWidth
    window.matchMedia = originalMatchMedia
  })

  describe('isMobile', () => {
    it('should detect mobile when viewport width ≤ 768px', () => {
      // Test mobile viewport (375px - iPhone)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))

      const { isMobile } = useDeviceDetection()
      expect(isMobile.value).toBe(true)
    })

    it('should detect mobile when viewport width is exactly 768px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      window.dispatchEvent(new Event('resize'))

      const { isMobile } = useDeviceDetection()
      expect(isMobile.value).toBe(true)
    })

    it('should detect desktop when viewport width > 768px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 769,
      })
      window.dispatchEvent(new Event('resize'))

      const { isMobile } = useDeviceDetection()
      expect(isMobile.value).toBe(false)
    })

    it('should detect desktop on large screens (1920px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })
      window.dispatchEvent(new Event('resize'))

      const { isMobile } = useDeviceDetection()
      expect(isMobile.value).toBe(false)
    })

    it('should update isMobile on resize events', () => {
      const { isMobile } = useDeviceDetection()

      // Start with desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      window.dispatchEvent(new Event('resize'))
      expect(isMobile.value).toBe(false)

      // Resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))
      expect(isMobile.value).toBe(true)

      // Resize back to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      window.dispatchEvent(new Event('resize'))
      expect(isMobile.value).toBe(false)
    })
  })

  describe('isDesktop', () => {
    it('should detect desktop when viewport width > 768px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      window.dispatchEvent(new Event('resize'))

      const { isDesktop } = useDeviceDetection()
      expect(isDesktop.value).toBe(true)
    })

    it('should be false on mobile viewport (375px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))

      const { isDesktop } = useDeviceDetection()
      expect(isDesktop.value).toBe(false)
    })

    it('should be false at mobile breakpoint (768px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      window.dispatchEvent(new Event('resize'))

      const { isDesktop } = useDeviceDetection()
      expect(isDesktop.value).toBe(false)
    })

    it('should be inverse of isMobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))

      const { isMobile, isDesktop } = useDeviceDetection()
      expect(isDesktop.value).toBe(!isMobile.value)

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      window.dispatchEvent(new Event('resize'))

      expect(isDesktop.value).toBe(!isMobile.value)
    })
  })

  describe('cleanup', () => {
    it('should remove resize event listener on cleanup', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { cleanup } = useDeviceDetection()

      cleanup()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
    })

    it('should handle multiple cleanup calls safely', () => {
      const { cleanup } = useDeviceDetection()

      expect(() => {
        cleanup()
        cleanup()
        cleanup()
      }).not.toThrow()
    })
  })

  describe('reactivity', () => {
    it('should provide reactive values that update viewport', () => {
      const { isMobile, isDesktop } = useDeviceDetection()

      // Start desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      window.dispatchEvent(new Event('resize'))

      expect(isMobile.value).toBe(false)
      expect(isDesktop.value).toBe(true)

      // Switch to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))

      expect(isMobile.value).toBe(true)
      expect(isDesktop.value).toBe(false)
    })
  })

  describe('initial state', () => {
    it('should detect device type on initial call without resize event', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { isMobile, isDesktop } = useDeviceDetection()

      expect(isMobile.value).toBe(true)
      expect(isDesktop.value).toBe(false)
    })
  })
})
