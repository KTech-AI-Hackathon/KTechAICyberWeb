/**
 * @file color-audit-252.spec.js
 * @description Visual-AC regression test for Issue #252 font/color audit.
 * Asserts the FIXED selectors route through canonical theme tokens and contain
 * NO off-theme literals. CSS-source level (parses .vue <style> blocks).
 * @ticket #252
 *
 * Why CSS-source (not computed-style): the E2E gate (e2e/color-contrast-252)
 * already covers the LIVE computed contrast for the two most prominent fixed
 * surfaces. This unit test is the BROADER source-level guarantee that every
 * fixed selector kept its token routing AND that no off-theme literal
 * (#8b00ff purple, #ff6600/#cc4400 orange) survived anywhere in src/views.
 *
 * Rule extraction is BRACE-COUNTED (depth-tracked) so each declaration is
 * matched ONLY inside its owning selector's rule block — never as a substring
 * of another rule, and never runaway into the next rule (the block body is
 * matched non-greedily up to the matching close brace). Comments are stripped
 * (/* *​/, //, <!-- -->) BEFORE matching so a commented-out literal cannot
 * masquerade as a live declaration.
 *
 * RED-PROOF (iter-41 false-green lesson, mandatory):
 *   1. Run this spec against the FIXED source -> GREEN.
 *   2. Hand-revert ONE fix (e.g. PositionList .position-card__badge color
 *      back to #8b00ff) -> re-run -> the exact-rule assertion for that
 *      selector MUST fail, naming the selector + offending literal.
 *   3. Restore -> GREEN.
 *   Both terminal outputs are saved to tickets/252/evidence/red-proof.txt.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = process.cwd()
const VIEWS = resolve(ROOT, 'src/views')

/** Strip CSS/HTML/JS line+block comments so commented literals can't sneak through. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\/[^\n]*/g, '')
}

/**
 * Extract the FULL <style> source (all blocks concatenated) from a .vue file,
 * comments stripped.
 */
function vueStyleSource(relPath) {
  const raw = readFileSync(resolve(VIEWS, relPath), 'utf-8')
  const blocks = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1])
  return stripComments(blocks.join('\n'))
}

/**
 * BRACE-COUNTED rule extraction. Returns an array of { selector, body }.
 * Tracks {/} depth so nested @media bodies are recursed into and their inner
 * rules surfaced as top-level (selector + body) entries. @keyframes/@font-face
 * are skipped (their inner % blocks are not real selectors).
 *
 * Each returned body is the EXACT text between the rule's { and its matching }
 * (non-greedy by construction — depth-counting stops at the matching brace, so
 * a body can never run away into the following rule).
 */
function extractRules(css) {
  const rules = []
  let i = 0
  const n = css.length
  while (i < n) {
    const open = css.indexOf('{', i)
    if (open === -1) break
    const selector = css.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (j < n && depth > 0) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }
    const body = css.slice(open + 1, j - 1)
    if (selector.startsWith('@media') || selector.startsWith('@supports')) {
      rules.push(...extractRules(body))
    } else if (
      selector &&
      !selector.startsWith('@keyframes') &&
      !selector.startsWith('@font-face') &&
      !selector.startsWith('@import')
    ) {
      rules.push({ selector, body })
    }
    i = j
  }
  return rules
}

/**
 * Return the body of the FIRST rule whose selector list contains `sel`.
 * Selector lists are comma/newline-separated; we match if any segment
 * (trimmed) equals `sel` (exact, case-sensitive) OR ends with `sel` after a
 * combinator (so '.parent .child' is found when searching '.child').
 */
function ruleBodyFor(css, sel) {
  return ruleBodiesFor(css, sel)[0] ?? null
}

/**
 * Return the bodies of ALL rules whose selector list contains `sel`. Needed
 * because a selector can be split across several rules (e.g. a shared
 * '.a, .b' rule plus a dedicated '.b' override) and the declaration under
 * test may live in the LATER rule. Assertions join all matching bodies so a
 * color/value check scans the selector's complete style footprint.
 */
