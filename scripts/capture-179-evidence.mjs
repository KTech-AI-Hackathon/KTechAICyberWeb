/**
 * Throwaway evidence-capture script for Issue #179 (AI Core neural visualizer).
 * NOT committed as a tracked test — run manually once to produce the before/after
 * Home screenshots that land in tickets/179/evidence/.
 *
 * Method (documented in IMPLEMENTATION_SUMMARY.md): a single dev server runs the
 * current branch (Home WITH #179). "after" = the full Home page including the new
 * NeuralCore section. "before" = the SAME page with the .neural-core-section
 * hidden via inline display:none, which is an honest "what Home looked like
 * before this feature" capture (the only delta between the two PNGs is the
 * neural section).
 */
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EVIDENCE_DIR = path.resolve(__dirname, '../../tickets/179/evidence')

const BASE = 'http://127.0.0.1:3000/KTechAICyberWeb/'
const VIEWPORT = { width: 1280, height: 900 }

async function run() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  // after: full Home page WITH the NeuralCore section (#179 present).
  await page.goto(BASE, { waitUntil: 'networkidle' })
  // Let the neural SVG + idle breathing settle.
  await page.waitForSelector('[data-test="neural-core"]', { timeout: 10000 })
  await page.waitForTimeout(1200)
  const afterPath = path.join(EVIDENCE_DIR, 'after-home.png')
  await page.screenshot({ path: afterPath, fullPage: true })
  console.log('wrote', afterPath)

  // before: hide ONLY the neural-core section and re-screenshot. This is the
  // same Home page minus the #179 feature — an honest before/after delta.
  await page.locator('.neural-core-section').evaluate((el) => {
    el.style.display = 'none'
  })
  await page.waitForTimeout(400)
  const beforePath = path.join(EVIDENCE_DIR, 'before-home.png')
  await page.screenshot({ path: beforePath, fullPage: true })
  console.log('wrote', beforePath)

  await browser.close()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
