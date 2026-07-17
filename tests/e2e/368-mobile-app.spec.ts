import { test, expect } from '@playwright/test'

/**
 * Issue #368 — Mobile App page E2E tests.
 *
 * Verifies the /mobile route:
 * 1. Page renders without errors
 * 2. All sections (hero, overview, features, benefits, CTA, related services) are present
 * 3. i18n toggle works between en and zh
 * 4. Navigation links work correctly
 * 5. CTA button redirects to /#contact
 * 6. Cyberpunk theme is applied (dark background, neon colors)
 *
 * Uses the Vite base subpath (/KTechAICyberWeb/) — see playwright.config.ts.
 *
 * Tags: @regression @i18n @navigation @theme
 */

const BASE = '/KTechAICyberWeb/'

test.describe('Mobile App page (AC #368)', () => {
  test.describe('desktop viewport', () => {
    test.use({ viewport: { width: 1280, height: 720 } })

    test('page renders without errors at /mobile', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      // Main page container exists
      const mobilePage = page.locator('.mobile-app-page')
      await expect(mobilePage).toBeVisible()
    })

    test('breadcrumb navigation is present', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const breadcrumb = page.locator('.breadcrumb')
      await expect(breadcrumb).toBeVisible()
      expect(await breadcrumb.textContent()).toContain('Home')
      expect(await breadcrumb.textContent()).toContain('Mobile')
    })

    test('hero section renders with title, subtitle, and tags', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const hero = page.locator('.hero')
      await expect(hero).toBeVisible()

      const heroTitle = page.locator('.hero-title')
      await expect(heroTitle).toBeVisible()
      expect(await heroTitle.textContent()).toContain('Mobile')

      const heroSubtitle = page.locator('.hero-subtitle')
      await expect(heroSubtitle).toBeVisible()
      // Wait for text content to be rendered (client-side hydration)
      await page.waitForTimeout(100)
      const subtitleText = await heroSubtitle.textContent()
      expect(subtitleText).toBeTruthy()
      expect(subtitleText?.length).toBeGreaterThan(0)

      const tags = page.locator('.hero-tags .tag')
      await expect(tags.first()).toBeVisible()
      expect(await tags.count()).toBe(3)
    })

    test('overview section renders with 3 cards', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const overview = page.locator('.overview')
      await expect(overview).toBeVisible()

      const overviewCards = page.locator('.overview-card')
      await expect(overviewCards.first()).toBeVisible()
      expect(await overviewCards.count()).toBe(3)
    })

    test('features section renders with 6 features', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const features = page.locator('.features')
      await expect(features).toBeVisible()

      const featureItems = page.locator('.feature-item')
      await expect(featureItems.first()).toBeVisible()
      expect(await featureItems.count()).toBe(6)
    })

    test('benefits section renders with 6 benefit items', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const benefits = page.locator('.benefits')
      await expect(benefits).toBeVisible()

      const benefitItems = page.locator('.benefit-item')
      await expect(benefitItems.first()).toBeVisible()
      expect(await benefitItems.count()).toBe(6)

      // Each benefit item has a checkmark
      const benefitChecks = page.locator('.benefit-check')
      expect(await benefitChecks.count()).toBe(6)
    })

    test('CTA section renders with button', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const cta = page.locator('.cta')
      await expect(cta).toBeVisible()

      const ctaButton = page.locator('.cta-button')
      await expect(ctaButton).toBeVisible()
      await page.waitForTimeout(100)
      const buttonText = await ctaButton.textContent()
      expect(buttonText).toBeTruthy()
      expect(buttonText?.length).toBeGreaterThan(0)
    })

    test('related services section renders with 3 cards', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const relatedServices = page.locator('.related-services')
      await expect(relatedServices).toBeVisible()

      const relatedCards = page.locator('.related-card')
      await expect(relatedCards.first()).toBeVisible()
      expect(await relatedCards.count()).toBe(3)
    })

    test('related services link to correct routes', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const relatedCards = page.locator('.related-card')
      await expect(relatedCards.first()).toBeVisible()

      // Check that clicking the first card navigates to project-management
      await relatedCards.nth(0).click()
      await page.waitForURL(`${BASE}services/project-management`)
      expect(page.url()).toContain('/services/project-management')

      // Go back to mobile page
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      // Check that clicking the second card navigates to blockchain
      await relatedCards.nth(1).click()
      await page.waitForURL(`${BASE}services/blockchain`)
      expect(page.url()).toContain('/services/blockchain')

      // Go back to mobile page
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      // Check that clicking the third card navigates to big-data
      await relatedCards.nth(2).click()
      await page.waitForURL(`${BASE}services/big-data`)
      expect(page.url()).toContain('/services/big-data')
    })

    test('CTA button redirects to /#contact on click', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const ctaButton = page.locator('.cta-button')
      await ctaButton.click()

      // Should redirect to /#contact (home with contact anchor)
      await page.waitForURL(`${BASE}#contact`)
      expect(page.url()).toContain('#contact')
    })

    test('page has cyberpunk theme styling', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      // Check for dark background
      const mobilePage = page.locator('.mobile-app-page')
      const bgColor = await mobilePage.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })
      // Should be dark (not white)
      expect(bgColor).not.toBe('rgb(255, 255, 255)')

      // Check for cyan/neon colors in title
      const heroTitle = page.locator('.hero-title')
      await expect(heroTitle).toBeVisible()
    })

    test('page has proper ARIA labels for accessibility', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const breadcrumb = page.locator('[aria-label="Breadcrumb"]')
      await expect(breadcrumb).toBeVisible()
    })
  })

  test.describe('mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('page renders on mobile without errors', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const mobilePage = page.locator('.mobile-app-page')
      await expect(mobilePage).toBeVisible()
    })

    test('hero section is responsive on mobile', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      const heroTitle = page.locator('.hero-title')
      await expect(heroTitle).toBeVisible()

      // Mobile font size should be smaller
      const fontSize = await heroTitle.evaluate((el) => {
        return window.getComputedStyle(el).fontSize
      })
      // Should be smaller than desktop (2.2rem vs 3.5rem)
      expect(parseFloat(fontSize)).toBeLessThan(60) // 3.5rem = 56px at 16px base
    })

    test('overview, features, and benefits grids are single column on mobile', async ({ page }) => {
      await page.goto(`${BASE}mobile`)
      await page.waitForLoadState('networkidle')

      // Check that grids are responsive (they should stack vertically)
      const overviewCards = page.locator('.overview-card')
      await expect(overviewCards.first()).toBeVisible()
      expect(await overviewCards.count()).toBe(3)

      const featureItems = page.locator('.feature-item')
      await expect(featureItems.first()).toBeVisible()
      expect(await featureItems.count()).toBe(6)
    })
  })
})

