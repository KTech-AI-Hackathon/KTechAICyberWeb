/**
 * @file NeuralTerminal.visual-ac.test.ts
 * @description Visual-AC photosafety gate for NeuralTerminal.vue (#234).
 * @ticket #234
 *
 * Issue #234 tones down residual infinite-strobe animations on the
 * Home-mounted NeuralTerminal so it is seizure-safe (<3Hz, no hard strobe).
 * DOM tests cannot SEE the `animation:` shorthand — an `infinite` revert
 * passes every behavioral test (the `.decode-anim` class is still applied;
 * only its CSS-driven motion changes). This gate reads the
 * NeuralTerminal.vue SOURCE, strips comments (so a commented-out rule cannot
 * masquerade as active — iter-15 lesson from SolutionForge), and asserts each
 * photosafety contract at the CSS-source level.
 *
 * Pattern mirrors src/components/__tests__/SolutionForge.visual-ac.test.ts
 * (the canonical visual-AC CSS-source gate established on #180/#179): read the
 * .vue source, stripComments, assert on the active CSS.
 *
 * RED-TEST PROOFs are stated per-assertion in the comments below — each
 * documents the exact reversion that makes that assertion fail. We do NOT
 * commit the reverted state.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const componentPath = path.resolve(__dirname, '../NeuralTerminal.vue')

/**
 * Strip <!-- -->, /* *​/, and // comments so they cannot masquerade as active
 * CSS. Matches the SolutionForge / NeuralCore stripComments helper exactly.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\/[^\n]*/g, '')
}

/**
 * Extract the `{ ... }` body of every CSS rule whose selector list, when split
 * on commas into individual selectors, contains an EXACT match for the anchor.
 * "Exact" means the anchor is the whole selector (after trimming descendant
 * combinators) — so passing `.terminal-cursor.blink` matches the standalone
 * `.terminal-cursor.blink { ... }` rule but NOT the descendant
 * `.neural-console.reduced-motion .terminal-cursor.blink { ... }` guard (whose
 * full selector is the longer chain). This prevents a legitimate `animation:
 * none` guard from masking a `steps(2)` in the target rule.
 */
function extractRuleBody(source: string, selectorAnchor: string): string {
  const escaped = selectorAnchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // A rule starts where a selector list begins and ends at `{`. We capture the
  // selector list (everything from the previous `}` or start-of-string up to
  // `{`) and then the body up to the next `}`. The selector list is then split
  // on commas and each selector trimmed of leading descendant combinators so
  // `.foo .bar` is treated as the compound `.bar` for matching purposes — but
  // we REQUIRE the anchor to be the full final compound (anchored at both
  // ends), so `.reduced-motion .terminal-cursor.blink` (final compound =
  // `.terminal-cursor.blink` BUT preceded by a descendant) is distinguished
  // from the standalone `.terminal-cursor.blink` by also checking that the
  // selector has no leading combinator.
  const ruleRe = /([^{}]*?)\{([^{}]*)\}/g
  const bodies: string[] = []
  let m: RegExpExecArray | null
  while ((m = ruleRe.exec(source)) !== null) {
    const selectorList = m[1]
    const body = m[2]
    const selectors = selectorList.split(',').map(s => s.trim())
    const hit = selectors.some(sel => {
      // Strip a leading descendant combinator chain so `.a .b` reduces to the
      // final compound `.b` — but remember whether a combinator was present.
      const lastCompound = sel.split(/\s+/).pop() ?? sel
      const hasCombinator = /\s/.test(sel)
      // Match: the anchor is the ENTIRE final compound (anchored ends), AND no
      // descendant combinator precedes it (standalone rule, not a nested
      // guard). This is what lets us target the editable rule specifically.
      const fullSel = new RegExp(`^${escaped}$`)
      return !hasCombinator && fullSel.test(lastCompound)
    })
    if (hit) bodies.push(body)
  }
  return bodies.join('\n')
}

/**
 * Extract the FULL body of a `@media (...) { ... }` block by counting braces
 * (a lazy regex stops at the first inner `}`, missing nested rules). Returns
 * the empty string if no such media block exists.
 *
 * `mediaFeature` is a RAW regex fragment (e.g. `prefers-reduced-motion\s*:\s*reduce`)
 * — it is interpolated directly so callers can express whitespace tolerance.
 */
