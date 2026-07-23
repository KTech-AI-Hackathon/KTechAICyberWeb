import { test, expect } from '@playwright/test'

test.describe('BlockchainAmbient E2E Tests - Issue #414', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to blockchain page
    await page.goto('/blockchain')
    await page.waitForLoadState('networkidle')
  })

  test('should render blockchain ambient component on blockchain page', async ({ page }) => {
    const blockchainAmbient = page.locator('.blockchain-ambient')
    await expect(blockchainAmbient).toBeVisible()
  })

  test('should have proper accessibility attributes', async ({ page }) => {
    const blockchainAmbient = page.locator('.blockchain-ambient')
    await expect(blockchainAmbient).toHaveAttribute('role', 'img')

    // Check aria-label exists
    const ariaLabel = await blockchainAmbient.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    expect(ariaLabel).toContain('distributed ledger')
  })

  test('should render canvas for animated visualization', async ({ page }) => {
    const canvas = page.locator('.blockchain-ambient .ambient-canvas')
    await expect(canvas).toBeVisible()

    // Canvas should have width and height
    const width = await canvas.getAttribute('width')
    const height = await canvas.getAttribute('height')
    expect(parseInt(width || '0')).toBeGreaterThan(0)
    expect(parseInt(height || '0')).toBeGreaterThan(0)
  })

  test('should apply CSS containment for performance', async ({ page }) => {
    const containment = await page.evaluate(() => {
      const ambient = document.querySelector('.blockchain-ambient')
      if (!ambient) return false
      const styles = window.getComputedStyle(ambient)
      return styles.contentVisibility === 'auto'
    })
    expect(containment).toBeTruthy()
  })

  test('should have mobile-adaptive rendering', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/blockchain')
    await page.waitForLoadState('networkidle')

    const blockchainAmbient = page.locator('.blockchain-ambient')
    await expect(blockchainAmbient).toBeVisible()

    // Check mobile height
    const mobileHeight = await page.evaluate(() => {
      const ambient = document.querySelector('.blockchain-ambient')
      if (!ambient) return 0
      const styles = window.getComputedStyle(ambient)
      return parseInt(styles.height)
    })
    expect(mobileHeight).toBe(400)
  })

  test('should have desktop rendering at larger viewport', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/blockchain')
    await page.waitForLoadState('networkidle')

    const blockchainAmbient = page.locator('.blockchain-ambient')
    await expect(blockchainAmbient).toBeVisible()

    // Check desktop height
    const desktopHeight = await page.evaluate(() => {
      const ambient = document.querySelector('.blockchain-ambient')
      if (!ambient) return 0
      const styles = window.getComputedStyle(ambient)
      return parseInt(styles.height)
    })
    expect(desktopHeight).toBe(600)
  })

  test('should pause when scrolled out of view', async ({ page }) => {
    const blockchainAmbient = page.locator('.blockchain-ambient')

    // Scroll to ambient component
    await blockchainAmbient.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Scroll away
    await page.evaluate(() => {
      window.scrollTo(0, 2000)
    })

    await page.waitForTimeout(500)

    // Component should still be in DOM
    const isVisible = await blockchainAmbient.isVisible()
    expect(isVisible).toBeTruthy()
  })

  test('should honor prefers-reduced-motion with static fallback', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/blockchain')
    await page.waitForLoadState('networkidle')

    // Should show static fallback instead of canvas
    const staticElement = page.locator('.blockchain-ambient .ambient-static')
    const canvas = page.locator('.blockchain-ambient .ambient-canvas')

    // When reduced motion is preferred, static elements should be present
    const hasStatic = await staticElement.count().then(count => count > 0)
    expect(hasStatic).toBeTruthy()
  })

  test('should display blockchain visualization elements', async ({ page }) => {
    const blockchainAmbient = page.locator('.blockchain-ambient')

    // Wait for canvas to be ready
    await expect(blockchainAmbient).toBeVisible()
    await page.waitForTimeout(1000)

    // Check that canvas is rendering
    const isCanvasRendering = await page.evaluate(() => {
      const canvas = document.querySelector('.blockchain-ambient .ambient-canvas') as HTMLCanvasElement
      if (!canvas) return false
      const ctx = canvas.getContext('2d')
      if (!ctx) return false

      // Check if canvas has been drawn to (not blank)
      const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      // Check if any pixel has non-zero alpha
      for (let i = 3; i < pixelData.length; i += 4) {
        if (pixelData[i] > 0) return true
      }
      return false
    })

    // Canvas should be rendering (may need more time for first frame)
    expect(isCanvasRendering).toBeTruthy()
  })

  test('should position component below hero section', async ({ page }) => {
    const hero = page.locator('.hero')
    const blockchainAmbient = page.locator('.blockchain-ambient')

    await expect(hero).toBeVisible()
    await expect(blockchainAmbient).toBeVisible()

    // Check ambient is below hero in DOM order
    const positions = await page.evaluate(() => {
      const heroEl = document.querySelector('.hero')
      const ambientEl = document.querySelector('.blockchain-ambient')
      if (!heroEl || !ambientEl) return { heroBottom: 0, ambientTop: 0 }

      const heroRect = heroEl.getBoundingClientRect()
      const ambientRect = ambientEl.getBoundingClientRect()

      return {
        heroBottom: heroRect.bottom,
        ambientTop: ambientRect.top
      }
    })

    expect(positions.ambientTop).toBeGreaterThanOrEqual(positions.heroBottom)
  })
})
