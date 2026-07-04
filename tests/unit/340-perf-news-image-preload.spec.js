/**
 * @file tests/unit/340-perf-news-image-preload.spec.js
 * @description Source gate for Issue #340 Step 3 (preload the /news first-card
 * LCP image, which has Load Delay = 3154ms = 83% of /news LCP).
 *
 * Diagnosis (from #340 Lighthouse audits): even with eager + fetchpriority=high
 * (#334 Fix E), the /news first-card image Load Delay is 3154ms because the
 * SPA must parse ~100KB JS + hydrate before the <img> is in the DOM — the
 * browser cannot discover it from the initial HTML. A
 * `<link rel="preload" as="image">` in <head> lets the parser start the fetch
 * on first paint, before the JS bundle even arrives.
 *
 * This mirrors the existing /about hero preload pattern in index.html (added
 * by #334 Fix D). Like that preload, it MUST use `imagesrcset` + `imagesizes`
 * (not a fixed `href`) because the NewsCard <img> is rendered by CyberImage
 * with a responsive srcset — preloading a fixed href would override the
 * responsive selection.
 *
 * ITER-53 DEFENSE (string-literal drift): the expected srcset/sizes literals
 * are DERIVED from source (src/data/news.json[0].image +
 * NewsCard.vue NATIVE_WIDTH_MAP) by a separate test below, so a future edit
 * to either source that does not update index.html fails the suite visibly.
 *
 * @ticket #340
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')
const INDEX_HTML_PATH = resolve(ROOT, 'index.html')
const NEWS_JSON_PATH = resolve(ROOT, 'src/data/news.json')
const NEWS_CARD_PATH = resolve(ROOT, 'src/components/NewsCard.vue')

/** Read index.html source (the SOURCE file is authorable; the preload is added there). */
function readIndexHtml() {
  return readFileSync(INDEX_HTML_PATH, 'utf-8')
}

/**
 * Programmatically re-derive the expected imagesrcset/imagesizes for the
 * /news first card, mirroring the exact logic in NewsCard.vue:
 *   - firstNewsImage = news.json[0].image
 *   - nativeWidth   = NATIVE_WIDTH_MAP[firstNewsImage] (258 for the iso27001 webp)
 *   - isVector      = firstNewsImage endsWith('.svg')
 *   - srcset        = isVector ? '' : `${firstNewsImage} ${nativeWidth}w`
 *   - sizes         = isVector ? '' : `(max-width: 600px) 100vw, ${nativeWidth}px`
 * This catches drift: if NewsCard.vue's NATIVE_WIDTH_MAP or news.json[0].image
 * changes but index.html's preload is not updated, the literal test below
 * still passes (it asserts against hardcoded values) but the derived test
 * fails — surfacing the mismatch.
 */
function deriveExpectedPreload() {
  const news = JSON.parse(readFileSync(NEWS_JSON_PATH, 'utf-8'))
  const firstNewsImage = news[0].image

  const newsCardSrc = readFileSync(NEWS_CARD_PATH, 'utf-8')
  // Parse NATIVE_WIDTH_MAP entries: '/images/news/news-iso27001-official.webp': 258,
  const mapText = newsCardSrc.match(/NATIVE_WIDTH_MAP\s*=\s*\{([\s\S]*?)\}/)
  if (!mapText) throw new Error('could not find NATIVE_WIDTH_MAP in NewsCard.vue')
  const entries = new Map()
  const entryRegex = /'([^']+)':\s*(\d+)/g
  let m
  while ((m = entryRegex.exec(mapText[1])) !== null) {
    entries.set(m[1], Number(m[2]))
  }
  const nativeWidth = entries.get(firstNewsImage) || 800

  const isVector = firstNewsImage.toLowerCase().endsWith('.svg')
  return {
    firstNewsImage,
    nativeWidth,
    isVector,
    srcset: isVector ? '' : `${firstNewsImage} ${nativeWidth}w`,
    sizes: isVector ? '' : `(max-width: 600px) 100vw, ${nativeWidth}px`,
  }
}

