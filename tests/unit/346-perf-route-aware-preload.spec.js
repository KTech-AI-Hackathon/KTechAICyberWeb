/**
 * @file tests/unit/346-perf-route-aware-preload.spec.js
 * @description Source gate for Issue #346 Commit 4 — ROUTE-AWARE LCP image
 * preload in index.html.
 *
 * Problem (#346 root-cause for /contact + /news residual LCP): index.html had
 * TWO unconditional static `<link rel="preload" as="image">` tags (one for the
 * /about hero, one for the /news first-card image). Every route downloaded
 * BOTH images regardless of whether it rendered them. The Lighthouse network
 * log for /contact proved it fetched `/images/about/about-who-we-are-800w.webp`
 * (90,868B) AND `/images/news/news-iso27001-official.webp` (4,702B) — ~95KB of
 * wasted bandwidth on /contact's critical path for images it never renders.
 * This competed for bandwidth with the actual LCP element's resources and
 * contributed to the ~2870ms element-render-delay floor on /contact.
 *
 * Fix: replace the two static preloads with a single route-aware inline
 * `<script>` (plain, NOT type=module) that inspects `location.pathname` and
 * injects ONLY the relevant preload `<link>` for the current route:
 *   - `/about*`           → preload the about hero (responsive imagesrcset)
 *   - `/news` (exact)     → preload the news first-card image
 *   - all other routes    → no image preload (SPA discovers LCP via hydration)
 *
 * This is a VISIBLE-CORRECTNESS-NEUTRAL change (same image preloads on the
 * same routes; other routes simply stop wasting bandwidth). The existing
 * source-grep tests (#334 about-hero preload, #340 news preload) are kept
 * green because the imagesrcset/imagesizes literals MUST still appear verbatim
 * in the inline script (they guard against srcset-literal drift, which is
 * orthogonal to whether the preload is static or route-aware).
 *
 * @ticket #346
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')
const INDEX_HTML_PATH = resolve(ROOT, 'index.html')

let HTML = ''
beforeAll(() => {
  HTML = readFileSync(INDEX_HTML_PATH, 'utf-8')
})

describe('#346 Commit 4 — route-aware LCP image preload', () => {
  it('index.html NO LONGER has a STATIC <link rel=preload as=image> for about-who-we-are (it is now route-gated in a <script>)', () => {
    // A static preload tag for the about hero would be downloaded by EVERY
    // route (the /contact regression root cause). After #346 it must NOT
    // appear as a static <link> tag — it is built dynamically inside a
    // <script> only when location.pathname matches /about.
    const staticAboutPreload =
      /<link\s+[^>]*rel=["']preload["'][^>]*as=["']image["'][^>]*about-who-we-are[^>]*>/i
    expect(
      staticAboutPreload.test(HTML),
      'a static <link rel=preload as=image ...about-who-we-are...> must NOT appear in index.html (it is now route-aware). ' +
        'Found static tag — would be downloaded unconditionally by /contact.',
    ).toBe(false)
  })

  it('index.html NO LONGER has a STATIC <link rel=preload as=image> for news-iso27001 (it is now route-gated in a <script>)', () => {
    const staticNewsPreload =
      /<link\s+[^>]*rel=["']preload["'][^>]*as=["']image["'][^>]*news-iso27001[^>]*>/i
    expect(
      staticNewsPreload.test(HTML),
      'a static <link rel=preload as=image ...news-iso27001...> must NOT appear in index.html (it is now route-aware).',
    ).toBe(false)
  })

  it('index.html contains a route-aware inline <script> that inspects location.pathname', () => {
    // The inline script MUST be a PLAIN script (no type=module) so it runs
    // synchronously during HTML parsing, BEFORE the application module script.
    expect(
      HTML,
      'route-aware preload script must reference location.pathname',
    ).toContain('location.pathname')
  })

  it('the route-aware script contains the about-who-we-are imagesrcset literal verbatim', () => {
    // The literal must be IDENTICAL to the previous static preload value so
    // the #334 srcset-literal drift guard still passes.
    expect(HTML).toContain(
      '/images/about/about-who-we-are-400w.webp 400w, /images/about/about-who-we-are-800w.webp 800w, /images/about/about-who-we-are.webp 1200w',
    )
    expect(HTML).toContain('(max-width: 600px) 100vw, 50vw')
  })

  it('the route-aware script contains the news-iso27001 imagesrcset literal verbatim', () => {
    // The literal must be IDENTICAL to the previous static preload value so
    // the #340 srcset-literal drift guard still passes.
    expect(HTML).toContain('/images/news/news-iso27001-official.webp 258w')
    expect(HTML).toContain('(max-width: 600px) 100vw, 258px')
  })

  it('the route-aware script creates the <link> via document.createElement', () => {
    // Using createElement (not document.write of a string) means the preload
    // is a real DOM node with proper IDL attributes (imagesrcset/imagesizes
    // are HTMLLinkElement properties), and the static source no longer holds
    // a literal <link ...> tag for the route-gated preloads.
    expect(HTML).toContain("document.createElement('link')")
  })

  it('the route-aware script matches /about via a path prefix and /news via exact equality', () => {
    // /about is a prefix match (covers /about, /about/, /about/anything — the
    // hero is rendered on all /about* routes). /news is EXACT (the detail
    // route /news/:slug renders a different image and must NOT preload the
    // list's first card).
    // Strip the GitHub Pages subpath base so the script works in both the
    // audit build (base=/) and the deployed build (base=/KTechAICyberWeb/).
    expect(HTML).toMatch(/\/about/)
    expect(HTML).toMatch(/\/KTechAICyberWeb/)
  })

  it('the route-aware inline <script> appears BEFORE the application module script', () => {
    // The inline script MUST run before the parser reaches the application
    // module script so the preload <link> is in the DOM before the browser
    // starts the module fetch.
    const scriptIdx = HTML.search(/<script>\s*[\s\S]*?location\.pathname/)
    const moduleIdx = HTML.indexOf('<script type="module" src="/src/main.js">')
    expect(scriptIdx, 'route-aware inline <script> with location.pathname must exist').toBeGreaterThan(-1)
    expect(moduleIdx, 'application module script must exist').toBeGreaterThan(-1)
    expect(
      scriptIdx,
      'route-aware <script> must appear BEFORE the application module script. ' +
        `scriptIdx=${scriptIdx} moduleIdx=${moduleIdx}`,
    ).toBeLessThan(moduleIdx)
  })
})
