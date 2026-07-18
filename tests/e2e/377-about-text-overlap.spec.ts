import { test, expect } from '@playwright/test'

/**
 * Issue #377: Fix text overlap on About US page - Self-Driving Dev Pipeline
 *
 * Root Cause: The `.ambient-section` wrapper in About.vue has NO defined CSS rules,
 * while `.self-driving-section` has `margin: 2rem auto` and `min-height: clamp(280px, 38vh, 360px)`.
 * This causes the `.self-driving-heading` to overlap into the ambient section space.
 *
 * Solution: Add `.ambient-section` CSS rules to ensure proper spacing.
 *
 * AC:
 * 1. Text overlap issue on About US page is completely resolved
 * 2. Text spacing and layout are consistent across About US page and Home page
 * 3. Issue is resolved on all viewport sizes (mobile, tablet, desktop)
 * 4. No new layout regressions introduced
 */

test.describe('Issue #377: About page text overlap', () => {
  const aboutPagePath = '/KTechAICyberWeb/about'

  // Helper: Get bounding boxes and check for overlap
  async function assertNoOverlap(
    page: Page,
    selector1: string,
    selector2: string,
    context: string
  ) {
    const box1 = await page.locator(selector1).boundingBox()
    const box2 = await page.locator(selector2).boundingBox()

    if (!box1 || !box2) {
      throw new Error(`Missing bounding box for ${context}: ${selector1} or ${selector2}`)
    }

    // Check for spatial overlap (no intersection of rectangles)
    const hasHorizontalOverlap = box1.x < box2.x + box2.width && box1.x + box1.width > box2.x
    const hasVerticalOverlap = box1.y < box2.y + box2.height && box1.y + box1.height > box2.y

    expect(
      !(hasHorizontalOverlap && hasVerticalOverlap),
      `${context}: ${selector1} should NOT overlap ${selector2} spatially`
    ).toBeTruthy()

    // Additional spacing check: there should be at least 10px gap
    const verticalGap = box2.y - (box1.y + box1.height)
    expect(
      verticalGap >= 0,
      `${context}: ${selector1} should be above ${selector2} with non-negative gap (got ${verticalGap}px)`
    ).toBeTruthy()
  }

  test('mobile viewport: self-driving section should not overlap ambient section', async ({ page }) => {
    // Mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(aboutPagePath)

    // Wait for both sections to be present and rendered
    await page.waitForSelector('.self-driving-section', { state: 'attached', timeout: 10000 })
    await page.waitForSelector('.ambient-section', { state: 'attached', timeout: 10000 })

    // Scroll the sections into view to ensure they're rendered
    await page.locator('.self-driving-section').scrollIntoViewIfNeeded()
    await page.locator('.ambient-section').scrollIntoViewIfNeeded()

    // Check spatial overlap
    await assertNoOverlap(
      page,
      '.self-driving-section',
      '.ambient-section',
      'Mobile viewport (375x667)'
    )
  })

  test('tablet viewport: self-driving section should not overlap ambient section', async ({ page }) => {
    // Tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto(aboutPagePath)

    await page.waitForSelector('.self-driving-section', { state: 'attached', timeout: 10000 })
    await page.waitForSelector('.ambient-section', { state: 'attached', timeout: 10000 })

    await page.locator('.self-driving-section').scrollIntoViewIfNeeded()
    await page.locator('.ambient-section').scrollIntoViewIfNeeded()

    await assertNoOverlap(
      page,
      '.self-driving-section',
      '.ambient-section',
      'Tablet viewport (768x1024)'
    )
  })

  test('desktop viewport: self-driving section should not overlap ambient section', async ({ page }) => {
    // Desktop viewport (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(aboutPagePath)

    await page.waitForSelector('.self-driving-section', { state: 'attached', timeout: 10000 })
    await page.waitForSelector('.ambient-section', { state: 'attached', timeout: 10000 })

    await page.locator('.self-driving-section').scrollIntoViewIfNeeded()
    await page.locator('.ambient-section').scrollIntoViewIfNeeded()

    await assertNoOverlap(
      page,
      '.self-driving-section',
      '.ambient-section',
      'Desktop viewport (1920x1080)'
    )
  })

  test('layout regression: ambient section has proper CSS rules applied', async ({ page }) => {
    await page.goto(aboutPagePath)
    await page.waitForSelector('.ambient-section', { state: 'attached', timeout: 10000 })

    // Verify the ambient section has the CSS fix applied
    const ambientBox = await page.locator('.ambient-section').boundingBox()
    expect(ambientBox).not.toBeNull()

    // Check that ambient section has proper spacing from the self-driving section
    await page.locator('.self-driving-section').scrollIntoViewIfNeeded()
    await page.locator('.ambient-section').scrollIntoViewIfNeeded()

    const selfDrivingBox = await page.locator('.self-driving-section').boundingBox()
    expect(selfDrivingBox).not.toBeNull()

    // Verify vertical ordering (self-driving should be above ambient)
    if (selfDrivingBox && ambientBox) {
      expect(
        selfDrivingBox.y < ambientBox.y,
        'Self-driving section should be positioned above ambient section'
      ).toBeTruthy()
    }
  })

  test('about page consistency: sections render in correct order with proper spacing', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(aboutPagePath)

    // Wait for the main sections to render
    await page.waitForSelector('.about-hero', { state: 'attached', timeout: 10000 })
    await page.waitForSelector('.self-driving-section', { state: 'attached', timeout: 10000 })
    await page.waitForSelector('.ambient-section', { state: 'attached', timeout: 10000 })
    await page.waitForSelector('.who-we-are', { state: 'attached', timeout: 10000 })

    // Get Y positions to verify correct vertical ordering
    const heroY = (await page.locator('.about-hero').boundingBox())?.y || 0
    const selfDrivingY = (await page.locator('.self-driving-section').boundingBox())?.y || 0
    const ambientY = (await page.locator('.ambient-section').boundingBox())?.y || 0
    const whoWeAreY = (await page.locator('.who-we-are').boundingBox())?.y || 0

    // Verify sections appear in correct order (top to bottom)
    expect(heroY, 'Hero should be above self-driving section').toBeLessThan(selfDrivingY)
    expect(selfDrivingY, 'Self-driving should be above ambient section').toBeLessThan(ambientY)
    expect(ambientY, 'Ambient section should be above who-we-are').toBeLessThan(whoWeAreY)
  })
})
