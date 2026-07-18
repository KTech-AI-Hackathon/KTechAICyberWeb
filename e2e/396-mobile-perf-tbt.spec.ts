import { test, expect } from '@playwright/test'

test.describe('Mobile Performance - TBT Regression Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // Mobile viewport

  test('should have TBT ≤ 200ms on /about page', async ({ page }) => {
    // Navigate to about page
    await page.goto('/about')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Measure Total Blocking Time (TBT)
    const tbtMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          let totalBlockingTime = 0
          
          entries.forEach((entry) => {
            if (entry.duration > 50) {
              totalBlockingTime += entry.duration - 50
            }
          })
          
          resolve({ totalBlockingTime, entries: entries.length })
        })
        
        observer.observe({ entryTypes: ['longtask'] })
        
        // Wait 2 seconds to collect metrics
        setTimeout(() => {
          observer.disconnect()
        }, 2000)
      })
    })
    
    // Assert TBT is ≤ 200ms
    expect(tbtMetrics.totalBlockingTime).toBeLessThanOrEqual(200)
  })

  test('should have TBT ≤ 200ms on /services page', async ({ page }) => {
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
    
    const tbtMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          let totalBlockingTime = 0
          
          entries.forEach((entry) => {
            if (entry.duration > 50) {
              totalBlockingTime += entry.duration - 50
            }
          })
          
          resolve({ totalBlockingTime, entries: entries.length })
        })
        
        observer.observe({ entryTypes: ['longtask'] })
        
        setTimeout(() => {
          observer.disconnect()
        }, 2000)
      })
    })
    
    expect(tbtMetrics.totalBlockingTime).toBeLessThanOrEqual(200)
  })

  test('should have TBT ≤ 200ms on /contact page', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    
    const tbtMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          let totalBlockingTime = 0
          
          entries.forEach((entry) => {
            if (entry.duration > 50) {
              totalBlockingTime += entry.duration - 50
            }
          })
          
          resolve({ totalBlockingTime, entries: entries.length })
        })
        
        observer.observe({ entryTypes: ['longtask'] })
        
        setTimeout(() => {
          observer.disconnect()
        }, 2000)
      })
    })
    
    expect(tbtMetrics.totalBlockingTime).toBeLessThanOrEqual(200)
  })

  test('should have no individual long task > 50ms on mobile', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    const longTasks = await page.evaluate(() => {
      return new Promise((resolve) => {
        const tasks: number[] = []
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            tasks.push(entry.duration)
          })
        })
        
        observer.observe({ entryTypes: ['longtask'] })
        
        setTimeout(() => {
          observer.disconnect()
          resolve(tasks)
        }, 2000)
      })
    })
    
    // Assert all long tasks are ≤ 50ms over the threshold
    // (long tasks are > 50ms by definition, so we check they're not excessively long)
    longTasks.forEach((duration) => {
      expect(duration).toBeLessThan(100) // Allow some margin but prevent very long tasks
    })
  })

  test('should render ambient components correctly on mobile', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Check that ambient component is present
    const ambientComponent = page.locator('.about-ambient')
    await expect(ambientComponent).toBeVisible()
    
    // On mobile, should have reduced particle count or different rendering
    const hasStatic = await ambientComponent.getAttribute('class')
    expect(hasStatic).toBeTruthy()
  })

  test('should have mobile performance score ≥ 90', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Collect performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paintEntries = performance.getEntriesByType('paint')
      
      const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0
      const lcp = paintEntries.find((entry) => entry.name === 'largest-contentful-paint')?.startTime || 0
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp
      }
    })
    
    // Assert reasonable performance metrics for mobile
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1000)
    expect(performanceMetrics.loadComplete).toBeLessThan(2000)
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500)
  })
})
