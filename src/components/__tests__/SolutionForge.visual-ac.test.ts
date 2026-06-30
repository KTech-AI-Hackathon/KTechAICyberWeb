/**
 * @file SolutionForge.visual-ac.test.ts
 * @description Visual-AC CSS-source gate for the AI Solution Forge (#180).
 * @ticket #180
 *
 * AC5 of issue #180 is a VISUAL acceptance criterion: "Neon assembly arcs +
 * scramble-decode compute beat + glitch-on-reveal, theme-consistent." DOM tests
 * cannot SEE CSS — a color/animation revert passes every DOM test. This gate
 * reads the SolutionForge.vue SOURCE, strips comments (so a commented-out rule
 * cannot masquerade as an active one — iter-15 lesson), and asserts each
 * visual-AC keyframe is DECLARED AND APPLIED.
 *
 * Pattern mirrors src/components/__tests__/NeuralCore.spec.js (the canonical
 * visual-AC gate established on #179): read the .vue source, strip comments,
 * assert @keyframes declared + animation: rule referencing it.
 *
 * RED-TEST PROOF: deleting any one of the @keyframes blocks asserted below
 * makes the corresponding "declared" assertion fail (the @keyframes token
 * vanishes), AND deleting the animation: rule that references it makes the
 * "applied" assertion fail — so a bare declaration that is never wired up
 * (dead code) also fails. We do NOT commit the broken state; the proof is
 * stated per-assertion in the comments.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const componentPath = path.resolve(__dirname, '../SolutionForge.vue')

/**
 * Strip <!-- -->, /* *​/, and // comments so they cannot masquerade as active
 * CSS. Matches the NeuralCore stripComments helper exactly.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\/[^\n]*/g, '')
}

/**
 * Extract a single CSS rule body (the text between its outer `{` and the
 * matching `}`), honouring nested braces so a `@media { .x { animation: ... } }`
 * block cannot leak an `infinite`/`forwards` token from a sibling rule into a
 * glitch-text rule's body (iter-43 brace-counter pattern).
 *
 * Returns '' if the selector start is not found.
 */
function extractRuleBody(src: string, startRe: RegExp, open: string, close: string): string {
  const m = src.match(startRe)
  if (!m || m.index === undefined) return ''
  let i = (m.index + m[0].length - 1) // position of the opening `{`
  let depth = 0
  let out = ''
  for (; i < src.length; i++) {
    const ch = src[i]
    if (ch === open) { depth++; if (depth === 1) continue }
    if (ch === close) { depth--; if (depth === 0) break }
    if (depth >= 1) out += ch
  }
  return out
}