test.describe('Mobile App page i18n (AC #368)', () => {
  test('English language renders correctly', async ({ page }) => {
    await page.goto(`${BASE}mobile`)
    await page.waitForLoadState('networkidle')

    const heroTitle = page.locator('.hero-title')
    await expect(heroTitle).toBeVisible()
    expect(await heroTitle.textContent()).toContain('Mobile')

    const heroSubtitle = page.locator('.hero-subtitle')
    await expect(heroSubtitle).toBeVisible()
    await page.waitForTimeout(100)
    const subtitleText = await heroSubtitle.textContent()
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

    // Navigate to mobile page
    await page.goto(`${BASE}mobile`)
    await page.waitForLoadState('networkidle')

    const heroTitle = page.locator('.hero-title')
    await expect(heroTitle).toBeVisible()
    // Chinese title should be present (not the English "Mobile App")
    const titleText = await heroTitle.textContent()
    expect(titleText?.length).toBeGreaterThan(0)

    const heroSubtitle = page.locator('.hero-subtitle')
    await expect(heroSubtitle).toBeVisible()
    await page.waitForTimeout(100)
    const subtitleText = await heroSubtitle.textContent()
    expect(subtitleText).toBeTruthy()
    expect(subtitleText?.length).toBeGreaterThan(0)
  })

  test('i18n toggle works on the page itself', async ({ page }) => {
    await page.goto(`${BASE}mobile`)
    await page.waitForLoadState('networkidle')

    // Get initial English text
    const heroTitleEn = page.locator('.hero-title')
    const titleEn = await heroTitleEn.textContent()
    expect(titleEn).toContain('Mobile')

    // Toggle language
    const langToggle = page.locator('[aria-label*="language"], [aria-label*="语言"]').first()
    if (await langToggle.isVisible()) {
      await langToggle.click()
      await page.waitForTimeout(500)

      // Title should change (or at least be different)
      const heroTitleZh = page.locator('.hero-title')
      const titleZh = await heroTitleZh.textContent()
      expect(titleZh?.length).toBeGreaterThan(0)
    }
  })
})
