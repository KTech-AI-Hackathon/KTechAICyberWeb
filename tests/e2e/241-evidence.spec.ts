/**
 * @file 241-evidence.spec.ts
 * @description Visual-regression EVIDENCE capture for #241 (NOT a regression
 * gate — produces screenshots for the ticket). Captures the Achievements
 * section (`.achievements` on the About page) at three viewports:
 *   1. after-mobile.png   — 375x667  (1-column stack)
 *   2. after-tablet.png   — 768x1024 (auto-fit grid)
 *   3. after-desktop.png  — 1280x720 (full multi-column grid)
 *
 * Root cause being fixed: each .achievement-card carried the .neon-border
 * badge style (width:60px; height:60px; border-radius:50%), collapsing the
 * card to a 60x60 circle. The fix removes .neon-border from the cards and
 * gives .achievement-card a proper rectangular cyber border so it fills its
 * grid cell. These shots are the AFTER set captured from the fix branch.
 *
 * Usage (with a vite dev or preview server running on :3000):
 *   EVIDENCE_LABEL=after EVIDENCE_OUT=/path/to/projects/241/evidence \
 *     node_modules/.bin/playwright test 241-evidence --project=chromium
 *
 * The BEFORE set is captured separately by the coordinator from main.
 * @ticket #241
 */
import { test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const LABEL = process.env.EVIDENCE_LABEL || 'shot'
const OUT = process.env.EVIDENCE_OUT
  ? resolve(process.env.EVIDENCE_OUT)
  : resolve(process.cwd(), 'tickets-241-evidence')
mkdirSync(OUT, { recursive: true })

// Skip by default: this is a manual evidence-capture helper, NOT a regression
// gate. It only runs when invoked explicitly with EVIDENCE_LABEL set.
const ENABLED = !!process.env.EVIDENCE_LABEL

// Per the project memory: KTech baseURL is the origin only; root goto('/')
// 302-redirects to the subpath (works). Use the subpath directly for safety.
const BASE = '/KTechAICyberWeb/'

async function captureAchievements(
  page: import('@playwright/test').Page,
  width: number,
  height: number,
  suffix: string,
) {
  await page.setViewportSize({ width, height })
  // Seed dark theme + en so the capture is deterministic.
  await page.goto(`${BASE}about`)
  await page.evaluate(() => {
    localStorage.setItem(
      'ktech-preferences',
      JSON.stringify({ theme: 'dark', language: 'en' }),
    )
  })
  await page.goto(`${BASE}about`)
  await page.waitForLoadState('networkidle')
  // Let web fonts settle and the achievements section mount.
  await page.waitForTimeout(1500)

  const section = page.locator('.achievements').first()
  await section.scrollIntoViewIfNeeded()
  // Tiny settle so the scroll-triggered layout is stable before the shot.
  await page.waitForTimeout(500)
  const file = resolve(OUT, `${LABEL}-${suffix}.png`)
  await section.screenshot({ path: file })
  console.log(`\n[241-evidence] captured ${file}`)
}

test.describe('#241 visual evidence capture (Achievements section)', () => {
  test.skip(!ENABLED, 'evidence capture helper — set EVIDENCE_LABEL to run')

  test(`capture ${LABEL} achievements mobile 375`, async ({ page }) => {
    await captureAchievements(page, 375, 667, 'mobile')
  })

  test(`capture ${LABEL} achievements tablet 768`, async ({ page }) => {
    await captureAchievements(page, 768, 1024, 'tablet')
  })

  test(`capture ${LABEL} achievements desktop 1280`, async ({ page }) => {
    await captureAchievements(page, 1280, 720, 'desktop')
  })
})
