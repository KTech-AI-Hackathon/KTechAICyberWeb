/**
 * @file NeonPulse.visual-ac.test.ts
 * @description Visual-AC photosafety regression gate for NeonPulse.vue (#234).
 * @ticket #234
 *
 * Issue #234 audits all Home-mounted components for residual glitch/strobe.
 * NeonPulse's `.glitch-text::before/::after` pseudo-layers are STATIC (no
 * `animation:` rule — the tear is purely positional clip-path, never
 * re-animated), so AC2 is ALREADY satisfied. This file is a REGRESSION GATE:
 * it locks that contract so a future contributor cannot reintroduce a strobing
 * glitch pseudo-layer or a sub-3.4Hz pulse-scanline without a test failure.
 *
 * DOM tests cannot SEE the `animation:` shorthand — a commented-out rule or a
 * newly-added `animation: glitch 3s infinite;` would pass every behavioral
 * test. This gate reads NeonPulse.vue SOURCE, strips comments, and asserts at
 * the CSS-source level.
 *
 * Pattern mirrors src/components/__tests__/SolutionForge.visual-ac.test.ts
 * (canonical visual-AC CSS-source gate, #180/#179).
 *
 * RED-TEST PROOFs are stated per-assertion below.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const componentPath = path.resolve(__dirname, '../NeonPulse.vue')

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\/[^\n]*/g, '')
}

/** Concatenated `{ ... }` body of every rule whose selector list, when split
 *  on commas, contains an EXACT standalone match for the anchor (no leading
 *  descendant combinator). This prevents a nested `.neon-pulse
 *  .glitch-text::after` guard rule from masking (or being masked by) the
 *  standalone `.glitch-text::after` rule we are asserting against. */
function extractRuleBody(source: string, selectorAnchor: string): string {
  const escaped = selectorAnchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const ruleRe = /([^{}]*?)\{([^{}]*)\}/g
  const bodies: string[] = []
  let m: RegExpExecArray | null
  while ((m = ruleRe.exec(source)) !== null) {
    const selectorList = m[1]
    const body = m[2]
    const selectors = selectorList.split(',').map(s => s.trim())
    const hit = selectors.some(sel => {
      const lastCompound = sel.split(/\s+/).pop() ?? sel
      const hasCombinator = /\s/.test(sel)
      const fullSel = new RegExp(`^${escaped}$`)
      return !hasCombinator && fullSel.test(lastCompound)
    })
    if (hit) bodies.push(body)
  }
  return bodies.join('\n')
}

/** Full body of a `@media (...) { ... }` block via brace-counting (a lazy
 *  regex stops at the first inner `}`). `mediaFeature` is a RAW regex fragment.
 *  Empty string if absent. */
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

function extractAnimationDeclarations(source: string): string[] {
  const re = /animation\s*:\s*([^;]+)/g
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    out.push(m[1].trim())
  }
  return out
}

describe('NeonPulse.vue — visual-AC glitch pseudo-layer regression gate (#234)', () => {
  let source: string

  beforeAll(() => {
    const raw = fs.readFileSync(componentPath, 'utf-8')
    source = stripComments(raw)
    expect(source, 'NeonPulse.vue source must be readable').toBeTruthy()
    expect(source.length).toBeGreaterThan(1000)
  })

  // --------------------------------------------------------------------------
  // AC2: the glitch-text pseudo-layers must remain STATIC (no animation). A
  // static clip-path tear is photosafe; a re-animated `::before/::after` would
  // strobe the duplicated text layers and re-introduce the hazard #234 removes
  // from NeuralTerminal.
  // RED-TEST PROOF: add `animation: glitch 3s infinite;` to the `.glitch-
  // text::after` block — this assertion fails.
  // --------------------------------------------------------------------------
  it('AC2 static glitch: .glitch-text::before/::after carry no animation rule', () => {
    const before = extractRuleBody(source, '.glitch-text::before')
    const after = extractRuleBody(source, '.glitch-text::after')
    expect(before, '.glitch-text::before rule body must exist').toBeTruthy()
    expect(after, '.glitch-text::after rule body must exist').toBeTruthy()
    expect(before).not.toMatch(/animation\s*:/)
    expect(after).not.toMatch(/animation\s*:/)
  })

  // --------------------------------------------------------------------------
  // AC2 (cont.): the pulse-scanline must stay calm (duration >= 0.34s, i.e.
  // <= ~2.94Hz; actual 8s = 0.125Hz). A faster scanline would slide the
  // repeating-gradient hard edges across the frame at strobe rates.
  // RED-TEST PROOF: change `animation: pulse-scanline 8s ...` to `0.2s` — this
  // assertion fails (0.2 < 0.34).
  // --------------------------------------------------------------------------
  it('AC2 calm scanline: pulse-scanline animation duration is >= 0.34s', () => {
    const body = extractRuleBody(source, '.pulse-scanlines')
    expect(body, '.pulse-scanlines rule body must exist').toBeTruthy()
    const durMatch = body.match(/animation:[^;]*?(\d+(?:\.\d+)?)\s*(s|ms)/)
    expect(durMatch, 'pulse-scanlines must declare an animation duration').not.toBeNull()
    const value = parseFloat(durMatch![1])
    const unit = durMatch![2]
    const seconds = unit === 'ms' ? value / 1000 : value
    expect(seconds, `pulse-scanline duration ${seconds}s must be >= 0.34s`).toBeGreaterThanOrEqual(0.34)
  })

  // --------------------------------------------------------------------------
  // AC2 (cont.): CSS-authoritative reduced-motion guard. The @media
  // (prefers-reduced-motion: reduce) block must neutralize the glitch pseudo-
  // layers at the CSS level. Photosafety must not depend on the JS low-motion
  // flag alone.
  // RED-TEST PROOF: delete the `.neon-pulse .glitch-text::before/::after`
  // entries from the @media block — the second expect() fails.
  // --------------------------------------------------------------------------
  it('AC2 reduced-motion guard: @media (prefers-reduced-motion: reduce) kills the glitch pseudo-layers', () => {
    const block = extractMediaBlock(source, 'prefers-reduced-motion\\s*:\\s*reduce')
    expect(block, 'a prefers-reduced-motion media block must exist').toBeTruthy()
    expect(block).toMatch(/\.glitch-text::(?:before|after)/)
    expect(block).toMatch(/animation:\s*none/)
  })

  // --------------------------------------------------------------------------
  // AC2 (cont.): <3Hz proof. Every `infinite` animation must be seizure-safe.
  // After the fix the only infinite animation in NeonPulse.vue is
  // `pulse-scanline 8s linear infinite` = 0.125Hz. (The beat-flash overlay is
  // rate-gated to <3Hz by the composable, and is not `infinite` in CSS — it is
  // toggled by a class.)
  // RED-TEST PROOF: add `animation: foo 0.2s linear infinite;` anywhere — this
  // assertion fails (5Hz > 3Hz).
  // --------------------------------------------------------------------------
  it('AC2 <3Hz: every infinite animation in the component is seizure-safe (<3Hz)', () => {
    const decls = extractAnimationDeclarations(source)
    expect(decls.length, 'component must declare at least one animation').toBeGreaterThan(0)
    for (const decl of decls) {
      if (!/\binfinite\b/.test(decl)) continue
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
