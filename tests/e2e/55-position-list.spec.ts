import { test, expect } from '@playwright/test';

test.describe('Position List Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to positions page', async ({ page }) => {
    await page.goto('/join-us/positions');
    await expect(page).toHaveURL('/join-us/positions');
    await expect(page.locator('h1')).toContainText(/job openings|职位/i);
  });

  test('should display positions page title and subtitle', async ({ page }) => {
    await page.goto('/join-us/positions');

    await expect(page.locator('.position-list__title')).toBeVisible();
    await expect(page.locator('.position-list__title-accent')).toBeVisible();
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    await page.goto('/join-us/positions');

    const breadcrumb = page.locator('.position-list__breadcrumb');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Home');
    await expect(breadcrumb).toContainText('Join Us');
  });

  test('should display search and filter controls', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Search input
    await expect(page.locator('#search-input')).toBeVisible();
    await expect(page.locator('label[for="search-input"]')).toBeVisible();

    // Department filter
    await expect(page.locator('#department-select')).toBeVisible();
    await expect(page.locator('label[for="department-select"]')).toBeVisible();

    // Location filter
    await expect(page.locator('#location-select')).toBeVisible();
    await expect(page.locator('label[for="location-select"]')).toBeVisible();

    // Type filter
    await expect(page.locator('#type-select')).toBeVisible();
    await expect(page.locator('label[for="type-select"]')).toBeVisible();
  });

  test('should display position cards', async ({ page }) => {
    await page.goto('/join-us/positions');

    const positionCards = page.locator('.position-card');
    const count = await positionCards.count();
    
    // Should have 8 positions
    expect(count).toBe(8);

    // Check first card has required elements
    const firstCard = positionCards.first();
    await expect(firstCard.locator('.position-card__title')).toBeVisible();
    await expect(firstCard.locator('.position-card__meta')).toBeVisible();
    await expect(firstCard.locator('.position-card__description')).toBeVisible();
    await expect(firstCard.locator('.position-card__action')).toBeVisible();
  });

  test('should filter positions by department', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Select Engineering department
    await page.selectOption('#department-select', 'engineering');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Check that only engineering positions are shown
    const filteredCount = await page.locator('.position-card').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should filter positions by location', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Select Shanghai location
    await page.selectOption('#location-select', 'shanghai');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Check that only Shanghai positions are shown
    const filteredCount = await page.locator('.position-card').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should filter positions by employment type', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Select Full-time type
    await page.selectOption('#type-select', 'fulltime');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Check that only full-time positions are shown
    const filteredCount = await page.locator('.position-card').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should search positions by keyword', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Search for "developer"
    await page.fill('#search-input', 'developer');

    // Wait for search to apply
    await page.waitForTimeout(300);

    // Check that developer positions are shown
    const filteredCount = await page.locator('.position-card').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should clear all filters', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Apply filters
    await page.selectOption('#department-select', 'engineering');
    await page.selectOption('#location-select', 'shanghai');
    await page.waitForTimeout(300);

    // Click clear all button
    const clearButton = page.locator('.filter-clear');
    await clearButton.click();

    // Wait for clear to apply
    await page.waitForTimeout(300);

    // All positions should be shown again
    const allPositions = await page.locator('.position-card').count();
    expect(allPositions).toBe(8);
  });

  test('should display filter count when filters are active', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Apply filter
    await page.selectOption('#department-select', 'engineering');
    await page.waitForTimeout(300);

    // Check that active filter section is visible
    await expect(page.locator('.filter-active')).toBeVisible();
  });

  test('should open position detail modal', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Click on first position's View Details button
    await page.click('.position-card:first-child .position-card__action');

    // Modal should be visible
    await expect(page.locator('.position-modal')).toBeVisible();
    await expect(page.locator('.position-modal__container')).toBeVisible();
  });

  test('should display position detail content', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Open position detail
    await page.click('.position-card:first-child .position-card__action');

    // Check modal content elements
    await expect(page.locator('.position-modal__title')).toBeVisible();
    await expect(page.locator('.position-modal__meta')).toBeVisible();
    await expect(page.locator('.position-modal__section')).toHaveCount(5);
    await expect(page.locator('.position-modal__apply')).toBeVisible();
    await expect(page.locator('.position-modal__share')).toBeVisible();
  });

  test('should close position detail modal', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Open modal
    await page.click('.position-card:first-child .position-card__action');
    await expect(page.locator('.position-modal')).toBeVisible();

    // Click close button
    await page.click('.position-modal__close');

    // Modal should be closed
    await expect(page.locator('.position-modal')).not.toBeVisible();
  });

  test('should close modal on overlay click', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Open modal
    await page.click('.position-card:first-child .position-card__action');
    await expect(page.locator('.position-modal')).toBeVisible();

    // Click overlay
    await page.click('.position-modal__overlay');

    // Modal should be closed
    await expect(page.locator('.position-modal')).not.toBeVisible();
  });

  test('should show empty state when no positions match', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Apply impossible filter combination
    await page.selectOption('#department-select', 'marketing');
    await page.selectOption('#type-select', 'internship');
    await page.waitForTimeout(300);

    // Empty state should be visible
    await expect(page.locator('.position-list__empty')).toBeVisible();
    await expect(page.locator('.empty-title')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Tab to search input
    await page.keyboard.press('Tab');
    await expect(page.locator('#search-input')).toBeFocused();

    // Type in search
    await page.keyboard.type('developer');
    await page.waitForTimeout(300);

    // Should filter results
    const filteredCount = await page.locator('.position-card').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should display position cards with all metadata', async ({ page }) => {
    await page.goto('/join-us/positions');

    const firstCard = page.locator('.position-card').first();

    // Check card elements
    await expect(firstCard.locator('.position-card__title')).toBeVisible();
    await expect(firstCard.locator('.position-card__meta-item')).toHaveCount(3);
    await expect(firstCard.locator('.position-card__salary')).toBeVisible();
    await expect(firstCard.locator('.position-card__badge')).toBeVisible();
  });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Check search input
    await expect(page.locator('#search-input')).toHaveAttribute('id');

    // Check view details buttons
    const actionButtons = page.locator('.position-card__action');
    for (const button of await actionButtons.all()) {
      await expect(button).toHaveAttribute('aria-label');
    }
  });

  test('should prevent body scroll when modal is open', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Open modal
    await page.click('.position-card:first-child .position-card__action');

    // Check that body has overflow hidden
    const bodyOverflow = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).overflow
    );
    expect(bodyOverflow).toBe('hidden');

    // Close modal
    await page.click('.position-modal__close');

    // Body scroll should be restored
    const bodyOverflowAfter = await page.locator('body').evaluate(el =>
      window.getComputedStyle(el).overflow
    );
    expect(bodyOverflowAfter).toBe('');
  });

  test('should display bilingual content', async ({ page }) => {
    await page.goto('/join-us/positions');

    const firstCard = page.locator('.position-card').first();
    const title = await firstCard.locator('.position-card__title').textContent();
    
    // Title should have both languages or current language
    expect(title?.length).toBeGreaterThan(0);
  });
});

