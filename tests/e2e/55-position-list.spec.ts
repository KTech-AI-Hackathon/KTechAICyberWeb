import { test, expect, type Page } from '@playwright/test';

/**
 * Position List page E2E tests.
 *
 * Route note: the positions page is served at `/careers` (see the route table
 * in src/main.js — `{ path: '/careers', component: PositionList }`). The
 * earlier `/join-us/positions` path no longer exists and 404s to NotFound, so
 * every navigation below uses the live `/careers` route.
 *
 * Base-path note: the app is deployed/served at the Vite `base` subpath
 * /KTechAICyberWeb/ (see vite.config.js + createWebHistory(BASE_URL) in
 * src/main.js). Playwright resolves an absolute-path goto like '/careers'
 * against the origin, NOT the baseURL path, so it must include the subpath
 * explicitly to reach the served route.
 */
const BASE = '/KTechAICyberWeb';
const CAREERS = `${BASE}/careers`;

/**
 * NOTE: the /careers page previously had a render bug (#287) where
 * `currentLanguage.value` was used inside the <template>; refs auto-unwrap in
 * templates so `.value` was undefined, throwing "Cannot read properties of
 * undefined (reading 'length')" and suppressing every `.position-card`. Fixed
 * in #287 (template refs no longer use `.value`), so the card / modal / filter
 * tests below are now live. The structural tests (title, breadcrumb, filter
 * controls, labels, landmarks, responsive shell) were never affected.
 */

/**
 * Navigate to /careers and wait for the position cards to finish loading.
 *
 * PositionList.vue loads positions.json via a dynamic `import()` in onMounted,
 * so the cards reach the DOM a tick AFTER the goto resolves. Tests that assert
 * against `.position-card` (or the modal/grid it drives) must wait for the
 * cards; otherwise they race the async load and see 0 cards.
 */
async function gotoCareersAndWaitForCards(page: Page) {
  await page.goto(CAREERS);
  await page.waitForSelector('.position-card', { state: 'attached', timeout: 10000 });
}

test.describe('Position List Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to positions page', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);
    await expect(page).toHaveURL(/\/careers$/);
    await expect(page.locator('h1')).toContainText(/Open Positions|职位/i);
  });

  test('should display positions page title and subtitle', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    await expect(page.locator('.position-list__title')).toBeVisible();
    await expect(page.locator('.position-list__title-accent')).toBeVisible();
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    const breadcrumb = page.locator('.position-list__breadcrumb');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Home');
    await expect(breadcrumb).toContainText('Join Us');
  });

  test('should display search and filter controls', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

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
    await gotoCareersAndWaitForCards(page);

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
    await gotoCareersAndWaitForCards(page);

    // Select Engineering department
    await page.selectOption('#department-select', 'engineering');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Check that only engineering positions are shown
    const filteredCount = await page.locator('.position-card').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should filter positions by location', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Select Shanghai location
    await page.selectOption('#location-select', 'shanghai');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Check that only Shanghai positions are shown
    const filteredCount = await page.locator('.position-card').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should filter positions by employment type', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Select Full-time type
    await page.selectOption('#type-select', 'fulltime');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Check that only full-time positions are shown
    const filteredCount = await page.locator('.position-card').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should search positions by keyword', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Search for "developer"
    await page.fill('#search-input', 'developer');

    // Wait for search to apply
    await page.waitForTimeout(300);

    // Check that developer positions are shown
    const filteredCount = await page.locator('.position-card').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should clear all filters', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

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
    await gotoCareersAndWaitForCards(page);

    // Apply filter
    await page.selectOption('#department-select', 'engineering');
    await page.waitForTimeout(300);

    // Check that active filter section is visible
    await expect(page.locator('.filter-active')).toBeVisible();
  });

  test('should open position detail modal', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Click on first position's View Details button
    await page.click('.position-card:first-child .position-card__action');

    // Modal should be visible
    await expect(page.locator('.position-modal')).toBeVisible();
    await expect(page.locator('.position-modal__container')).toBeVisible();
  });

  test('should display position detail content', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

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
    await gotoCareersAndWaitForCards(page);

    // Open modal
    await page.click('.position-card:first-child .position-card__action');
    await expect(page.locator('.position-modal')).toBeVisible();

    // Click close button
    await page.click('.position-modal__close');

    // Modal should be closed
    await expect(page.locator('.position-modal')).not.toBeVisible();
  });

  test('should close modal on overlay click', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Open modal
    await page.click('.position-card:first-child .position-card__action');
    await expect(page.locator('.position-modal')).toBeVisible();

    // Click overlay. Click at the overlay's top-left CORNER via position — the
    // overlay's center sits underneath the modal container, so a centered click
    // hits the container (or recurses); the corner is overlay-only.
    await page.click('.position-modal__overlay', { position: { x: 2, y: 2 } });

    // Modal should be closed
    await expect(page.locator('.position-modal')).not.toBeVisible();
  });

  test('should show empty state when no positions match', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Apply impossible filter combination
    await page.selectOption('#department-select', 'marketing');
    await page.selectOption('#type-select', 'internship');
    await page.waitForTimeout(300);

    // Empty state should be visible
    await expect(page.locator('.position-list__empty')).toBeVisible();
    await expect(page.locator('.empty-title')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Focus the search input directly (the breadcrumb links precede it in the
    // Tab sequence, so a single Tab from the body does not land on it). The
    // intent of this test is that keyboard typing in the search filters.
    await page.locator('#search-input').focus();
    await expect(page.locator('#search-input')).toBeFocused();

    // Type in search
    await page.keyboard.type('developer');
    await page.waitForTimeout(300);

    // Should filter results
    const filteredCount = await page.locator('.position-card').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should display position cards with all metadata', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    const firstCard = page.locator('.position-card').first();

    // Check card elements
    await expect(firstCard.locator('.position-card__title')).toBeVisible();
    await expect(firstCard.locator('.position-card__meta-item')).toHaveCount(3);
    await expect(firstCard.locator('.position-card__salary')).toBeVisible();
    await expect(firstCard.locator('.position-card__badge')).toBeVisible();
  });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Check search input
    await expect(page.locator('#search-input')).toHaveAttribute('id');

    // Check view details buttons
    const actionButtons = page.locator('.position-card__action');
    for (const button of await actionButtons.all()) {
      await expect(button).toHaveAttribute('aria-label');
    }
  });

  test('should prevent body scroll when modal is open', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Open modal
    await page.click('.position-card:first-child .position-card__action');

    // Check that body has overflow hidden
    const bodyOverflow = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).overflow
    );
    expect(bodyOverflow).toBe('hidden');

    // Close modal
    await page.click('.position-modal__close');

    // Body scroll should be restored. The component manages the INLINE
    // body.style.overflow (sets 'hidden' on open, '' on close). Assert the
    // inline style, NOT getComputedStyle — a global stylesheet sets overflow-y
    // which makes getComputedStyle().overflow resolve to 'hidden auto' even
    // after the inline 'hidden' is cleared.
    const bodyOverflowAfter = await page.locator('body').evaluate(el =>
      (el as HTMLElement).style.overflow
    );
    expect(bodyOverflowAfter).toBe('');
  });

  test('should display bilingual content', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    const firstCard = page.locator('.position-card').first();
    const title = await firstCard.locator('.position-card__title').textContent();
    
    // Title should have both languages or current language
    expect(title?.length).toBeGreaterThan(0);
  });
});

