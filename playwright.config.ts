import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * This configuration sets up Playwright for cross-browser testing
 * with support for Chromium, Firefox, and WebKit.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only. CI uses 1 retry (not 2): the cross-browser failures
  // exposed by #216 are deterministic rendering/timeouts, not flake — a 2nd
  // retry only doubles CI time without changing the verdict, and would push
  // the matrix past the 15-minute job budget. See #216.
  retries: process.env.CI ? 1 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
    ['list']
  ],

  // Shared settings for all tests
  use: {
    // Base URL for tests. Kept at the dev-server origin: the app is served at
    // the Vite `base` subpath /KTechAICyberWeb/, but Playwright resolves an
    // absolute-path page.goto('/careers') against the ORIGIN (not the baseURL
    // path), and the page-object models (BasePage/HomePage) drive navigation
    // via page.goto('/') + in-app link clicks which work from the origin. Specs
    // that need a direct deep-link to a route (e.g. /careers) include the
    // subpath explicitly via a BASE constant in the spec itself.
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Browser viewport
    viewport: { width: 1280, height: 720 },

    // Test timeout
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for different browsers.
  //
  // webkit + Mobile Safari are skipped in CI by default (#216, AC option b).
  // Why: every webkit-engine test times out (~14s action timeout) navigating
  // the app — a systemic launch/routing issue, not N independent bugs. They
  // were invisible before #216 because the browser binaries were never
  // installed in the runner. Tracked for un-skipping in #222.
  // To run them locally or in a dedicated follow-up workflow: RUN_WEBKIT=true.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    ...(process.env.RUN_WEBKIT === 'true'
      ? [
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
          {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 13'] },
          },
        ]
      : []),

    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
