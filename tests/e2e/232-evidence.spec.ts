/**
 * @file 232-evidence.spec.ts
 * @description Real-browser EVIDENCE capture for #232 (NOT a regression gate —
 * produces genuine screenshots of the chunk-load-failure affordance for the
 * ticket archive).
 *
 * WHY THIS SPEC EXISTS (iter-37 Stage-6 critique):
 * The first #232 archive shipped two PNGs that a reviewer proved were
 * fabricated (the "before" had a placeholder caption; the "after" omitted the
 * title/message paragraphs the shipped component renders). This spec drives
 * the REAL production failure path against a built preview server and
 * screenshots the genuine AsyncLoadError that Vue's defineAsyncComponent
 * runtime renders.
 *
 * PRODUCTION vs DEV (load-bearing — a full debugging iteration):
 * The failure path MUST be driven against a PRODUCTION build (vite preview),
 * NOT the vite DEV server. In dev mode the dynamic `import('X.vue')` is
 * rewritten by Vite + HMR + a CSS-sibling preload helper; an aborted fetch of
 * the .vue source throws synchronously THROUGH Vue's `.catch()` (the native
 * "Failed to fetch dynamically imported module" page error fires before
 * defineAsyncComponent's onError runs), so the errorComponent never mounts.
 * This is a known Vite dev-mode quirk that does NOT affect production: against
 * a built preview server the loader is a hashed chunk (NeuralTerminal-<hash>.js)
 * whose network rejection IS caught by Vue's `.catch()`, onError fires all 3
 * attempts (1 initial + 2 retries), and after the 3rd fails the errorComponent
 * mounts. Verified empirically: retryDebug=[attempt 1,2,3] + asyncError=1 on
 * the production preview; retryDebug=undefined + asyncError=0 on dev. The
 * ticket targets production failure modes (deploy skew / CDN drop / ad-blocker
 * on a hashed asset) — exactly the path this spec exercises.
 *
 * Captures:
 *   1. after-async-load-error.png — the real rendered AsyncLoadError affordance
 *      (magenta title, message, cyan Reload button) on a failed chunk.
 *
 * Output is written to EVIDENCE_OUT (defaults to ./tickets-232-evidence).
 *
 * Usage:
 *   1. Build + start the preview server:
 *        npm run build && node_modules/.bin/vite preview --port 4173 --strictPort &
 *   2. Run (the spec targets :4173 directly so it does NOT need playwright's
 *      webServer, which would start a second dev server):
 *        EVIDENCE_LABEL=after \
 *          EVIDENCE_OUT=/abs/path/to/tickets/232/evidence \
 *          node_modules/.bin/playwright test 232-evidence --project=chromium
 *
 * @ticket #232
 */
import { test, expect } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const LABEL = process.env.EVIDENCE_LABEL || 'shot'
const OUT = process.env.EVIDENCE_OUT
  ? resolve(process.env.EVIDENCE_OUT)
  : resolve(process.cwd(), 'tickets-232-evidence')
mkdirSync(OUT, { recursive: true })

// Skip by default: this is a manual evidence-capture helper, NOT a regression
// gate. It only runs when invoked explicitly with EVIDENCE_LABEL set.
const ENABLED = !!process.env.EVIDENCE_LABEL

// Production preview server (see header comment for why this is NOT the dev
// server). The preview serves the built dist at the vite base subpath.
const BASE = 'http://localhost:4173/KTechAICyberWeb/'

test.describe('#232 real chunk-failure evidence capture (production preview)', () => {
  test.skip(!ENABLED, 'evidence capture helper — set EVIDENCE_LABEL to run')

  test(`capture ${LABEL} async-load-error affordance on a real production chunk failure`, async ({ page }) => {
    // Seed dark theme + en so the capture is deterministic.
    await page.goto(`${BASE}`)
    await page.evaluate(() => {
      localStorage.setItem(
        'ktech-preferences',
        JSON.stringify({ theme: 'dark', language: 'en' })
      )
    })

    // Intercept the PRODUCTION NeuralTerminal chunk (hashed filename) and
    // abort it so the dynamic import() rejects at the network level — the
    // exact failure mode the ticket targets (CDN drop / deploy skew /
    // ad-blocker on a hashed asset). Vue's defineAsyncComponent catches this,
    // runs onError (≤2 retries, each re-aborted), then mounts errorComponent.
    await page.route(/NeuralTerminal-.*\.js$/, (route) =>
      route.abort('failed'),
    )

    await page.goto(`${BASE}`)
    await page.waitForLoadState('networkidle')
    // NeuralTerminal is below the fold; scroll its LazySection sentinel into
    // view so the IntersectionObserver mounts the async boundary, which then
    // requests the (now aborted) chunk.
    const lazySection = page.locator('[data-test="lazy-neural-terminal"]')
    await lazySection.scrollIntoViewIfNeeded()
    // Allow the chunk fetch (aborted) + Vue's onError retries (≤2, each
    // re-aborted) + the final fail() → errorComponent mount to settle.
    await page.waitForTimeout(2500)
    // The error affordance is announced via role=alert; wait for it.
    const errorLocator = page.locator('[data-test="async-load-error"]')
    await expect(errorLocator).toBeVisible({ timeout: 15000 })

    // PROOF the screenshot is of the REAL shipped component (not a mock):
    // assert the title paragraph + message paragraph + Reload button all
    // rendered with their i18n copy. A mock/placeholder would omit these.
    await expect(errorLocator.locator('.async-load-error__title')).toContainText(
      'This section could not be loaded',
    )
    await expect(
      errorLocator.locator('.async-load-error__message'),
    ).toContainText('A part of the page failed to load')
    await expect(
      errorLocator.locator('[data-test="async-load-error-retry"]'),
    ).toContainText('Reload section')
    // a11y attributes that the shipped template sets (iter-37 reviewer asked
    // for live proof, not just source grep).
    await expect(errorLocator).toHaveAttribute('role', 'alert')
    await expect(errorLocator).toHaveAttribute('aria-live', 'assertive')

    // Screenshot the affordance in isolation so the evidence clearly shows
    // title + message + button (not the whole page).
    await errorLocator.screenshot({
      path: resolve(OUT, `${LABEL}-async-load-error.png`),
    })
  })
})