test.describe('Position List Page Accessibility Tests', () => {
  test('should have proper landmark regions', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Main landmark
    await expect(page.locator('main[role="main"]')).toBeVisible();

    // Navigation landmark
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();

    // Filter section should be labeled
    await expect(page.locator('.position-list__filters')).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // h1 should be present and unique
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);

    // Page title should be h1, filter title should be h2. (Playwright has no
    // toHaveTag matcher in this version — assert the resolved tagName instead.)
    const titleTag = await page.locator('.position-list__title').evaluate(el => el.tagName);
    expect(titleTag).toBe('H1');
    const filterTitleTag = await page.locator('.filter-title').evaluate(el => el.tagName);
    expect(filterTitleTag).toBe('H2');
  });

  test('should have focus visible on filter controls', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Focus search input
    await page.locator('#search-input').focus();
    await expect(page.locator('#search-input')).toBeFocused();

    // Focus department select
    await page.locator('#department-select').focus();
    await expect(page.locator('#department-select')).toBeFocused();
  });

  test('should have proper labels for form controls', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // All form controls should have associated labels
    await expect(page.locator('label[for="search-input"]')).toBeVisible();
    await expect(page.locator('label[for="department-select"]')).toBeVisible();
    await expect(page.locator('label[for="location-select"]')).toBeVisible();
    await expect(page.locator('label[for="type-select"]')).toBeVisible();
  });

  test('should have proper ARIA attributes on modal', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

    // Open modal
    await page.click('.position-card:first-child .position-card__action');

    // Modal should have role="dialog" and aria-modal="true"
    await expect(page.locator('.position-modal[role="dialog"]')).toBeVisible();
    await expect(page.locator('.position-modal[aria-modal="true"]')).toBeVisible();

    // Close button should have aria-label
    await expect(page.locator('.position-modal__close')).toHaveAttribute('aria-label');
  });

  test('should have semantic HTML for position cards', async ({ page }) => {
    await gotoCareersAndWaitForCards(page);

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
    await gotoCareersAndWaitForCards(page);

    // Page should be visible
    await expect(page.locator('.position-list')).toBeVisible();

    // Position cards should be a single column on mobile. The grid uses
    // auto-fill minmax(320px, 1fr); at a 375px viewport only one track fits, so
    // gridTemplateColumns resolves to a single pixel width (e.g. '337.5px'),
    // not the literal '1fr'. Assert the track COUNT is 1 instead.
    const grid = page.locator('.position-list__grid');
    const columnCount = await grid.evaluate(el =>
      window.getComputedStyle(el as HTMLElement).gridTemplateColumns.split(' ').length
    );
    expect(columnCount).toBe(1);
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoCareersAndWaitForCards(page);

    // Page should be visible
    await expect(page.locator('.position-list')).toBeVisible();

    // Filters should still be visible on tablet
    await expect(page.locator('.position-list__filters')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoCareersAndWaitForCards(page);

    // Page should be visible
    await expect(page.locator('.position-list')).toBeVisible();

    // Should have sidebar layout on desktop
    await expect(page.locator('.position-list__main')).toBeVisible();
    await expect(page.locator('.position-list__filters')).toBeVisible();
    await expect(page.locator('.position-list__content')).toBeVisible();
  });

  test('should have modal responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoCareersAndWaitForCards(page);

    // Open modal
    await page.click('.position-card:first-child .position-card__action');

    // Modal should be visible and responsive
    await expect(page.locator('.position-modal')).toBeVisible();
    
    const modalContent = page.locator('.position-modal__content');
    await expect(modalContent).toBeVisible();
  });
});
