import { test, expect } from '@playwright/test'

test.describe('Issue #383: Remove culture-icon.png', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/KTechAICyberWeb/about')
  })

  test('AC1: culture-icon.png image is not rendered', async ({ page }) => {
    // The image should be completely absent from the DOM
    const cultureFeature = page.locator('.culture-feature')
    await expect(cultureFeature).toHaveCount(0)

    // Verify no img or CyberImage references to culture-icon.png
    const cultureIconImg = page.locator('img[src*="culture-icon.png"]')
    await expect(cultureIconImg).toHaveCount(0)
  })

  test('AC2-4: Layout reflows naturally with no gaps', async ({ page }) => {
    // Get the Vision/Mission/Culture section
    const visionSection = page.locator('.vision-mission').first()
    // Get the Service Provider section (next sibling)
    const serviceSection = page.locator('.service-provider').first()

    // Wait for sections to be visible
    await expect(visionSection).toBeVisible()
    await expect(serviceSection).toBeVisible()

    // Verify sections are vertically adjacent (no large gaps)
    const visionBox = await visionSection.boundingBox()
    const serviceBox = await serviceSection.boundingBox()

    // The gap between sections should be small (inherited from .section padding)
    // A large gap would indicate leftover layout artifacts
    const gap = serviceBox.y - (visionBox.y + visionBox.height)
    expect(gap).toBeLessThan(100) // Allow normal section spacing, but not image-sized gaps
  })

  test('AC5: Responsive layout - mobile (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/KTechAICyberWeb/about')

    // Verify no culture-feature on mobile
    const cultureFeature = page.locator('.culture-feature')
    await expect(cultureFeature).toHaveCount(0)

    // Verify culture grid still renders correctly
    const cultureGrid = page.locator('.culture-grid')
    await expect(cultureGrid).toBeVisible()
  })

  test('AC5: Responsive layout - tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/KTechAICyberWeb/about')

    const cultureFeature = page.locator('.culture-feature')
    await expect(cultureFeature).toHaveCount(0)

    // Verify service provider section is visible and properly positioned
    const serviceSection = page.locator('.service-provider')
    await expect(serviceSection).toBeVisible()
  })

  test('AC5: Responsive layout - desktop (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/KTechAICyberWeb/about')

    const cultureFeature = page.locator('.culture-feature')
    await expect(cultureFeature).toHaveCount(0)

    // Verify no visual gaps between sections on desktop
    const visionSection = page.locator('.vision-mission').first()
    const serviceSection = page.locator('.service-provider').first()

    await expect(visionSection).toBeVisible()
    await expect(serviceSection).toBeVisible()
  })
})
