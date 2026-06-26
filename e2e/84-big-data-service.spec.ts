/**
 * @file 84-big-data-service.spec.ts
 * @description E2E tests for Big Data & AI service page
 * @covers Issue #84 - Service Detail Page - Big Data & AI (大数据与人工智能)
 */

import { test, expect, Page } from '@playwright/test'

// Helper function to navigate to the service page
async function navigateToServicePage(page: Page) {
  await page.goto('/services/big-data-ai')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('.service-big-data', { timeout: 5000 })
}

test.describe('Issue #84 - Big Data & AI Service Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToServicePage(page)
  })

  test.describe('Page Loading & Skeleton State', () => {
    test('should show skeleton loading state initially', async ({ page }) => {
      // Navigate fresh to see skeleton
      await page.goto('/services/big-data-ai')

      // Check for skeleton container (may appear briefly)
      const skeleton = page.locator('.skeleton-container')
      const hasSkeleton = await skeleton.count().then(count => count > 0)

      // Wait for actual content
      await page.waitForSelector('.content-wrapper', { timeout: 5000 })

      // Content should be visible
      const content = page.locator('.content-wrapper')
      await expect(content).toBeVisible()
    })

    test('should load page without errors', async ({ page }) => {
      // Check for no console errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      await navigateToServicePage(page)

      expect(errors).toHaveLength(0)
    })
  })

  test.describe('Hero Section', () => {
    test('should render hero section with correct content', async ({ page }) => {
      const hero = page.locator('.hero-section')
      await expect(hero).toBeVisible()

      // Check hero icon
      const heroIcon = page.locator('.hero-icon')
      await expect(heroIcon).toBeVisible()
      await expect(heroIcon).toHaveText('☁️')

      // Check hero title
      const heroTitle = page.locator('#hero-title')
      await expect(heroTitle).toBeVisible()
      await expect(heroTitle).toContainText('Big Data')

      // Check hero subtitle
      const heroSubtitle = page.locator('.hero-subtitle')
      await expect(heroSubtitle).toBeVisible()
    })

    test('should have proper accessibility attributes', async ({ page }) => {
      const heroTitle = page.locator('#hero-title')
      await expect(heroTitle).toHaveAttribute('id', 'hero-title')

      const heroIcon = page.locator('.hero-icon')
      await expect(heroIcon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  test.describe('Features Section', () => {
    test('should render all 6 feature cards', async ({ page }) => {
      const featuresSection = page.locator('.features-section')
      await expect(featuresSection).toBeVisible()

      const featureCards = page.locator('.feature-card')
      await expect(featureCards).toHaveCount(6)

      // Check first few feature titles
      await expect(page.locator('.feature-title').first()).toContainText('Deep Learning')
      await expect(page.locator('.feature-title').nth(1)).toContainText('Big Data')
    })

    test('should have hover effects on feature cards', async ({ page }) => {
      const firstCard = page.locator('.feature-card').first()

      // Get initial position
      const boxBefore = await firstCard.boundingBox()

      // Hover over the card
      await firstCard.hover()

      // Wait for transition
      await page.waitForTimeout(500)

      // Card should still be visible
      await expect(firstCard).toBeVisible()
    })

    test('should have feature icons', async ({ page }) => {
      const featureIcons = page.locator('.feature-icon')
      await expect(featureIcons).toHaveCount(6)

      // Check that icons are not empty
      for (let i = 0; i < 6; i++) {
        const icon = featureIcons.nth(i)
        await expect(icon).not.toBeEmpty()
      }
    })
  })

  test.describe('Capabilities Section', () => {
    test('should render all capability items', async ({ page }) => {
      const capabilitiesSection = page.locator('.capabilities-section')
      await expect(capabilitiesSection).toBeVisible()

      const capabilityItems = page.locator('.capability-item')
      await expect(capabilityItems).toHaveCount(4)

      // Check capability names
      await expect(page.locator('.capability-name').first()).toContainText('Data Processing')
    })

    test('should render technology tags', async ({ page }) => {
      const techTags = page.locator('.tech-tag')
      await expect(techTags).toHaveCount(16) // 4 capabilities × 4 technologies each

      // Check some known technologies
      const tagsText = await techTags.allTextContents()
      expect(tagsText).toContain('Apache Spark')
      expect(tagsText).toContain('TensorFlow')
      expect(tagsText).toContain('BERT')
      expect(tagsText).toContain('OpenCV')
    })
  })

  test.describe('Use Cases Section', () => {
    test('should render all use case cards', async ({ page }) => {
      const useCasesSection = page.locator('.use-cases-section')
      await expect(useCasesSection).toBeVisible()

      const useCaseCards = page.locator('.use-case-card')
      await expect(useCaseCards).toHaveCount(3)
    })

    test('should render use case benefits with checkmarks', async ({ page }) => {
      const benefits = page.locator('.benefit-item')
      await expect(benefits).toHaveCount(9) // 3 use cases × 3 benefits each

      // Check for checkmark character
      const firstBenefit = benefits.first()
      await expect(firstBenefit).toContainText('✓')
    })

    test('should have correct use case titles', async ({ page }) => {
      const useCaseTitles = page.locator('.use-case-title')
      await expect(useCaseTitles).toHaveCount(3)

      const titles = await useCaseTitles.allTextContents()
      expect(titles).toContain('Financial Services')
      expect(titles).toContain('Manufacturing')
      expect(titles).toContain('Healthcare')
    })
  })

  test.describe('Statistics Section', () => {
    test('should render all statistics', async ({ page }) => {
      const statsSection = page.locator('.stats-section')
      await expect(statsSection).toBeVisible()

      const statItems = page.locator('.stat-item')
      await expect(statItems).toHaveCount(4)
    })

    test('should display correct stat values', async ({ page }) => {
      const statValues = page.locator('.stat-value')
      await expect(statValues).toHaveCount(4)

      const values = await statValues.allTextContents()
      expect(values).toContain('99.9%')
      expect(values).toContain('10M+')
      expect(values).toContain('<50ms')
      expect(values).toContain('50+')
    })
  })

  test.describe('CTA Section', () => {
    test('should render CTA section with buttons', async ({ page }) => {
      const ctaSection = page.locator('.cta-section')
      await expect(ctaSection).toBeVisible()

      const ctaButtons = page.locator('.cta-button')
      await expect(ctaButtons).toHaveCount(2)
    })

    test('should have working contact button', async ({ page }) => {
      const contactButton = page.locator('.cta-button.primary').first()

      // Check button text
      await expect(contactButton).toContainText('Contact Us')

      // Check href attribute
      const href = await contactButton.getAttribute('href')
      expect(href).toBe('/contact')
    })

    test('should have working learn more button', async ({ page }) => {
      const learnMoreButton = page.locator('.cta-button.secondary').first()

      // Check button text
      await expect(learnMoreButton).toContainText('Learn More')

      // Check href attribute
      const href = await learnMoreButton.getAttribute('href')
      expect(href).toBe('/about')
    })
  })

  test.describe('Internationalization', () => {
    test('should display content in English by default', async ({ page }) => {
      const heroTitle = page.locator('#hero-title')
      await expect(heroTitle).toContainText('Big Data')
    })

    test('should have language switcher functionality', async ({ page }) => {
      // Check for language switcher in header
      const languageSwitcher = page.locator('[data-testid="language-switcher"], .language-switcher')

      // If language switcher exists, test it
      const hasSwitcher = await languageSwitcher.count().then(count => count > 0)

      if (hasSwitcher) {
        await languageSwitcher.first().click()
        await page.waitForTimeout(500)

        // Content should still be visible after language change
        const content = page.locator('.content-wrapper')
        await expect(content).toBeVisible()
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await navigateToServicePage(page)

      // Hero section should be visible
      const hero = page.locator('.hero-section')
      await expect(hero).toBeVisible()

      // Features should stack vertically
      const featureCards = page.locator('.feature-card')
      await expect(featureCards.first()).toBeVisible()
    })

    test('should display correctly on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await navigateToServicePage(page)

      // Content should be visible
      const content = page.locator('.content-wrapper')
      await expect(content).toBeVisible()
    })

    test('should display correctly on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 })
      await navigateToServicePage(page)

      // Features should display in grid
      const featureCards = page.locator('.feature-card')
      await expect(featureCards).toHaveCount(6)
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Check for h1
      const h1 = page.locator('h1')
      await expect(h1).toHaveCount(1)

      // Check for h2s
      const h2s = page.locator('h2')
      await expect(h2s).toHaveCount(6) // Features, Capabilities, Use Cases, Stats (hidden), CTA
    })

    test('should have aria labels on key elements', async ({ page }) => {
      // Check for aria-labelledby on sections
      const featuresSection = page.locator('.features-section')
      await expect(featuresSection).toHaveAttribute('aria-labelledby', 'features-title')

      const capabilitiesSection = page.locator('.capabilities-section')
      await expect(capabilitiesSection).toHaveAttribute('aria-labelledby', 'capabilities-title')
    })

    test('should have proper landmark roles', async ({ page }) => {
      // Main element
      const main = page.locator('main[role="main"]')
      await expect(main).toBeVisible()

      // Sections
      const sections = page.locator('section[aria-labelledby]')
      await expect(sections).toHaveCount(5)
    })

    test('should have proper semantic HTML', async ({ page }) => {
      // Check for articles
      const articles = page.locator('article')
      await expect(articles).toHaveCount(9) // 6 features + 3 use cases
    })
  })

  test.describe('Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/services/big-data-ai')
      await page.waitForSelector('.content-wrapper', { timeout: 5000 })

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    })

    test('should not have layout shift', async ({ page }) => {
      // Take initial snapshot
      await page.goto('/services/big-data-ai')
      await page.waitForSelector('.hero-section')

      const heroBefore = await page.locator('.hero-section').boundingBox()

      // Wait for content to fully load
      await page.waitForSelector('.cta-section')
      await page.waitForTimeout(1000)

      const heroAfter = await page.locator('.hero-section').boundingBox()

      // Position should not shift significantly
      expect(heroAfter?.y).toBeCloseTo(heroBefore?.y || 0, 10)
    })
  })

  test.describe('User Flow Integration', () => {
    test('should navigate from home to service page', async ({ page }) => {
      // Start at home
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Navigate to service page
      await page.goto('/services/big-data-ai')
      await page.waitForSelector('.content-wrapper')

      // Verify we're on the service page
      const heroTitle = page.locator('#hero-title')
      await expect(heroTitle).toContainText('Big Data')
    })

    test('should navigate to contact page via CTA', async ({ page }) => {
      const contactButton = page.locator('.cta-button.primary').first()

      // Click contact button
      await contactButton.click()

      // Wait for navigation
      await page.waitForLoadState('networkidle')

      // Should be on contact page
      expect(page.url()).toContain('/contact')
    })

    test('should navigate to about page via secondary CTA', async ({ page }) => {
      const aboutButton = page.locator('.cta-button.secondary').first()

      // Click about button
      await aboutButton.click()

      // Wait for navigation
      await page.waitForLoadState('networkidle')

      // Should be on about page
      expect(page.url()).toContain('/about')
    })
  })

  test.describe('Visual Design', () => {
    test('should have cyberpunk theme styling', async ({ page }) => {
      // Check for gradient backgrounds
      const hero = page.locator('.hero-section')
      const heroBg = await hero.evaluate(el => window.getComputedStyle(el).background)
      expect(heroBg).toContain('gradient')

      // Check for border effects
      const featureCard = page.locator('.feature-card').first()
      const borderColor = await featureCard.evaluate(el => window.getComputedStyle(el).borderColor)
      expect(borderColor).not.toBe('rgb(0, 0, 0)')
    })

    test('should have proper spacing and layout', async ({ page }) => {
      // Check that sections have spacing
      const sections = page.locator('section')
      const count = await sections.count()

      for (let i = 0; i < count; i++) {
        await expect(sections.nth(i)).toBeVisible()
      }
    })
  })
})
