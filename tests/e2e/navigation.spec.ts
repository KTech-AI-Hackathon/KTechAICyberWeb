import { test, expect } from './fixtures/test-fixtures';
import { NAVIGATION_LINKS } from './fixtures/test-data';

/**
 * Navigation E2E Tests
 *
 * Tests for navigation menu functionality
 * Priority: Smoke
 * @tags smoke regression
 */

/**
 * SKIP (obsolete): this spec drives a hash-based single-page navigation that no
 * longer exists. It expects `.nav-links a[href="#services"|#honors"|#contact"]`
 * anchors that smooth-scroll to `#services`/`#honors`/`#contact` sections on
 * the Home page, plus a `.scrolled` class on a `.nav` element and a clickable
 * nav logo. The current app is a multi-route SPA: the nav (App.vue `.cyber-nav`)
 * uses router-links to `/`, `/about`, `/news`, `/contact` (no hash links), the
 * Home page has no `#services`/`#honors`/`#contact` sections, and there is no
 * `.scrolled`-class behavior. The NAVIGATION_LINKS fixture (服务/荣誉/联系 hash
 * links) is similarly stale. This is a fundamental redesign, not test drift.
 * Skipped (not deleted). Live nav/routing is covered by 140-router-base.spec.ts
 * and theme.spec.ts (theme consistency across nav).
 */
test.describe.skip('Navigation Menu', { tag: '@smoke' }, () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should display navigation bar', async ({ homePage }) => {
    // Verify navbar is visible
    await expect(homePage.navbar).toBeVisible();
  });

  test('should display all navigation links', async ({ homePage }) => {
    // Check each navigation link exists
    for (const link of NAVIGATION_LINKS) {
      const navLink = homePage.page.locator(`.nav-links a[href="${link.href}"]`);
      await expect(navLink).toBeVisible();
      await expect(navLink).toContainText(link.text);
    }
  });

  test('should navigate to services section', async ({ homePage }) => {
    // Click services link
    await homePage.clickNavLink('services');

    // Wait a moment for smooth scroll
    await homePage.page.waitForTimeout(500);

    // Verify URL contains services hash
    expect(homePage.getUrl()).toContain('#services');

    // Verify services section is in view
    const servicesSection = homePage.page.locator('#services');
    const isVisible = await servicesSection.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('should navigate to honors section', async ({ homePage }) => {
    // Click honors link
    await homePage.clickNavLink('honors');

    // Wait for smooth scroll
    await homePage.page.waitForTimeout(500);

    // Verify URL contains honors hash
    expect(homePage.getUrl()).toContain('#honors');

    // Verify honors section is visible
    await expect(homePage.honorsSection).toBeVisible();
  });

  test('should navigate to contact section', async ({ homePage }) => {
    // Click contact link
    await homePage.clickNavLink('contact');

    // Wait for smooth scroll
    await homePage.page.waitForTimeout(500);

    // Verify URL contains contact hash
    expect(homePage.getUrl()).toContain('#contact');

    // Verify contact section is visible
    await expect(homePage.contactSection).toBeVisible();
  });

  test('should apply scrolled class to navbar on scroll', async ({ homePage }) => {
    // Initially navbar should not have scrolled class
    await expect(homePage.navbar).not.toHaveClass(/scrolled/);

    // Scroll down
    await homePage.page.evaluate(() => window.scrollTo(0, 100));

    // Wait for scroll event to trigger
    await homePage.page.waitForTimeout(100);

    // Navbar should now have scrolled class
    await expect(homePage.navbar).toHaveClass(/scrolled/);
  });

  test('should highlight active navigation link on hover', async ({ homePage }) => {
    const link = homePage.servicesLink;

    // Get initial color
    const initialColor = await link.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Hover over link
    await link.hover();

    // Wait for transition
    await homePage.page.waitForTimeout(100);

    // Color should change (cyan color expected)
    const hoverColor = await link.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Colors should be different (hover effect applied)
    expect(hoverColor).not.toBe(initialColor);
  });

  test('nav logo should link to home', async ({ homePage }) => {
    // Scroll to services section
    await homePage.scrollToSection('services');
    await homePage.page.waitForTimeout(500);

    // Click logo
    await homePage.navLogo.click();

    // Should scroll to top
    await homePage.page.waitForTimeout(500);

    const scrollY = await homePage.page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });
});