test.describe('Position List Page Accessibility Tests', () => {
  test('should have proper landmark regions', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Main landmark
    await expect(page.locator('main[role="main"]')).toBeVisible();

    // Navigation landmark
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();

    // Filter section should be labeled
    await expect(page.locator('.position-list__filters')).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/join-us/positions');

    // h1 should be present and unique
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);

    // Page title should be h1
    await expect(page.locator('.position-list__title')).toHaveTag('h1');

    // Filter title should be h2
    await expect(page.locator('.filter-title')).toHaveTag('h2');
  });

  test('should have focus visible on filter controls', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Focus search input
    await page.locator('#search-input').focus();
    await expect(page.locator('#search-input')).toBeFocused();

    // Focus department select
    await page.locator('#department-select').focus();
    await expect(page.locator('#department-select')).toBeFocused();
  });

  test('should have proper labels for form controls', async ({ page }) => {
    await page.goto('/join-us/positions');

    // All form controls should have associated labels
    await expect(page.locator('label[for="search-input"]')).toBeVisible();
    await expect(page.locator('label[for="department-select"]')).toBeVisible();
    await expect(page.locator('label[for="location-select"]')).toBeVisible();
    await expect(page.locator('label[for="type-select"]')).toBeVisible();
  });

  test('should have proper ARIA attributes on modal', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Open modal
    await page.click('.position-card:first-child .position-card__action');

    // Modal should have role="dialog" and aria-modal="true"
    await expect(page.locator('.position-modal[role="dialog"]')).toBeVisible();
    await expect(page.locator('.position-modal[aria-modal="true"]')).toBeVisible();

    // Close button should have aria-label
    await expect(page.locator('.position-modal__close')).toHaveAttribute('aria-label');
  });

  test('should have semantic HTML for position cards', async ({ page }) => {
    await page.goto('/join-us/positions');

    // Position cards should have role="listitem"
    const cards = page.locator('.position-card[role="listitem"]');
    await expect(cards).toHaveCount(8);

    // Grid should have role="list"
    await expect(page.locator('.position-list__grid[role="list"]')).toBeVisible();
  });
});

test.describe('Position List Page Responsive Tests', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/join-us/positions');

    // Page should be visible
    await expect(page.locator('.position-list')).toBeVisible();

    // Position cards should be single column on mobile
    const grid = page.locator('.position-list__grid');
    const gridStyle = await grid.evaluate(el => window.getComputedStyle(el).gridTemplateColumns);
    expect(gridStyle).toContain('1fr');
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/join-us/positions');

    // Page should be visible
    await expect(page.locator('.position-list')).toBeVisible();

    // Filters should still be visible on tablet
    await expect(page.locator('.position-list__filters')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/join-us/positions');

    // Page should be visible
    await expect(page.locator('.position-list')).toBeVisible();

    // Should have sidebar layout on desktop
    await expect(page.locator('.position-list__main')).toBeVisible();
    await expect(page.locator('.position-list__filters')).toBeVisible();
    await expect(page.locator('.position-list__content')).toBeVisible();
  });

  test('should have modal responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/join-us/positions');

    // Open modal
    await page.click('.position-card:first-child .position-card__action');

    // Modal should be visible and responsive
    await expect(page.locator('.position-modal')).toBeVisible();
    
    const modalContent = page.locator('.position-modal__content');
    await expect(modalContent).toBeVisible();
  });
});
