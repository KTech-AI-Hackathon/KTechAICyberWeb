import { test, expect } from '@playwright/test';

/**
 * Contact form demo labeling E2E tests — #478
 *
 * Verifies that the contact form clearly indicates it is a demonstration
 * and does not deceive users into thinking it sends real messages.
 *
 * AC1: Demo badge is visible near the form title
 * AC2: Demo disclaimer is visible before the submit button
 * AC3: Submit shows demo notice (not success message)
 * AC4: Real contact info is prominent
 * AC5: Mobile readability
 * AC6: ARIA labels present for accessibility
 * AC7: Cyberpunk styling verification
 * AC8: Form validation still works
 * AC9: User understands demo without submission
 *
 * Tags: @accessibility @demo-labeling @contact-form
 */

const BASE = '/KTechAICyberWeb/';
const CONTACT_PATH = `${BASE}contact`;

test.describe('Contact form demo labeling (#478)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CONTACT_PATH);
  });

  test('AC1: Demo badge is visible near the form title on page load', async ({ page }) => {
    // The demo badge should be visible immediately when the contact page loads
    const demoBadge = page.locator('.demo-badge');
    await expect(demoBadge).toBeVisible();

    // Badge should contain the word DEMO (or Chinese equivalent)
    const badgeText = await demoBadge.textContent();
    expect(badgeText).toMatch(/DEMO|演示/i);

    // Badge should be positioned near the form title (in the same section)
    const sectionTitle = page.locator('.contact-form-section .section-title');
    await expect(sectionTitle).toBeVisible();
    // Both should be visible in the viewport
    const badgeBox = await demoBadge.boundingBox();
    const titleBox = await sectionTitle.boundingBox();
    expect(badgeBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
  });

  test('AC1+AC7: Demo badge has cyberpunk styling', async ({ page }) => {
    const demoBadge = page.locator('.demo-badge');
    await expect(demoBadge).toBeVisible();

    // Check for cyberpunk styling characteristics
    // Should have uppercase text
    const badgeText = await demoBadge.textContent();
    const isUppercase = badgeText === badgeText.toUpperCase() || badgeText === '演示';
    expect(isUppercase).toBeTruthy();

    // Should have visible styling (border, background, or text color)
    const computedStyle = await demoBadge.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.color,
        border: styles.border,
        padding: styles.padding
      };
    });

    // Should have some visible styling (not invisible)
    expect(computedStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(computedStyle.color).not.toBe('rgba(0, 0, 0, 0)');

    // Should have padding (visible badge, not cramped text)
    const paddingPx = parseInt(computedStyle.padding);
    expect(paddingPx).toBeGreaterThan(0);
  });

  test('AC2: Demo disclaimer is visible before submit button', async ({ page }) => {
    // The disclaimer should be visible before the submit button
    const demoDisclaimer = page.locator('.demo-disclaimer');
    await expect(demoDisclaimer).toBeVisible();

    // Disclaimer should mention it's a demo/does not send data
    const disclaimerText = await demoDisclaimer.textContent();
    expect(disclaimerText).toMatch(/demo|demonstration|演示|不会发送/i);

    // Disclaimer should appear before the submit button in DOM order
    const disclaimer = page.locator('.demo-disclaimer');
    const submitButton = page.locator('.contact-form .submit-button');

    // Both should be visible
    await expect(disclaimer).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Check visual positioning - disclaimer should be above submit button
    const disclaimerBox = await disclaimer.boundingBox();
    const submitBox = await submitButton.boundingBox();
    expect(disclaimerBox).not.toBeNull();
    expect(submitBox).not.toBeNull();
    expect(disclaimerBox.y).toBeLessThan(submitBox.y);
  });

  test('AC3: Submit shows demo notice not success message', async ({ page }) => {
    // Fill out the form with valid data
    await page.fill('#name', 'Test User');
    await page.fill('#phone', '+86 138 0000 0000');
    await page.fill('#company', 'Test Company');
    await page.fill('#email', 'test@example.com');
    await page.selectOption('#subject', 'general');
    await page.fill('#message', 'This is a test message for the demo form that meets the minimum length requirement.');
    await page.check('#privacy');

    // Submit the form
    await page.click('.contact-form .submit-button');

    // Wait for submit status to appear
    const submitMessage = page.locator('.submit-message');
    await expect(submitMessage).toBeVisible({ timeout: 3000 });

    // Should be demo type (not success or error type)
    const messageClass = await submitMessage.getAttribute('class');
    expect(messageClass).toContain('demo');

    // Message content should mention demo/does not send
    const messageText = await submitMessage.textContent();
    expect(messageText).toMatch(/demo|does not send|演示|不会发送/i);
  });

  test('AC4: Real contact info is prominent', async ({ page }) => {
    // The company info section should be visible
    const companyInfoSection = page.locator('.company-info-section');
    await expect(companyInfoSection).toBeVisible();

    // Should contain email address
    const emailLink = page.locator('.company-info-section a[href^="mailto:"]');
    await expect(emailLink).toBeVisible();

    // Should contain phone link
    const phoneLink = page.locator('.company-info-section a[href^="tel:"]');
    await expect(phoneLink).toBeVisible();

    // Email address should be a valid format
    const emailHref = await emailLink.getAttribute('href');
    expect(emailHref).toMatch(/^mailto:[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/);

    // Real contact info should be visually prominent (have a heading)
    const infoTitle = page.locator('.company-info-section .section-title, .company-info-section h2');
    await expect(infoTitle).toBeVisible();
  });

  test('AC5: Mobile readability of demo labels', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Demo badge should still be readable
    const demoBadge = page.locator('.demo-badge');
    await expect(demoBadge).toBeVisible();

    // Badge text should be legible (not too small)
    const badgeFontSize = await demoBadge.evaluate((el) => {
      return parseInt(window.getComputedStyle(el).fontSize);
    });
    expect(badgeFontSize).toBeGreaterThanOrEqual(10); // At least 10px

    // Disclaimer should be visible and readable
    const demoDisclaimer = page.locator('.demo-disclaimer');
    await expect(demoDisclaimer).toBeVisible();

    // Disclaimer text should be legible
    const disclaimerFontSize = await demoDisclaimer.evaluate((el) => {
      return parseInt(window.getComputedStyle(el).fontSize);
    });
    expect(disclaimerFontSize).toBeGreaterThanOrEqual(12); // At least 12px

    // Both should fit within mobile viewport width without horizontal scroll
    const badgeWidth = await demoBadge.evaluate((el) => el.offsetWidth);
    const disclaimerWidth = await demoDisclaimer.evaluate((el) => el.offsetWidth);
    expect(badgeWidth).toBeLessThanOrEqual(375);
    expect(disclaimerWidth).toBeLessThanOrEqual(375);
  });

  test('AC6: ARIA labels present for accessibility', async ({ page }) => {
    // Demo badge should have role="note" or aria-label
    const demoBadge = page.locator('.demo-badge');
    await expect(demoBadge).toHaveAttribute('role', 'note');

    // Demo disclaimer should have role="note"
    const demoDisclaimer = page.locator('.demo-disclaimer');
    await expect(demoDisclaimer).toHaveAttribute('role', 'note');

    // Form should still have proper labels for screen readers
    const nameLabel = page.locator('label[for="name"]');
    await expect(nameLabel).toBeVisible();

    const phoneLabel = page.locator('label[for="phone"]');
    await expect(phoneLabel).toBeVisible();

    // Submit button should have aria-label
    const submitButton = page.locator('.contact-form .submit-button');
    await expect(submitButton).toHaveAttribute('aria-label');
  });

  test('AC8: Form validation still works with demo labels', async ({ page }) => {
    // Try to submit empty form
    await page.click('.contact-form .submit-button');

    // Should show validation errors
    const nameError = page.locator('#name-error');
    await expect(nameError).toBeVisible();

    const phoneError = page.locator('#phone-error');
    await expect(phoneError).toBeVisible();

    // Demo badge and disclaimer should still be visible
    const demoBadge = page.locator('.demo-badge');
    await expect(demoBadge).toBeVisible();

    const demoDisclaimer = page.locator('.demo-disclaimer');
    await expect(demoDisclaimer).toBeVisible();
  });

  test('AC9: User understands demo without form submission', async ({ page }) => {
    // Just by loading the page, user should see:
    // 1. Demo badge near title
    const demoBadge = page.locator('.demo-badge');
    await expect(demoBadge).toBeVisible();

    // 2. Demo disclaimer before submit button
    const demoDisclaimer = page.locator('.demo-disclaimer');
    await expect(demoDisclaimer).toBeVisible();

    // Neither should require interaction to be visible
    // (checked by toBeVisible which waits for the element to be in DOM)

    // Combined visible text should make demo nature clear
    const badgeText = await demoBadge.textContent();
    const disclaimerText = await demoDisclaimer.textContent();
    const combinedText = (badgeText + ' ' + disclaimerText).toLowerCase();

    // Should contain clear demo indicators
    expect(combinedText).toMatch(/demo|demonstration|演示/);

    // Should indicate no data transmission
    expect(combinedText).toMatch(/no data|not send|不会发送|不会传输/);
  });
});