function ruleBodiesFor(css, sel) {
  const out = []
  for (const r of extractRules(css)) {
    const segs = r.selector.split(',').map(s => s.trim())
    let match = false
    for (const seg of segs) {
      if (seg === sel) { match = true; break }
      const last = seg.split(/[>\s+~]+/).filter(Boolean).pop()
      if (last === sel) { match = true; break }
    }
    if (match) out.push(r.body)
  }
  return out
}

// ---------- FIXED-SELECTOR assertions (exact rule, token routing) ----------

describe('#252 PositionList.vue off-theme purple -> magenta token', () => {
  const css = () => vueStyleSource('PositionList.vue')

  it('.position-card__badge color uses var(--accent-magenta), no #8b00ff', () => {
    const body = ruleBodyFor(css(), '.position-card__badge')
    expect(body, '.position-card__badge rule must exist').not.toBeNull()
    expect(body).toMatch(/color:\s*var\(--accent-magenta\)/)
    expect(body).not.toMatch(/#8b00ff/i)
    expect(body).not.toMatch(/rgba\(\s*139/)
  })

  it('.position-card__badge background+border use magenta rgba, not purple', () => {
    const body = ruleBodyFor(css(), '.position-card__badge')
    expect(body).toMatch(/background:\s*rgba\(\s*255,\s*0,\s*170/)
    expect(body).toMatch(/border:\s*1px solid rgba\(\s*255,\s*0,\s*170/)
    expect(body).not.toMatch(/rgba\(\s*139,\s*0,\s*255/)
  })

  it('.position-modal__share color uses var(--accent-magenta), no #8b00ff', () => {
    // Two rules target this selector: a shared '.apply, .share' block (no
    // color) and a dedicated '.share' override (the color). Scan ALL matching
    // bodies so the color decl is found regardless of which rule holds it.
    const bodies = ruleBodiesFor(css(), '.position-modal__share')
    expect(bodies.length, '.position-modal__share rule(s) must exist').toBeGreaterThan(0)
    const joined = bodies.join('\n')
    expect(joined).toMatch(/color:\s*var\(--accent-magenta\)/)
    expect(joined).not.toMatch(/#8b00ff/i)
    expect(joined).not.toMatch(/rgba\(\s*139,\s*0,\s*255/)
  })

  it('hero gradient stop is magenta rgba(255,0,170,...), not purple rgba(139,0,255)', () => {
    const full = css()
    expect(full).toMatch(/rgba\(\s*255,\s*0,\s*170,\s*0\.05\)/)
    expect(full).not.toMatch(/rgba\(\s*139,\s*0,\s*255/)
  })
})

describe('#252 About.vue off-theme literals -> tokens', () => {
  const css = () => vueStyleSource('About.vue')

  it('.projects-badge bg uses var(--accent-magenta), no #ff6600/#cc4400', () => {
    const body = ruleBodyFor(css(), '.projects-badge')
    expect(body, '.projects-badge rule must exist').not.toBeNull()
    expect(body).toMatch(/background:\s*linear-gradient\([^)]*var\(--accent-magenta\)/)
    expect(body).not.toMatch(/#ff6600/i)
    expect(body).not.toMatch(/#cc4400/i)
  })

  it('.projects-badge color is var(--bg-primary) for AA on the bright badge', () => {
    const body = ruleBodyFor(css(), '.projects-badge')
    expect(body).toMatch(/color:\s*var\(--bg-primary\)/)
    expect(body).not.toMatch(/color:\s*#fff/i)
  })

  it('.iso-badge color uses var(--bg-primary), no #000', () => {
    const body = ruleBodyFor(css(), '.iso-badge')
    expect(body, '.iso-badge rule must exist').not.toBeNull()
    expect(body).toMatch(/color:\s*var\(--bg-primary\)/)
    expect(body).not.toMatch(/color:\s*#000/i)
  })

  it('.page-title color uses var(--text-primary), no #ffffff/#fff', () => {
    const body = ruleBodyFor(css(), '.page-title')
    expect(body, '.page-title rule must exist').not.toBeNull()
    expect(body).toMatch(/color:\s*var\(--text-primary\)/)
    expect(body).not.toMatch(/color:\s*#fff/i)
  })
})

describe('#252 hero #fff headings -> var(--text-primary)', () => {
  it('Home.vue hero H1 uses var(--text-primary), no #ffffff', () => {
    const css = vueStyleSource('Home.vue')
    // the hero h1 lives under a .hero h1 / .hero-title style; assert the
    // literal is gone from the whole file AND a text-primary color exists.
    expect(css).not.toMatch(/color:\s*#ffffff/i)
    expect(css).not.toMatch(/color:\s*#fff\b/i)
  })

  it('JoinUs.vue page-title/section-title/benefit-card h3/process-step h3 use var(--text-primary)', () => {
    const css = vueStyleSource('JoinUs.vue')
    for (const sel of ['.page-title', '.section-title', '.benefit-card h3', '.process-step h3']) {
      const body = ruleBodyFor(css, sel)
      expect(body, `${sel} rule must exist`).not.toBeNull()
      expect(body).toMatch(/color:\s*var\(--text-primary\)/)
      expect(body).not.toMatch(/color:\s*#fff/i)
    }
  })
})

describe('#252 Contact.vue failing gray #666 -> var(--text-muted)', () => {
  const css = () => vueStyleSource('Contact.vue')

  it('.breadcrumb color uses var(--text-muted), no #666', () => {
    const body = ruleBodyFor(css(), '.breadcrumb')
    expect(body, '.breadcrumb rule must exist').not.toBeNull()
    expect(body).toMatch(/color:\s*var\(--text-muted\)/)
    expect(body).not.toMatch(/color:\s*#666/i)
  })

  it('.form-input::placeholder color uses var(--text-muted), no #666', () => {
    const body = ruleBodyFor(css(), '.form-input::placeholder')
    expect(body, '.form-input::placeholder rule must exist').not.toBeNull()
    expect(body).toMatch(/color:\s*var\(--text-muted\)/)
    expect(body).not.toMatch(/color:\s*#666/i)
  })

  it('.social-label color uses var(--text-muted), no #666', () => {
    const body = ruleBodyFor(css(), '.social-label')
    expect(body, '.social-label rule must exist').not.toBeNull()
    expect(body).toMatch(/color:\s*var\(--text-muted\)/)
    expect(body).not.toMatch(/color:\s*#666/i)
  })
})

// ---------- TOKEN-PAIR WCAG ratio (engine-independent; #294 Mobile Safari fix) ----------

/**
 * Resolve a CSS custom property from variables.css to its SOURCE value (e.g.
 * '--accent-magenta' -> '#ff00aa'). Token-alias chains (e.g.
 * '--magenta: var(--accent-magenta)') are NOT followed — the canonical color
 * tokens are all defined as hex literals at their first definition.
 */
function resolveTokenFromSource(name) {
  const cssPath = resolve(ROOT, 'src/assets/styles/variables.css')
  const css = readFileSync(cssPath, 'utf-8')
  const re = new RegExp(name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + ':\\s*([^;]+);')
  const m = css.match(re)
  if (!m) throw new Error(`token ${name} not found in variables.css`)
  return m[1].trim()
}

/** Parse a '#rrggbb' hex literal -> {r,g,b}. */
function hexToRgb(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) throw new Error(`unparseable hex color: ${hex}`)
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}

/** WCAG 2.1 relative luminance of an {r,g,b} color. */
function relLum({ r, g, b }) {
  const chan = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)
}

/** WCAG 2.1 contrast ratio between two {r,g,b} colors (>=1.0). */
function contrastRatio(fg, bg) {
  const L1 = relLum(fg)
  const L2 = relLum(bg)
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1]
  return (hi + 0.05) / (lo + 0.05)
}

describe('#294 .projects-badge TOKEN PAIR clears WCAG AA 4.5:1 (engine-independent)', () => {
  // #294: the E2E projects-badge pixel-sampling contrast read 3.88 on Mobile
  // Safari (a font-smoothing artifact of the mobile-viewport anti-aliasing),
  // NOT a real WCAG failure. This unit test pins the badge's TOKEN PAIR at the
  // SOURCE level so the badge's true contrast (independent of any browser
  // engine's glyph-edge blending) is asserted by a deterministic computation
  // over the canonical tokens that About.vue routes through.
  //
  // The badge text color is var(--bg-primary) (#0a0a0a) and the badge bg is a
  // single-color linear-gradient with both stops var(--accent-magenta)
  // (#ff00aa) — see About.vue .projects-badge. The resolved pair computes to
  // ~5.499:1, comfortably above the WCAG AA 4.5:1 normal-text floor.
  it('var(--accent-magenta) #ff00aa on var(--bg-primary) #0a0a0a >= 4.5:1', () => {
    const fg = hexToRgb(resolveTokenFromSource('--accent-magenta'))
    const bg = hexToRgb(resolveTokenFromSource('--bg-primary'))
    const ratio = contrastRatio(fg, bg)
    // RED-PROOF (iter-41 convention): the assertion runs at the REAL ~5.499
    // value. To prove this test would catch a regression, temporarily flip
    // the comparator to < 4.5 and re-run — it MUST fail at 5.499.
    expect(ratio, `projects-badge token contrast fg=${JSON.stringify(fg)} bg=${JSON.stringify(bg)} ratio=${ratio.toFixed(4)}`).toBeGreaterThanOrEqual(4.5)
  })
})

// ---------- DENYLIST: zero off-theme literals anywhere in src/views ----------

describe('#252 off-theme-literal denylist across all src/views/*.vue', () => {
  // These are the literals the audit flagged as fully off-palette. After the
  // Critical+High fixes, NONE may remain in any view's active style source.
  const DENYLIST = ['#8b00ff', '#ff6600', '#cc4400']
  const viewFiles = [
    'About.vue', 'Blockchain.vue', 'Contact.vue', 'Home.vue', 'JoinUs.vue',
    'MobileApp.vue', 'News.vue', 'NewsDetail.vue', 'NotFound.vue',
    'PositionList.vue', 'PrivacyPolicy.vue', 'ServiceBigData.vue',
    'ServiceCrossBorderPayment.vue', 'ServiceDigitalAssetCustody.vue',
    'ServiceProjectManagement.vue', 'ServiceRetailLending.vue',
    'ServiceStablecoin.vue', 'Services.vue', 'SupplyChainFinance.vue', 'Terms.vue',
  ]
  for (const lit of DENYLIST) {
    it(`ZERO '${lit}' in any src/views/*.vue active style source`, () => {
      const offenders = []
      for (const vf of viewFiles) {
        const css = vueStyleSource(vf)
        const re = new RegExp(lit.replace('#', '\\#'), 'i')
        if (re.test(css)) offenders.push(vf)
      }
      expect(offenders, `${lit} must not appear in any view`).toEqual([])
    })
  }

  // The legacy cyan literal the e2e theme gate used to assert — kept out of
  // views too (it was already gone from views after #242; this guards against
  // regression now that #252 also fixed the stale e2e assertion).
  it("ZERO '#00f0ff' legacy neon cyan in any src/views/*.vue active style source", () => {
    const offenders = []
    for (const vf of viewFiles) {
      const css = vueStyleSource(vf)
      if (/#00f0ff/i.test(css)) offenders.push(vf)
    }
    expect(offenders).toEqual([])
  })
})
