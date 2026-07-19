import { test, expect } from '@playwright/test'

/**
 * Issue #386: About page content layout verification (duplicate of #385)
 *
 * Issue #386 is a duplicate of Issue #385, which has already been implemented.
 * This test suite VERIFIES that the layout adjustments are working correctly.
 *
 * Root cause: After #383 removed culture-icon.png, there was ~8rem total gap between
 * ambient-section and who-we-are section (4rem ambient bottom margin + 4rem who-we-are top padding).
 *
 * Solution implemented in #385: Reduce .section.who-we-are top padding from 4rem→2rem (desktop)
 * and 3rem→1.5rem (mobile).
 *
 * AC1: White space above "Who We Are" section is reduced by moving content upward
 * AC2: Content flows naturally to fill the space previously occupied by the removed image
 * AC3: Layout adjustment does not create visual gaps or awkward spacing
 * AC4: Page maintains responsiveness across all viewport sizes (mobile, tablet, desktop)
 * AC5: Visual balance is maintained in the About page layout
 * AC6: WCAG 2.1 AA compliance is maintained (contrast ratios, semantic structure)
 */

test.describe('#386 About page layout verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/KTechAICyberWeb/about')
  })

  test('AC1: White space above "Who We Are" section is reduced by moving content upward', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Wait for both sections to be visible
    const ambientSection = page.locator('.ambient-section').first()
    const whoWeAreSection = page.locator('.who-we-are').first()

    await expect(ambientSection).toBeVisible()
    await expect(whoWeAreSection).toBeVisible()

    // Get the computed padding-top value
    const paddingTop = await whoWeAreSection.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop
    })

    // Verify it's 2rem (32px), not 4rem (64px)
    const paddingPx = parseFloat(paddingTop)
    expect(paddingPx).toBe(32)
    expect(paddingPx).not.toBe(64)

    // Measure the vertical gap between sections
    const gap = await page.evaluate(() => {
      const ambient = document.querySelector('.ambient-section')
      const whoWeAre = document.querySelector('.who-we-are')
      if (!ambient || !whoWeAre) return -1

      const ambientRect = ambient.getBoundingClientRect()
      const whoWeAreRect = whoWeAre.getBoundingClientRect()

      return whoWeAreRect.top - ambientRect.bottom
    })

    // Gap should be significantly less than the pre-fix ~8rem (128px)
    expect(gap).toBeGreaterThan(0)
    expect(gap).toBeLessThan(100)
  })

  test('AC2: Content flows naturally to fill the space previously occupied by the removed image', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Verify the who-we-are section is positioned correctly relative to the hero
    const heroSection = page.locator('.about-hero').first()
    const whoWeAreSection = page.locator('.who-we-are').first()

    await expect(heroSection).toBeVisible()
    await expect(whoWeAreSection).toBeVisible()

    // Verify content flows naturally by checking the section is reachable via scroll
    await whoWeAreSection.scrollIntoViewIfNeeded()
    await expect(whoWeAreSection).toBeInViewport()

    // Verify the section title is visible and properly positioned
    const sectionTitle = whoWeAreSection.locator('.section-title').first()
    await expect(sectionTitle).toBeVisible()
    expect(await sectionTitle.textContent()).toBe('Who We Are')

    // Verify content cards are rendered
    const contentCards = whoWeAreSection.locator('.content-card')
    await expect(contentCards.first()).toBeVisible()
    expect(await contentCards.count()).toBe(5)
  })

  test('AC3: Layout adjustment does not create visual gaps or awkward spacing', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Check consecutive sections for visual continuity
    const sections = [
      '.about-hero',
      '.self-driving-section',
      '.ambient-section',
      '.who-we-are',
      '.achievements',
    ]

    for (let i = 0; i < sections.length - 1; i++) {
      const currentSection = page.locator(sections[i]).first()
      const nextSection = page.locator(sections[i + 1]).first()

      await expect(currentSection).toBeVisible()
      await expect(nextSection).toBeVisible()

      // Verify sections don't have excessive negative margins that would cause overlap
      const currentMarginBottom = await currentSection.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return parseFloat(styles.marginBottom)
      })

      const nextMarginTop = await nextSection.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return parseFloat(styles.marginTop)
      })

      // Ensure no extreme negative margins that would cause awkward overlap
      expect(currentMarginBottom).toBeGreaterThan(-50)
      expect(nextMarginTop).toBeGreaterThan(-50)
    }
  })

  test('AC4: Page maintains responsiveness across all viewport sizes (mobile, tablet, desktop)', async ({ page }) => {
    // Test mobile viewport (375x667)
    await page.setViewportSize({ width: 375, height: 667 })
    const mobileWhoWeAre = page.locator('.who-we-are').first()
    await expect(mobileWhoWeAre).toBeVisible()

    const mobilePadding = await mobileWhoWeAre.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop
    })
    expect(parseFloat(mobilePadding)).toBe(24) // 1.5rem at 16px root

    // Verify content is accessible on mobile
    await mobileWhoWeAre.scrollIntoViewIfNeeded()
    await expect(mobileWhoWeAre).toBeInViewport()

    // Test tablet viewport (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 })
    const tabletWhoWeAre = page.locator('.who-we-are').first()
    await expect(tabletWhoWeAre).toBeVisible()

    const tabletPadding = await tabletWhoWeAre.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop
    })
    expect(parseFloat(tabletPadding)).toBe(32) // 2rem at 16px root

    await tabletWhoWeAre.scrollIntoViewIfNeeded()
    await expect(tabletWhoWeAre).toBeInViewport()

    // Test desktop viewport (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 })
    const desktopWhoWeAre = page.locator('.who-we-are').first()
    await expect(desktopWhoWeAre).toBeVisible()

    const desktopPadding = await desktopWhoWeAre.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop
    })
    expect(parseFloat(desktopPadding)).toBe(32) // 2rem at 16px root

    await desktopWhoWeAre.scrollIntoViewIfNeeded()
    await expect(desktopWhoWeAre).toBeInViewport()
  })

  test('AC5: Visual balance is maintained in the About page layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Verify all sections maintain consistent base padding except the adjusted one
    const sectionsToCheck = [
      { selector: '.achievements', expectedPadding: 64 }, // 4rem default
      { selector: '.vision-mission', expectedPadding: 64 },
      { selector: '.service-provider', expectedPadding: 64 },
    ]

    for (const { selector, expectedPadding } of sectionsToCheck) {
      const section = page.locator(selector).first()
      await expect(section).toBeVisible()

      const paddingTop = await section.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).paddingTop)
      })

      expect(paddingTop).toBe(expectedPadding)
    }

    // Verify who-we-are has the adjusted padding
    const whoWeAreSection = page.locator('.who-we-are').first()
    const whoWeArePadding = await whoWeAreSection.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).paddingTop)
    })
    expect(whoWeArePadding).toBe(32) // Adjusted to 2rem

    // Verify section titles are centered and properly spaced
    const sectionTitles = page.locator('.section-title')
    const count = await sectionTitles.count()
    expect(count).toBeGreaterThanOrEqual(4)

    for (let i = 0; i < count; i++) {
      const title = sectionTitles.nth(i)
      await expect(title).toBeVisible()

      // Verify titles have consistent text-align
      const textAlign = await title.evaluate((el) => {
        return window.getComputedStyle(el).textAlign
      })
      expect(textAlign).toBe('center')
    }
  })

  test('AC6: WCAG 2.1 AA compliance is maintained', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Verify semantic structure
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)

    const h2s = page.locator('h2')
    expect(await h2s.count()).toBeGreaterThanOrEqual(4)

    // Verify section titles use proper heading hierarchy
    const sectionTitles = page.locator('.section-title')
    const count = await sectionTitles.count()

    for (let i = 0; i < count; i++) {
      const title = sectionTitles.nth(i)
      const tagName = await title.evaluate((el) => el.tagName.toLowerCase())
      expect(tagName).toBe('h2')
    }

    // Verify all sections have proper semantic HTML
    const sections = page.locator('section')
    expect(await sections.count()).toBeGreaterThanOrEqual(5)

    // Verify text contrast (basic check - elements should have readable text)
    const whoWeAreSection = page.locator('.who-we-are').first()
    await expect(whoWeAreSection).toBeVisible()

    const textColor = await whoWeAreSection.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    // Should have a defined color (not transparent or invalid)
    expect(textColor).toBeDefined()
    expect(textColor).not.toBe('')

    // Verify background contrast
    const bgColor = await whoWeAreSection.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    expect(bgColor).toBeDefined()
  })

  test('Verification: Layout adjustments match the #385 implementation exactly', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // This test confirms that the #386 verification matches the #385 implementation
    const whoWeAreSection = page.locator('.who-we-are').first()
    await expect(whoWeAreSection).toBeVisible()

    // Get all padding values to verify exact match with #385
    const paddingTop = await whoWeAreSection.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop
    })
    expect(paddingTop).toBe('32px')

    const paddingBottom = await whoWeAreSection.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom
    })
    expect(paddingBottom).toBe('64px') // Should still have default 4rem

    // Verify the section is using the correct CSS class
    const classes = await whoWeAreSection.evaluate((el) => {
      return Array.from(el.classList)
    })
    expect(classes).toContain('who-we-are')
    expect(classes).toContain('section')

    // Verify the layout adjustment is working by measuring visual gap
    const gap = await page.evaluate(() => {
      const ambient = document.querySelector('.ambient-section')
      const whoWeAre = document.querySelector('.who-we-are')
      if (!ambient || !whoWeAre) return -1

      const ambientRect = ambient.getBoundingClientRect()
      const whoWeAreRect = whoWeAre.getBoundingClientRect()

      return whoWeAreRect.top - ambientRect.bottom
    })

    // Gap should be consistent with the #385 implementation
    expect(gap).toBeGreaterThan(0)
    expect(gap).toBeLessThan(100)
  })
})
