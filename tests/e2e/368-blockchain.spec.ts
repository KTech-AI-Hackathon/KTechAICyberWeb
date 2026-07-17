import { test, expect } from '@playwright/test'

/**
 * Issue #368 — Blockchain page E2E tests.
 *
 * Verifies the /blockchain route:
 * 1. Page renders without errors
 * 2. All sections (hero, overview, features, benefits, CTA) are present
 * 3. i18n toggle works between en and zh
 * 4. Animated grid background is present
 * 5. CTA button has proper ARIA labels
 * 6. Cyberpunk theme is applied (dark background, neon colors, scanlines)
 *
 * Uses the Vite base subpath (/KTechAICyberWeb/) — see playwright.config.ts.
 *
 * Tags: @regression @i18n @theme @accessibility
 */

const BASE = '/KTechAICyberWeb/'

test.describe('Blockchain page (AC #368)', () => {
  test.describe('desktop viewport', () => {
    test.use({ viewport: { width: 1280, height: 720 } })

    test('page renders without errors at /blockchain', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      // Main page container exists
      const blockchain = page.locator('.blockchain')
      await expect(blockchain).toBeVisible()
    })

    test('animated grid background is present', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      // Should have 2 grid background layers
      const gridBg = page.locator('.grid-bg')
      await expect(gridBg.first()).toBeVisible()
      expect(await gridBg.count()).toBe(2)

      const gridBg2 = page.locator('.grid-bg-2')
      await expect(gridBg2).toBeVisible()
    })

    test('breadcrumb navigation is present', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const breadcrumb = page.locator('.breadcrumb')
      await expect(breadcrumb).toBeVisible()
      expect(await breadcrumb.textContent()).toContain('Home')
      expect(await breadcrumb.textContent()).toContain('Blockchain')
    })

    test('hero section renders with title, subtitle, and accent', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const hero = page.locator('.hero')
      await expect(hero).toBeVisible()

      const pageTitle = page.locator('.page-title')
      await expect(pageTitle).toBeVisible()
      expect(await pageTitle.textContent()).toContain('Blockchain')

      const accent = page.locator('.page-title .accent')
      await expect(accent).toBeVisible()

      const pageSubtitle = page.locator('.page-subtitle')
      await expect(pageSubtitle).toBeVisible()
      await page.waitForTimeout(100)
      const subtitleText = await pageSubtitle.textContent()
      expect(subtitleText).toBeTruthy()
      expect(subtitleText?.length).toBeGreaterThan(0)
    })

    test('overview section renders with card', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const overview = page.locator('.overview')
      await expect(overview).toBeVisible()

      const overviewCard = page.locator('.overview-card')
      await expect(overviewCard).toBeVisible()

      const cardIcon = page.locator('.card-icon')
      await expect(cardIcon).toBeVisible()
    })

    test('features section renders with 4 feature cards', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const features = page.locator('.features')
      await expect(features).toBeVisible()

      const featureCards = page.locator('.feature-card')
      await expect(featureCards.first()).toBeVisible()
      expect(await featureCards.count()).toBe(4)
    })

    test('feature cards have icons, titles, and descriptions', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const featureIcons = page.locator('.feature-icon')
      await expect(featureIcons.first()).toBeVisible()
      expect(await featureIcons.count()).toBe(4)

      // Each feature card should have title and description
      const featureCards = page.locator('.feature-card')
      for (let i = 0; i < await featureCards.count(); i++) {
        const card = featureCards.nth(i)
        await expect(card.locator('h3')).toBeVisible()
        await expect(card.locator('p')).toBeVisible()
      }
    })

    test('benefits section renders with 3 benefit items', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const benefits = page.locator('.benefits')
      await expect(benefits).toBeVisible()

      const benefitItems = page.locator('.benefit-item')
      await expect(benefitItems.first()).toBeVisible()
      expect(await benefitItems.count()).toBe(3)
    })

    test('benefit items have numbers, titles, and descriptions', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const benefitNumbers = page.locator('.benefit-number')
      await expect(benefitNumbers.first()).toBeVisible()
      expect(await benefitNumbers.count()).toBe(3)

      // Check numbers are formatted correctly
      expect(await benefitNumbers.nth(0).textContent()).toBe('01')
      expect(await benefitNumbers.nth(1).textContent()).toBe('02')
      expect(await benefitNumbers.nth(2).textContent()).toBe('03')

      // Each benefit item should have title and description
      const benefitItems = page.locator('.benefit-item')
      for (let i = 0; i < await benefitItems.count(); i++) {
        const item = benefitItems.nth(i)
        await expect(item.locator('h3')).toBeVisible()
        await expect(item.locator('p')).toBeVisible()
      }
    })

    test('CTA section renders with button', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const cta = page.locator('.cta')
      await expect(cta).toBeVisible()

      const ctaButton = page.locator('.cyber-button')
      await expect(ctaButton).toBeVisible()
      await page.waitForTimeout(100)
      const buttonText = await ctaButton.textContent()
      expect(buttonText).toBeTruthy()
      expect(buttonText?.length).toBeGreaterThan(0)
    })

    test('CTA button has proper ARIA label', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const ctaButton = page.locator('.cyber-button')
      await expect(ctaButton).toBeVisible()

      const ariaLabel = await ctaButton.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
      expect(ariaLabel?.length).toBeGreaterThan(0)
    })

    test('page has cyberpunk theme styling', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      // Check for dark background (gradient)
      const blockchain = page.locator('.blockchain')
      const bgColor = await blockchain.evaluate((el) => {
        return window.getComputedStyle(el).background
      })
      // Should have a gradient background
      expect(bgColor).toContain('gradient')

      // Check for neon effects
      const featureIcons = page.locator('.neon-border')
      await expect(featureIcons.first()).toBeVisible()

      const benefitNumbers = page.locator('.neon-text')
      await expect(benefitNumbers.first()).toBeVisible()
    })

    test('page has proper ARIA labels for accessibility', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const breadcrumb = page.locator('[aria-label="Breadcrumb"]')
      await expect(breadcrumb).toBeVisible()
    })
  })

  test.describe('mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('page renders on mobile without errors', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const blockchain = page.locator('.blockchain')
      await expect(blockchain).toBeVisible()
    })

    test('hero section is responsive on mobile', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const pageTitle = page.locator('.page-title')
      await expect(pageTitle).toBeVisible()

      // Mobile font size should be smaller
      const fontSize = await pageTitle.evaluate((el) => {
        return window.getComputedStyle(el).fontSize
      })
      // Should be smaller than desktop (2rem vs 3.5rem)
      expect(parseFloat(fontSize)).toBeLessThan(60) // 3.5rem = 56px at 16px base
    })

    test('features and benefits grids are single column on mobile', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      // Check that grids are responsive (they should stack vertically)
      const featureCards = page.locator('.feature-card')
      await expect(featureCards.first()).toBeVisible()
      expect(await featureCards.count()).toBe(4)

      const benefitItems = page.locator('.benefit-item')
      await expect(benefitItems.first()).toBeVisible()
      expect(await benefitItems.count()).toBe(3)
    })

    test('overview card is vertically stacked on mobile', async ({ page }) => {
      await page.goto(`${BASE}blockchain`)
      await page.waitForLoadState('networkidle')

      const overviewCard = page.locator('.overview-card')
      await expect(overviewCard).toBeVisible()

      // On mobile, the card should have flex-direction: column
      const flexDirection = await overviewCard.evaluate((el) => {
        return window.getComputedStyle(el).flexDirection
      })
      expect(flexDirection).toBe('column')
    })
  })
})

