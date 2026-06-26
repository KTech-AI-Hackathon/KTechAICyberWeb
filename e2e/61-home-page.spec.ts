import { test, expect, Page } from '@playwright/test'

/**
 * E2E Tests for Issue #61: Home Page
 * Tests Hero section, Features Grid, Stats Section, and CTA functionality
 */

test.describe('Issue #61: Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Hero section displays correctly', async ({ page }) => {
    // Check main heading is visible
    const heroTitle = page.locator('.hero-title')
    await expect(heroTitle).toBeVisible()

    // Check heading text content
    const titleText = await heroTitle.textContent()
    expect(titleText).toBeTruthy()
    expect(titleText?.length).toBeGreaterThan(0)

    // Check subtitle is visible
    const heroSubtitle = page.locator('.hero-subtitle')
    await expect(heroSubtitle).toBeVisible()

    // Check CTA button is visible
    const heroCta = page.locator('.hero-cta')
    await expect(heroCta).toBeVisible()
    await expect(heroCta).toHaveAttribute('href', '/about')
  })

  test('Animated background grid renders', async ({ page }) => {
    // Check grid background elements exist
    const gridBgs = page.locator('.grid-bg')
    await expect(gridBgs).toHaveCount(2)

    // Verify they have proper positioning
    const firstGrid = gridBgs.first()
    await expect(firstGrid).toHaveCSS('position', 'fixed')
  })

  test('Features grid displays all 6 features', async ({ page }) => {
    // Check features section exists
    const featuresGrid = page.locator('.features-grid')
    await expect(featuresGrid).toBeVisible()

    // Check section title
    const sectionTitle = featuresGrid.locator('.section-title')
    await expect(sectionTitle).toBeVisible()

    // Check all 6 feature cards
    const featureCards = featuresGrid.locator('.feature-card')
    await expect(featureCards).toHaveCount(6)

    // Verify each card has required elements
    for (const card of await featureCards.all()) {
      await expect(card.locator('.feature-icon')).toBeVisible()
      await expect(card.locator('.feature-title')).toBeVisible()
      await expect(card.locator('.feature-description')).toBeVisible()
    }
  })

  test('Feature cards have hover effects', async ({ page }) => {
    const featureCard = page.locator('.feature-card').first()

    // Get initial transform
    const initialTransform = await featureCard.evaluate(el => {
      return window.getComputedStyle(el).transform
    })

    // Hover over the card
    await featureCard.hover()

    // Wait for transition
    await page.waitForTimeout(350)

    // Check that transform changed (hover effect)
    const hoverTransform = await featureCard.evaluate(el => {
      return window.getComputedStyle(el).transform
    })

    expect(hoverTransform).not.toBe(initialTransform)
  })

  test('Stats section displays all statistics', async ({ page }) => {
    // Check stats section exists
    const statsSection = page.locator('.stats-section')
    await expect(statsSection).toBeVisible()

    // Check section title
    const sectionTitle = statsSection.locator('.section-title')
    await expect(sectionTitle).toBeVisible()

    // Check all 4 stat cards
    const statCards = statsSection.locator('.stat-card')
    await expect(statCards).toHaveCount(4)

    // Verify each card has value and label
    for (const card of await statCards.all()) {
      await expect(card.locator('.stat-value')).toBeVisible()
      await expect(card.locator('.stat-label')).toBeVisible()
    }
  })

  test('Stat values display correct data', async ({ page }) => {
    const statValues = page.locator('.stat-value')

    // Check we have 4 stats
    await expect(statValues).toHaveCount(4)

    // Verify stats contain expected values
    const values = await statValues.allTextContents()
    const expectedPatterns = ['99.9', '1M', '50', '24']

    for (const pattern of expectedPatterns) {
      const found = values.some(v => v.includes(pattern))
      expect(found).toBeTruthy()
    }
  })

  test('CTA section displays with navigation buttons', async ({ page }) => {
    // Check CTA section exists
    const ctaSection = page.locator('.cta-section')
    await expect(ctaSection).toBeVisible()

    // Check CTA title
    const ctaTitle = ctaSection.locator('.cta-title')
    await expect(ctaTitle).toBeVisible()

    // Check CTA buttons
    const ctaButtons = ctaSection.locator('.cta-button')
    await expect(ctaButtons).toHaveCount(2)

    // Verify buttons are links
    for (const button of await ctaButtons.all()) {
      const tagName = await button.evaluate(el => el.tagName.toLowerCase())
      expect(tagName).toBe('a')
    }
  })

  test('CTA buttons navigate correctly', async ({ page }) => {
    // Test primary CTA button
    const primaryButton = page.locator('.cta-button.primary').first()
    await expect(primaryButton).toHaveAttribute('href', '/about')

    // Click and verify navigation
    await primaryButton.click()
    await expect(page).toHaveURL('/about')

    // Navigate back
    await page.goto('/')

    // Test secondary CTA button
    const secondaryButton = page.locator('.cta-button.secondary').first()
    await expect(secondaryButton).toHaveAttribute('href', '/news')

    // Click and verify navigation
    await secondaryButton.click()
    await expect(page).toHaveURL('/news')
  })

  test('Language switcher works on Home page', async ({ page }) => {
    // Get initial hero title in English
    const initialTitle = await page.locator('.hero-title').textContent()
    expect(initialTitle).toBeTruthy()

    // Click language switcher
    const switcher = page.locator('[aria-label*="Language"], .language-switcher').first()
    if (await switcher.isVisible()) {
      await switcher.click()

      // Wait for content update
      await page.waitForTimeout(500)

      // Check that content has changed
      const newTitle = await page.locator('.hero-title').textContent()
      expect(newTitle).not.toBe(initialTitle)
    }
  })

  test('Home page is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check hero section adapts
    const heroTitle = page.locator('.hero-title')
    await expect(heroTitle).toBeVisible()

    // Check features grid stacks vertically
    const featureCards = page.locator('.feature-card')
    await expect(featureCards.first()).toBeVisible()

    // Check stats adapt
    const statCards = page.locator('.stat-card')
    await expect(statCards.first()).toBeVisible()
  })

  test('Home page is responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    // Check all sections render properly
    await expect(page.locator('.hero-section')).toBeVisible()
    await expect(page.locator('.features-grid')).toBeVisible()
    await expect(page.locator('.stats-section')).toBeVisible()
    await expect(page.locator('.cta-section')).toBeVisible()
  })

  test('Accessibility: proper heading hierarchy', async ({ page }) => {
    // Check main heading is h1
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toHaveCount(1)

    // Check section titles are h2
    const h2s = page.locator('h2')
    const h2Count = await h2s.count()
    expect(h2Count).toBeGreaterThanOrEqual(3) // At least Features, Stats, CTA titles
  })

  test('Accessibility: ARIA labels present', async ({ page }) => {
    // Check main element has role
    const main = page.locator('main[role="main"]')
    await expect(main).toBeVisible()

    // Check sections have aria-labels
    const sections = page.locator('section[aria-label]')
    await expect(sections.first()).toBeVisible()

    // Check buttons have aria-labels
    const buttonsWithAria = page.locator('button[aria-label], a[aria-label]')
    await expect(buttonsWithAria.first()).toBeVisible()
  })

  test('Accessibility: keyboard navigation works', async ({ page }) => {
    // Tab to first interactive element
    await page.keyboard.press('Tab')

    // Check focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON']).toContain(focusedElement)

    // Tab through CTA buttons
    const ctaButtons = page.locator('.cta-button')
    const count = await ctaButtons.count()

    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab')
      const isFocused = await ctaButtons.nth(i).evaluate(el => el === document.activeElement)
      if (isFocused) break
    }
  })

  test('Performance: page loads quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime

    // Page should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('Cyberpunk styling: colors present', async ({ page }) => {
    // Check cyan color is used (primary color)
    const cyanElements = page.locator('.hero-title, .feature-icon, .stat-value')
    const firstElement = cyanElements.first()

    if (await firstElement.isVisible()) {
      const color = await firstElement.evaluate(el => {
        return window.getComputedStyle(el).color
      })
      // Should contain cyan/teal colors
      expect(color).toMatch(/rgb\(0,\s*255,\s*204\)|rgb\(0,\s*240,\s*255\)|#00ffcc|#00f0ff/i)
    }
  })

  test('Cyberpunk styling: neon glow effects', async ({ page }) => {
    // Check text-shadow for neon glow
    const heroTitle = page.locator('.hero-title')
    const textShadow = await heroTitle.evaluate(el => {
      return window.getComputedStyle(el).textShadow
    })

    // Should have text-shadow for neon effect
    expect(textShadow).toBeTruthy()
    expect(textShadow?.length).toBeGreaterThan(0)
  })

  test('Reduced motion: respects user preference', async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    // Verify animations are reduced/disabled
    const gridBg = page.locator('.grid-bg').first()
    const animationDuration = await gridBg.evaluate(el => {
      return window.getComputedStyle(el).animationDuration
    })

    // Should have 0s or very short duration when reduced motion is preferred
    expect(animationDuration).toBe('0s')
  })
})
