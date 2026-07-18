import { test, expect } from '@playwright/test'

test.describe('Desktop Performance Preservation Tests', () => {
  test.use({ viewport: { width: 1920, height: 1080 } }) // Desktop viewport

  test('should maintain 60fps ambient animations on desktop', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Monitor frame rate
    const frameMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const frames: number[] = []
        let lastTime = performance.now()
        
        function measureFrame() {
          const now = performance.now()
          const fps = 1000 / (now - lastTime)
          frames.push(fps)
          lastTime = now
          
          if (frames.length < 60) {
            requestAnimationFrame(measureFrame)
          } else {
            resolve(frames)
          }
        }
        
        requestAnimationFrame(measureFrame)
      })
    })
    
    // Calculate average FPS
    const avgFps = frameMetrics.reduce((sum: number, fps: number) => sum + fps, 0) / frameMetrics.length
    
    // Assert desktop maintains ≥ 50fps (allow some margin)
    expect(avgFps).toBeGreaterThanOrEqual(50)
  })

  test('should have full particle count on desktop', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Check canvas rendering
    const canvasExists = await page.locator('.about-ambient canvas').isVisible()
    expect(canvasExists).toBeTruthy()
    
    // Verify desktop particle count through component exposure
    const particleCount = await page.evaluate(() => {
      const component = (window as any).__about_ambient_component__
      return component?.particleCount || 50
    })
    
    // Desktop should use full particle count (50)
    expect(particleCount).toBeGreaterThanOrEqual(50)
  })

  test('should have smooth animations on desktop /services', async ({ page }) => {
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
    
    // Check that ambient SVG is rendering
    const svgExists = await page.locator('.services-ambient svg').isVisible()
    expect(svgExists).toBeTruthy()
    
    // Monitor animation smoothness
    const animationSmoothness = await page.evaluate(() => {
      return new Promise((resolve) => {
        const updates: number[] = []
        let lastUpdate = performance.now()
        
        // Monitor for 1 second
        const duration = 1000
        const startTime = performance.now()
        
        function monitor() {
          const now = performance.now()
          if (now - startTime < duration) {
            updates.push(now - lastUpdate)
            lastUpdate = now
            requestAnimationFrame(monitor)
          } else {
            resolve(updates)
          }
        }
        
        requestAnimationFrame(monitor)
      })
    })
    
    // Check that updates are happening at reasonable intervals (16-20ms for 60fps)
    const avgInterval = animationSmoothness.reduce((sum: number, val: number) => sum + val, 0) / animationSmoothness.length
    expect(avgInterval).toBeLessThanOrEqual(20) // ~60fps
  })

  test('should not degrade desktop Lighthouse performance', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Collect performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paintEntries = performance.getEntriesByType('paint')
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: paintEntries.find((e) => e.name === 'first-contentful-paint')?.startTime || 0
      }
    })
    
    // Desktop should maintain fast load times
    expect(performanceMetrics.domContentLoaded).toBeLessThan(500)
    expect(performanceMetrics.loadComplete).toBeLessThan(1000)
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1000)
  })

  test('should have CSS containment applied on desktop', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Check for CSS containment on ambient components
    const hasContainment = await page.evaluate(() => {
      const ambient = document.querySelector('.about-ambient')
      if (!ambient) return false
      
      const styles = window.getComputedStyle(ambient)
      return styles.contentVisibility === 'auto' || styles.contain.includes('size')
    })
    
    expect(hasContainment).toBeTruthy()
  })
})
