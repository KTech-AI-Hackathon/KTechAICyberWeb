import { test, expect } from '@playwright/test'

test.describe('Reduced Motion Support Tests', () => {
  test('should provide static fallback for prefers-reduced-motion users', async ({ page }) => {
    // Enable reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Check that ambient component is in static mode
    const ambientComponent = page.locator('.about-ambient')
    await expect(ambientComponent).toHaveClass(/ambient-static/)
    
    // Should show static particles instead of canvas
    const staticParticles = page.locator('.static-particle')
    const particleCount = await staticParticles.count()
    expect(particleCount).toBeGreaterThan(0)
  })

  test('should not animate when reduced motion is preferred', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
    
    // Check for static fallback
    const staticGrid = page.locator('.ambient-static.services-grid')
    await expect(staticGrid).toBeVisible()
    
    // Should not have animated SVG
    const animatedSvg = page.locator('.ambient-svg')
    const isVisible = await animatedSvg.isVisible().catch(() => false)
    expect(isVisible).toBeFalsy()
  })

  test('should respect reduced motion on all ambient components', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Test about page
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    const aboutStatic = page.locator('.about-ambient.ambient-static')
    await expect(aboutStatic).toBeVisible()
    
    // Test services page
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
    
    const servicesStatic = page.locator('.services-ambient.ambient-static')
    await expect(servicesStatic).toBeVisible()
  })

  test('should have accessible fallback for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Check ARIA labels are still present
    const ambientComponent = page.locator('.about-ambient')
    await expect(ambientComponent).toHaveAttribute('role', 'img')
    
    const ariaLabel = await ambientComponent.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    expect(ariaLabel).not.toBe('')
  })

  test('should switch between animated and static based on preference', async ({ page }) => {
    // Start with normal motion
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    
    // Should have animated canvas
    const canvas = page.locator('.ambient-canvas')
    await expect(canvas).toBeVisible()
    
    // Reload with reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should now have static fallback
    const staticGrid = page.locator('.ambient-static.particles-grid')
    await expect(staticGrid).toBeVisible()
  })
})
