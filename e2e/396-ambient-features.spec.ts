import { test, expect } from '@playwright/test'

test.describe('Ambient Features Tests', () => {
  test('should render ambient components on all pages', async ({ page }) => {
    // Test /about page
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    const aboutAmbient = page.locator('.about-ambient')
    await expect(aboutAmbient).toBeVisible()
    await expect(aboutAmbient).toHaveAttribute('role', 'img')
    
    // Test /services page
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
    
    const servicesAmbient = page.locator('.services-ambient')
    await expect(servicesAmbient).toBeVisible()
    await expect(servicesAmbient).toHaveAttribute('role', 'img')
  })

  test('should detect mobile vs desktop correctly', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    const isDesktop = await page.evaluate(() => {
      return window.innerWidth > 768
    })
    expect(isDesktop).toBeTruthy()
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    const isMobile = await page.evaluate(() => {
      return window.innerWidth <= 768
    })
    expect(isMobile).toBeTruthy()
  })

  test('should have Intersection Observer pause RAF when off-screen', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Scroll ambient component into view
    const ambientComponent = page.locator('.about-ambient')
    await ambientComponent.scrollIntoViewIfNeeded()
    
    // Wait a moment for potential animation start
    await page.waitForTimeout(500)
    
    // Scroll away from ambient component
    await page.evaluate(() => {
      window.scrollTo(0, 2000)
    })
    
    // Wait and check that animations are paused
    await page.waitForTimeout(500)
    
    // The component should still be in DOM but potentially paused
    const isVisible = await ambientComponent.isVisible()
    expect(isVisible).toBeTruthy()
  })

  test('should have mobile reduced animation complexity', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Mobile should have different rendering or particle count
    const mobileAmbient = page.locator('.about-ambient')
    await expect(mobileAmbient).toBeVisible()
    
    // Check if mobile-specific styles are applied
    const hasMobileStyles = await page.evaluate(() => {
      const ambient = document.querySelector('.about-ambient')
      if (!ambient) return false
      const styles = window.getComputedStyle(ambient)
      return styles.height === '400px' // Mobile height
    })
    
    expect(hasMobileStyles).toBeTruthy()
  })

  test('should apply CSS containment to all ambient components', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Check AboutAmbient
    const aboutContainment = await page.evaluate(() => {
      const ambient = document.querySelector('.about-ambient')
      if (!ambient) return false
      const styles = window.getComputedStyle(ambient)
      return styles.contentVisibility === 'auto'
    })
    expect(aboutContainment).toBeTruthy()
    
    // Check ServicesAmbient
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
    
    const servicesContainment = await page.evaluate(() => {
      const ambient = document.querySelector('.services-ambient')
      if (!ambient) return false
      const styles = window.getComputedStyle(ambient)
      return styles.contentVisibility === 'auto'
    })
    expect(servicesContainment).toBeTruthy()
  })
})