function extractMediaBlock(source: string, mediaFeature: string): string {
  const startRe = new RegExp(`@media\\s*\\(\\s*${mediaFeature}\\s*\\)\\s*\\{`)
  const startM = source.match(startRe)
  if (!startM) return ''
  const from = startM.index! + startM[0].length
  let depth = 1
  let i = from
  for (; i < source.length && depth > 0; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') depth--
  }
  return source.slice(from, i - 1)
}

/**
 * Parse every `animation:` shorthand in the source and return the list of
 * raw declaration values (the text between `animation:` and the `;`). Used by
 * the <3Hz proof to enumerate every animated element and compute its rate.
 */
function extractAnimationDeclarations(source: string): string[] {
  const re = /animation\s*:\s*([^;]+)/g
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    out.push(m[1].trim())
  }
  return out
}

describe('NeuralTerminal.vue — visual-AC glitch/strobe gate (#234)', () => {
  let source: string

  beforeAll(() => {
    const raw = fs.readFileSync(componentPath, 'utf-8')
    source = stripComments(raw)
    expect(source, 'NeuralTerminal.vue source must be readable').toBeTruthy()
    expect(source.length).toBeGreaterThan(1000)
  })

  // --------------------------------------------------------------------------
  // AC1: the reveal glitch must be ONE-SHOT, not an infinite strobe.
  // .decode-anim is applied STATICALLY (template line ~107, `:class="{ 'decode-
  // anim': !prefersReducedMotion }"`), so an `infinite` animation here runs
  // continuously at ~2.86Hz (0.35s) whenever a decoded response is visible — a
  // photosafety hazard. Fix: `forwards` (fires once on reveal, holds final
  // frame). Non-strobe regardless of any flag.
  // RED-TEST PROOF: revert line 743 to `... infinite;` — the second expect()
  // (no `\binfinite\b` in the rule) fails.
  // --------------------------------------------------------------------------
  it('AC1 one-shot reveal glitch: .decode-anim pseudo-elements animate forwards, never infinite', () => {
    const body = extractRuleBody(source, '.decode-anim::before')
    expect(body, '.decode-anim rule body must exist').toBeTruthy()
    // The animation must be a forwards one-shot ...
    expect(body).toMatch(/animation:\s*[^;]*forwards/)
    // ... and must NOT carry `infinite` (the strobe we removed).
    expect(body).not.toMatch(/animation:\s*[^;]*\binfinite\b/)
  })

  // --------------------------------------------------------------------------
  // AC1 (cont.): the @keyframes that the reveal glitch references must still be
  // DECLARED (dead-keyframe detector). `forwards` is meaningless without a
  // keyframes block to hold.
  // RED-TEST PROOF: delete the `@keyframes terminal-glitch { ... }` block and
  // this assertion fails.
  // --------------------------------------------------------------------------
  it('AC1 keyframes: an ACTIVE @keyframes terminal-glitch is declared', () => {
    expect(source).toMatch(/@keyframes\s+terminal-glitch(?=\s*\{)/)
  })

  // --------------------------------------------------------------------------
  // AC1 (cont.): CSS-authoritative reduced-motion guard. The @media
  // (prefers-reduced-motion: reduce) block must neutralize the reveal glitch at
  // the CSS level (belt-and-suspenders alongside the JS prefersReducedMotion
  // flag). Photosafety must not depend on JS alone.
  // RED-TEST PROOF: delete the `.decode-anim::before/::after { animation:
  // none; }` rule inside the @media block (~lines 887-890) and the second
  // expect() fails.
  // --------------------------------------------------------------------------
  it('AC1 reduced-motion guard: @media (prefers-reduced-motion: reduce) kills the decode-anim glitch', () => {
    const block = extractMediaBlock(source, 'prefers-reduced-motion\\s*:\\s*reduce')
    expect(block, 'a prefers-reduced-motion media block must exist').toBeTruthy()
    expect(block).toMatch(/\.decode-anim::(?:before|after)/)
    expect(block).toMatch(/animation:\s*none/)
  })

  // --------------------------------------------------------------------------
  // AC1 (cont.): CSS-authoritative reduced-motion guard for the caret BLINK.
  // #234 review (Stage-6 finding #1): the @media (prefers-reduced-motion:
  // reduce) block was neutralizing the `.decode-anim` glitch but NOT the
  // `.terminal-cursor.blink` caret — the blink relied SOLELY on the JS-flag
  // `.reduced-motion` class (`.neural-console.reduced-motion
  // .terminal-cursor.blink`). That is the same single-point-of-failure #234
  // was filed to eliminate. The @media block must be the authoritative guard
  // so that if the JS flag is ever wrong, the blink still dies under
  // reduced-motion (defense-in-depth). Mirrors the decode-anim guard above.
  // RED-TEST PROOF: remove the `.terminal-cursor.blink { animation: none; }`
  // entry from the @media block and the assertion fails (the block contains no
  // rule whose selector matches `.terminal-cursor.blink`).
  // --------------------------------------------------------------------------
  it('AC1 reduced-motion guard: @media (prefers-reduced-motion: reduce) kills the terminal-cursor blink', () => {
    const block = extractMediaBlock(source, 'prefers-reduced-motion\\s*:\\s*reduce')
    expect(block, 'a prefers-reduced-motion media block must exist').toBeTruthy()
    expect(block).toMatch(/\.terminal-cursor(?:\.blink)?/)
    expect(block).toMatch(/animation:\s*none/)
  })

  // --------------------------------------------------------------------------
  // AC1 (cont.): the terminal cursor blink must be SMOOTH, not a hard
  // steps(2) square wave. steps(2) makes the caret snap on/off at full
  // contrast — visually harsh and closer to a strobe edge than a breath. Fix:
  // ease-in-out continuous transition (still blinking, but softly).
  // RED-TEST PROOF: revert `.terminal-cursor.blink` to `... steps(2) ...` —
  // the first expect() (no `steps(`) fails; reverting to `linear` makes the
  // second expect() (has `ease-in-out`) fail.
  // --------------------------------------------------------------------------
  it('AC1 smooth cursor blink: .terminal-cursor.blink uses ease-in-out, never steps()', () => {
    const body = extractRuleBody(source, '.terminal-cursor.blink')
    expect(body, '.terminal-cursor.blink rule body must exist').toBeTruthy()
    expect(body).not.toMatch(/steps\(/)
    expect(body).toMatch(/ease-in-out/)
  })

  // --------------------------------------------------------------------------
  // AC1 (cont.): <3Hz proof. EVERY `animation:` shorthand in the component
  // that carries `infinite` must have a period yielding a rate strictly under
  // 3Hz (seizure-safe threshold). This is a holistic sweep — it catches a
  // future contributor adding `0.2s linear infinite` (5Hz) anywhere in the
  // file, not just in the two rules above.
  //
  // Found animations after the fix (documented for audit): the only `infinite`
  // animation in NeuralTerminal.vue is `terminal-blink 1.1s ease-in-out
  // infinite` = 1/1.1 ≈ 0.91Hz (well under 3Hz). The reveal glitch is now
  // `forwards` (one-shot, excluded from this sweep). terminal-think 1s and
  // terminal-matrix-pulse 4s are also infinite but are ease-in-out and at
  // 1Hz / 0.25Hz respectively — both pass.
  // RED-TEST PROOF: add `animation: foo 0.2s linear infinite;` anywhere in the
  // source and this assertion fails (5Hz > 3Hz).
  // --------------------------------------------------------------------------
  it('AC1 <3Hz: every infinite animation in the component is seizure-safe (<3Hz)', () => {
    const decls = extractAnimationDeclarations(source)
    expect(decls.length, 'component must declare at least one animation').toBeGreaterThan(0)
    for (const decl of decls) {
      if (!/\binfinite\b/.test(decl)) continue
      // Extract the first duration token (e.g. `1.1s`, `4s`, `350ms`).
      const durMatch = decl.match(/(\d+(?:\.\d+)?)\s*(s|ms)/)
      expect(durMatch, `infinite animation must declare a duration: "${decl}"`).not.toBeNull()
      const value = parseFloat(durMatch![1])
      const unit = durMatch![2]
      const seconds = unit === 'ms' ? value / 1000 : value
      const hz = 1 / seconds
      expect(hz, `infinite animation "${decl}" is ${hz.toFixed(2)}Hz, must be <3Hz`).toBeLessThan(3)
    }
  })
})
