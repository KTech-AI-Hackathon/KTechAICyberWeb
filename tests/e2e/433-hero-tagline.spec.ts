import { test, expect } from '@playwright/test';

/**
 * Issue #433: Hero Tagline Update
 *
 * TDD Tests for hero tagline content changes:
 * - Verify new autonomous AI development messaging appears
 * - Verify text fits on mobile (375x667)
 * - Verify responsive behavior across 4 breakpoints
 * - Capture before/after screenshot evidence
 */

test.describe('#433 Hero Tagline - Content Tests', () => {
  test('should contain autonomous AI development messaging in English', async ({ page }) => {
    const BASE = '/KTechAICyberWeb/';
    await page.goto(BASE);

    // Wait for hero section to be visible
    const heroSection = page.locator('.hero, [class*="hero"], [class*="Hero"]').first();
    await expect(heroSection).toBeVisible();

    // Verify new tagline content appears
    const pageText = await page.textContent('body');
    expect(pageText).toContain('autonomous');
    expect(pageText).toContain('AI development');
    expect(pageText).toContain('self-driving');
    expect(pageText).toContain('pipelines');
  });

  test('should contain autonomous AI development messaging in Chinese', async ({ page }) => {
    const BASE = '/KTechAICyberWeb/';
    // Navigate to Chinese version
    await page.goto(`${BASE}zh`);

    // Wait for hero section to be visible
    const heroSection = page.locator('.hero, [class*="hero"], [class*="Hero"]').first();
    await expect(heroSection).toBeVisible();

    // Verify new Chinese tagline content appears
    const pageText = await page.textContent('body');
    expect(pageText).toContain('自主');
    expect(pageText).toContain('AI开发');
    expect(pageText).toContain('自我驱动');
    expect(pageText).toContain('管道');
  });
});

test.describe('#433 Hero Tagline - Mobile Fit Tests', () => {
  test('should not overflow on mobile viewport 375x667', async ({ page }) => {
    const BASE = '/KTechAICyberWeb/';
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE);

    // Wait for content to load
    const heroSection = page.locator('.hero, [class*="hero"], [class*="Hero"]').first();
    await expect(heroSection).toBeVisible();

    // Check for horizontal overflow (indicator of text fitting issues)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Body should not be wider than viewport (no horizontal scroll)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test('should display hero text without truncation on mobile', async ({ page }) => {
    const BASE = '/KTechAICyberWeb/';
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE);

    const heroSection = page.locator('.hero, [class*="hero"], [class*="Hero"]').first();
    await expect(heroSection).toBeVisible();

    // Get hero text elements
    const heroText = heroSection.locator('h1, h2, h3, p, .description, .tagline').all();

    for (const textElement of heroText) {
      const element = await textElement;
      if (element) {
        // Check if element is visible
        const isVisible = await element.isVisible();
        if (isVisible) {
          // Verify text is not truncated via CSS (no ellipsis in computed style)
          const textOverflow = await element.evaluate(el =>
            window.getComputedStyle(el).textOverflow
          );
          expect(textOverflow).not.toBe('ellipsis');
        }
      }
    }
  }
});

test.describe('#433 Hero Tagline - Breakpoint Tests', () => {
  const breakpoints = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  breakpoints.forEach(({ name, width, height }) => {
    test(`should display properly on ${name} (${width}x${height})`, async ({ page }) => {
      const BASE = '/KTechAICyberWeb/';
      await page.setViewportSize({ width, height });
      await page.goto(BASE);

      // Hero section should be visible
      const heroSection = page.locator('.hero, [class*="hero"], [class*="Hero"]').first();
      await expect(heroSection).toBeVisible();

      // Verify autonomous AI content is present
      const pageText = await page.textContent('body');
      expect(pageText).toContain('autonomous');

      // No horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(width);

      // Hero text elements should be visible
      const heroText = heroSection.locator('h1, h2, p, .description, .tagline').first();
      await expect(heroText).toBeVisible();
    });
  });

  breakpoints.forEach(({ name, width, height }) => {
    test(`should display Chinese properly on ${name} (${width}x${height})`, async ({ page }) => {
      const BASE = '/KTechAICyberWeb/';
      await page.setViewportSize({ width, height });
      await page.goto(`${BASE}zh`);

      // Hero section should be visible
      const heroSection = page.locator('.hero, [class*="hero"], [class*="Hero"]').first();
      await expect(heroSection).toBeVisible();

      // Verify autonomous AI content is present in Chinese
      const pageText = await page.textContent('body');
      expect(pageText).toContain('自主');

      // No horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(width);
    });
  });
});

test.describe('#433 Hero Tagline - Screenshot Evidence', () => {
  test('should capture English hero screenshot for evidence', async ({ page }) => {
    const BASE = '/KTechAICyberWeb/';
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE);

    // Wait for hero section
    const heroSection = page.locator('.hero, [class*="hero"], [class*="Hero"]').first();
    await expect(heroSection).toBeVisible();

    // Capture full page screenshot
    await page.screenshot({
      path: 'docs/case-studies/kttech-cyber/projects/433/evidence/hero-english-desktop.png',
      fullPage: true
    });

    // Capture mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: 'docs/case-studies/kttech-cyber/projects/433/evidence/hero-english-mobile.png',
      fullPage: true
    });
  });

  test('should capture Chinese hero screenshot for evidence', async ({ page }) => {
    const BASE = '/KTechAICyberWeb/';
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE}zh`);

    // Wait for hero section
    const heroSection = page.locator('.hero, [class*="hero"], [class*="Hero"]').first();
    await expect(heroSection).toBeVisible();

    // Capture full page screenshot
    await page.screenshot({
      path: 'docs/case-studies/kttech-cyber/projects/433/evidence/hero-chinese-desktop.png',
      fullPage: true
    });

    // Capture mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: 'docs/case-studies/kttech-cyber/projects/433/evidence/hero-chinese-mobile.png',
      fullPage: true
    });
  });
});