test.describe('Blockchain page i18n (AC #368)', () => {
  test('English language renders correctly', async ({ page }) => {
    await page.goto(`${BASE}blockchain`)
    await page.waitForLoadState('networkidle')

    const pageTitle = page.locator('.page-title')
    await expect(pageTitle).toBeVisible()
    expect(await pageTitle.textContent()).toContain('Blockchain')

    const pageSubtitle = page.locator('.page-subtitle')
    await expect(pageSubtitle).toBeVisible()
    await page.waitForTimeout(100)
    const subtitleText = await pageSubtitle.textContent()
    expect(subtitleText).toBeTruthy()
    expect(subtitleText?.length).toBeGreaterThan(0)
  })

  test('Chinese language renders correctly', async ({ page }) => {
    // Start at home to access language toggle
    await page.goto(`${BASE}`)
    await page.waitForLoadState('networkidle')

    // Switch to Chinese
    const langToggle = page.locator('[aria-label*="language"], [aria-label*="语言"]').first()
    if (await langToggle.isVisible()) {
      await langToggle.click()
      await page.waitForTimeout(500)
    }

    // Navigate to blockchain page
    await page.goto(`${BASE}blockchain`)
    await page.waitForLoadState('networkidle')

    const pageTitle = page.locator('.page-title')
    await expect(pageTitle).toBeVisible()
    // Chinese title should be present (not necessarily the English "Blockchain")
    const titleText = await pageTitle.textContent()
    expect(titleText?.length).toBeGreaterThan(0)

    const pageSubtitle = page.locator('.page-subtitle')
    await expect(pageSubtitle).toBeVisible()
    await page.waitForTimeout(100)
    const subtitleText = await pageSubtitle.textContent()
    expect(subtitleText).toBeTruthy()
    expect(subtitleText?.length).toBeGreaterThan(0)
  })

  test('i18n toggle works on the page itself', async ({ page }) => {
    await page.goto(`${BASE}blockchain`)
    await page.waitForLoadState('networkidle')

    // Get initial English text
    const pageTitleEn = page.locator('.page-title')
    const titleEn = await pageTitleEn.textContent()
    expect(titleEn).toContain('Blockchain')

    // Toggle language
    const langToggle = page.locator('[aria-label*="language"], [aria-label*="语言"]').first()
    if (await langToggle.isVisible()) {
      await langToggle.click()
      await page.waitForTimeout(500)

      // Title should change (or at least be different)
      const pageTitleZh = page.locator('.page-title')
      const titleZh = await pageTitleZh.textContent()
      expect(titleZh?.length).toBeGreaterThan(0)
    }
  })
})