describe('#340 Step 3 — /news first-card image preload in index.html <head>', () => {
  let html
  beforeAll(() => {
    html = readIndexHtml()
  })

  // NOTE (#346 reconciliation): the preload was previously a STATIC
  // <link rel="preload" as="image"> tag. #346 replaced both static preloads
  // (about + news) with a single ROUTE-AWARE inline <script> that injects
  // the <link> ONLY for the matching route, because the unconditional static
  // preloads caused /contact (and every other non-about/non-news route) to
  // download ~95KB of /about + /news images it never renders. The intent of
  // these assertions is unchanged: guard that the /news first-card preload
  // still exists (now gated on /news) with the same srcset/sizes literals,
  // so the iter-53 drift guard against news.json[0].image +
  // NewsCard NATIVE_WIDTH_MAP still catches srcset drift. The assertions now
  // target the route-aware script's literals instead of a static <link> tag.

  it('index.html route-aware script injects a preload <link> for the news LCP image on /news', () => {
    // The route-aware script must (a) gate the news preload on the EXACT /news
    // path (NOT /news/:slug, which renders a different image), and (b) build
    // the <link> via document.createElement with rel=preload + as=image.
    expect(html, 'route-aware script must reference the /news path').toContain("'/news'")
    expect(html, 'route-aware script must create the link via document.createElement').toContain("document.createElement('link')")
    expect(html, 'route-aware script must set rel=preload on the link').toMatch(/\.rel\s*=\s*['"]preload['"]/)
    expect(html, 'route-aware script must set as=image on the link').toMatch(/\.as\s*=\s*['"]image['"]/)
  })

  it('the preload has fetchpriority="high" (marks it as the LCP candidate)', () => {
    // The route-aware script sets link.fetchpriority = 'high'. Assert the
    // literal is present in source.
    expect(html).toMatch(/fetchpriority\s*=\s*['"]high['"]/i)
  })

  it('the preload imagesrcset matches the derived NewsCard.vue srcset (iter-53 drift guard)', () => {
    // DERIVED test: re-derive the expected srcset from news.json[0].image +
    // NewsCard.vue NATIVE_WIDTH_MAP and assert the route-aware script's
    // imagesrcset assignment contains it. If either source changes without
    // updating index.html, this fails.
    const { srcset, isVector } = deriveExpectedPreload()
    expect(isVector, 'the /news first card image is expected to be a raster (webp), not a vector').toBe(false)
    expect(
      html,
      `index.html route-aware preload missing imagesrcset value "${srcset}" (derived from news.json[0].image + NewsCard.vue NATIVE_WIDTH_MAP)`,
    ).toContain(srcset)
  })

  it('the preload imagesizes matches the derived NewsCard.vue sizes (iter-53 drift guard)', () => {
    const { sizes } = deriveExpectedPreload()
    expect(
      html,
      `index.html route-aware preload missing imagesizes value "${sizes}" (derived from NewsCard.vue sizes computed)`,
    ).toContain(sizes)
  })

  it('the preload points at the iso27001 first-card image (literal-contract guard)', () => {
    // LITERAL test: asserts the hardcoded expected first-card image path is
    // present in index.html. This is the contract the planner-specified
    // prompt called out; if the first news item changes to a different image
    // (and the derived test above is updated), this literal test must be
    // updated IN THE SAME PR so the change is explicit.
    expect(html).toContain('/images/news/news-iso27001-official.webp')
  })

  it('the preload imagesrcset declares the 258w descriptor (native width of the iso27001 webp)', () => {
    // LITERAL test for the width descriptor. NATIVE_WIDTH_MAP entry for the
    // iso27001 webp is 258 (a real raster, intrinsic 258x258).
    expect(html).toContain('/images/news/news-iso27001-official.webp 258w')
  })
})