describe('SolutionForge.vue — visual-AC CSS-source gate (#180, iter-13/15)', () => {
  let source: string

  beforeAll(() => {
    const raw = fs.readFileSync(componentPath, 'utf-8')
    source = stripComments(raw)
    // Sanity: the source must be readable and non-trivial.
    expect(source, 'SolutionForge.vue source must be readable').toBeTruthy()
    expect(source.length).toBeGreaterThan(1000)
  })

  // --------------------------------------------------------------------------
  // (a) Neon assembly arcs: forge-arc-spin declared AND applied.
  // RED-TEST PROOF: delete the `@keyframes forge-arc-spin { ... }` block and
  // the first expect() below fails; delete the `.forge-arc-1 { animation:
  // forge-arc-spin ... }` rule and the second expect() fails. A keyframe that
  // is declared but never wired to an animation rule (dead code) fails the
  // second assertion.
  // --------------------------------------------------------------------------
  it('AC5 arcs: an ACTIVE @keyframes forge-arc-spin is declared and applied to an arc rule', () => {
    // Identifier-anchored: the name must END here (next char is whitespace or
    // `{`), so `forge-arc-spin-REMOVED` does NOT satisfy the declaration.
    expect(source).toMatch(/@keyframes\s+forge-arc-spin(?=\s*\{)/)
    expect(source).toMatch(/animation[^;]*forge-arc-spin/)
  })

  // --------------------------------------------------------------------------
  // (b) Module assembly fly-in: forge-module-flyin declared AND applied.
  // RED-TEST PROOF: delete the `@keyframes forge-module-flyin { ... }` block
  // and the first expect() fails; delete the `.forge-module { animation:
  // forge-module-flyin ... }` rule and the second expect() fails.
  // --------------------------------------------------------------------------
  it('AC5 assembly: an ACTIVE @keyframes forge-module-flyin is declared and applied to a module rule', () => {
    expect(source).toMatch(/@keyframes\s+forge-module-flyin(?=\s*\{)/)
    expect(source).toMatch(/animation[^;]*forge-module-flyin/)
  })

  // --------------------------------------------------------------------------
  // (c) Glitch-on-reveal: forge-glitch declared AND applied to the
  // glitch-text pseudo-elements (the data-text tear) — AND seizure-safe (#234).
  //
  // #234 SEIZURE-SAFETY GATE: the glitch-text pseudo-elements are mounted on
  // the SolutionForge component, which is lazy-loaded onto the HOME page. The
  // original #180 implementation used `animation: forge-glitch 0.3s infinite`
  // (3.33 Hz — OVER the <3Hz photosensitivity ceiling) and the original #234
  // (PR #269) missed SolutionForge entirely (it only fixed NeuralTerminal).
  // This gate closes that gap.
  //
  // The glitch reveal must be:
  //   1. DECLARED  — @keyframes forge-glitch exists (active, comment-stripped).
  //   2. APPLIED   — an `animation:` rule references forge-glitch on the
  //                  .glitch-text::before/::after pseudo-elements.
  //   3. ONE-SHOT  — applied with `forwards` (fire-once-and-hold), matching the
  //                  #234 NeuralTerminal `terminal-glitch` pattern. The bare
  //                  word `infinite` must NOT appear on the glitch-text
  //                  pseudo-element rules (a continuous strobe).
  //
  // RED-TEST PROOF (iter-13/15/42/43 — brace-counted, comment-stripped):
  //   * delete the `@keyframes forge-glitch { ... }` block  -> assert (1) fails.
  //   * delete the `.glitch-text::before { animation: forge-glitch ... }` rule
  //     -> assert (2) fails.
  //   * revert to `animation: forge-glitch 0.3s infinite` (the pre-#234 state)
  //     -> assert (3)'s `forwards` check fails AND the `infinite`-on-glitch-text
  //     check fails. This is the exact regression this gate exists to catch.
  // --------------------------------------------------------------------------
  it('AC5 glitch reveal: forge-glitch is declared, applied to glitch-text, AND seizure-safe (one-shot forwards, no infinite) (#234)', () => {
    // (1) DECLARED — identifier-anchored (next char is whitespace or `{`).
    expect(source).toMatch(/@keyframes\s+forge-glitch(?=\s*\{)/)

    // (2) APPLIED to the glitch-text pseudo-elements.
    expect(source).toMatch(/\.glitch-text::before[^{]*\{[^}]*animation:[^;]*forge-glitch/s)
    expect(source).toMatch(/\.glitch-text::after[^{]*\{[^}]*animation:[^;]*forge-glitch/s)

    // (3) SEIZURE-SAFE — one-shot forwards, NOT infinite. Brace-counted rule
    //     bodies so a stray `infinite` token in an unrelated rule cannot
    //     satisfy/falsify the check (iter-43 brace-counter pattern). The
    //     selector regex is anchored at a CSS rule boundary (preceded by `}` or
    //     start-of-string) so it matches the STANDALONE `.glitch-text::after`
    //     rule, NOT the earlier shared `.glitch-text::before, .glitch-text::after`
    //     content rule (which carries no animation).
    const beforeRule = extractRuleBody(source, /(?:^|\})\s*\.glitch-text::before\b\s*\{/, '{', '}')
    const afterRule = extractRuleBody(source, /(?:^|\})\s*\.glitch-text::after\b\s*\{/, '{', '}')
    expect(beforeRule, '.glitch-text::before rule body must be extractable').toBeTruthy()
    expect(afterRule, '.glitch-text::after rule body must be extractable').toBeTruthy()

    // forwards = one-shot reveal that holds the final frame (non-strobe).
    expect(beforeRule!).toMatch(/forwards/)
    expect(afterRule!).toMatch(/forwards/)

    // The bare `infinite` keyword must NOT appear in either glitch-text rule.
    expect(beforeRule!, 'glitch-text::before must NOT be an infinite strobe (#234 <3Hz)')
      .not.toMatch(/\binfinite\b/)
    expect(afterRule!, 'glitch-text::after must NOT be an infinite strobe (#234 <3Hz)')
      .not.toMatch(/\binfinite\b/)
  })

  // --------------------------------------------------------------------------
  // (d) Scramble-decode compute beat: the .forge-scramble element carries an
  // ACTIVE styling rule (the verdict stamp that scrambles while computing).
  // The scramble effect itself is JS-driven (scrambleStep mutates the text),
  // but the visual container must have an active CSS rule with neon text-shadow
  // styling for it to read as a "decode beat" rather than plain text.
  // RED-TEST PROOF: delete the `.forge-scramble-text { ... text-shadow ... }`
  // rule and this assertion fails.
  // --------------------------------------------------------------------------
  it('AC5 scramble-decode: the .forge-scramble-text rule has active neon text styling', () => {
    // The scramble verdict stamp element exists in the template ...
    expect(source).toMatch(/\.forge-scramble\b/)
    // ... and its text styling rule carries a neon text-shadow.
    expect(source).toMatch(/\.forge-scramble-text[^{]*\{[^}]*text-shadow/s)
  })

  // --------------------------------------------------------------------------
  // (e) Reduced-motion guard: belt-and-suspenders defense. The stage must not
  // strobe under prefers-reduced-motion (seizure-risk AC). Both a
  // .reduced-motion class guard AND a @media guard set animation: none, so the
  // stage flash / arc spin / module fly-in / glitch tear all die under reduced
  // motion even if the JS skip in forge() were bypassed.
  // RED-TEST PROOF: delete the reduced-motion block(s) and this assertion fails.
  // --------------------------------------------------------------------------
  it('AC3.2 reduced-motion: animation: none is set under a reduced-motion context', () => {
    const hasMediaGuard = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/.test(source)
    const hasClassGuard = /\.reduced-motion/.test(source)
    expect(hasMediaGuard || hasClassGuard).toBe(true)
    expect(source).toMatch(/animation:\s*none/)
  })
})
