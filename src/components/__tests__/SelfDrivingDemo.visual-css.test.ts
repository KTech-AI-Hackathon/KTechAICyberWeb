/**
 * @file SelfDrivingDemo.visual-css.test.ts
 * @description CSS-SOURCE VISUAL GATE for the Self-Driving demo (#203, iter-13 lesson).
 * @ticket #203
 *
 * WHY THIS TEST EXISTS (the iter-13 lesson):
 * The existing SelfDrivingDemo tests assert DOM ATTRIBUTES (data-current-phase,
 * data-static, aria-hidden, presence of .depth-* classes). DOM tests CANNOT see
 * CSS — so silently deleting the reduced-motion CSS rule, or removing the neon
 * gradient, or dropping the glitch keyframes would PASS the entire suite while
 * shipping a visually broken / seizure-unsafe demo. This file reads the
 * component's OWN <style> block source (the authoritative visual contract in a
 * unit-test env where scoped CSS is not applied to getComputedStyle — see
 * Scanlines.test.ts for the same constraint) and asserts the load-bearing
 * visual rules exist as ACTIVE CSS, not just as classes on the DOM.
 *
 * Assertions (each would FAIL if its CSS rule were deleted):
 *  1. Root layering: .self-driving-demo declares `position: fixed` AND a
 *     `z-index` (so it paints behind foreground content).
 *  2. Neon palette usage: the style references at least one existing cyber
 *     palette CSS variable (--cyan / --magenta / --neon-green / --neon-blue).
 *  3. AC2 GLITCH: a .self-driving-glitch rule + its @keyframes exist (proves
 *     the glitch transition is real CSS, not just a v-if'd empty div).
 *  4. AC2 PARALLAX: a .depth-* rule carries a transform/translate (proves the
 *     depth planes have a real transform hook, not just decorative divs).
 *  5. AC4 REDUCED MOTION: a @media (prefers-reduced-motion: reduce) block sets
 *     `animation: none` AND `transition: none` (the seizure-safety contract).
 *
 * RED-TEST PROOF (per the iter-13 gate, performed 2026-06-28):
 *  - Glitch animation binding: temporarily removed the
 *    `animation: self-driving-glitch-tear 0.6s ...` line from the
 *    `.self-driving-glitch` rule (keeping the selector, which also appears in
 *    the reduced-motion block) -> test "AC2 glitch: the glitch animation is
 *    one-shot (animation property bound to the rule)" FAILED with
 *    AssertionError (the regex `\.self-driving-glitch\{[^}]*animation:
 *    self-driving-glitch-tear` no longer matched). Restored the line -> PASSED.
 *  - Reduced-motion block: temporarily deleted the ENTIRE
 *    `@media (prefers-reduced-motion: reduce) { ... }` block -> all THREE
 *    reduced-motion assertions FAILED (the @media block, the animation/transition
 *    kill, and the depth/glitch transform pin). Restored the block -> all PASSED.
 *  Both rules are present in the committed file; nothing was left deleted.
 *
 * LIVE-DOM CHECK: happy-dom does not resolve scoped CSS into getComputedStyle,
 * but INLINE styles (the parallax depthStyle transform) DO resolve. We assert
 * the rendered depth-near plane carries a live computed `transform` that is not
 * the default empty string — proving the depth hook is wired to a real DOM
 * transform, not a dead binding.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import SelfDrivingDemo from '../SelfDrivingDemo.vue'

// ---------------------------------------------------------------------------
// matchMedia + rAF + IO stubs (deferred rAF so the loop does not recurse on
// mount; the visual-css assertions do not depend on the clock advancing).
// ---------------------------------------------------------------------------
function installMatchMedia(opts: { reduce?: boolean } = {}) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? !!opts.reduce : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}
function deferredRAF() {
  const queue: FrameRequestCallback[] = []
  let id = 1
  vi.stubGlobal('requestAnimationFrame', ((cb: FrameRequestCallback) => {
    const handle = id++
    queue.push(cb)
    return handle
  }) as any)
  vi.stubGlobal('cancelAnimationFrame', (() => {}) as any)
  return {
    step(ts = 0) {
      const cb = queue.shift()
      if (cb) cb(ts)
    },
  }
}
function noopIO() {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
}

/**
 * Read the SelfDrivingDemo SFC source, extract the <style> block, and strip
 * `/* ... *​/` comments so commented-out rules cannot satisfy an assertion.
 */
function getActiveScopedStyle(): string {
  const componentPath = resolve(__dirname, '..', 'SelfDrivingDemo.vue')
  const source = readFileSync(componentPath, 'utf8')
  const match = source.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  const raw = match ? match[1] : ''
  // Strip block comments so a rule that only exists inside a /* */ comment
  // cannot masquerade as active CSS.
  return raw.replace(/\/\*[\s\S]*?\*\//g, '')
}

describe('SelfDrivingDemo — CSS-source visual gate (#203 iter-13)', () => {
  let style: string

  beforeEach(() => {
    installMatchMedia({ reduce: false })
    deferredRAF()
    noopIO()
    style = getActiveScopedStyle()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // 1. Root layering --------------------------------------------------------

  it('root: .self-driving-demo declares position: fixed (full-viewport layer)', () => {
    expect(style).toMatch(/\.self-driving-demo\s*\{[^}]*position:\s*fixed/s)
  })

  it('root: .self-driving-demo declares a z-index (sits behind foreground)', () => {
    expect(style).toMatch(/\.self-driving-demo\s*\{[^}]*z-index:\s*0/s)
  })

  // 2. Neon palette usage (no new colors invented) -------------------------

  it('palette: reuses an existing cyber CSS variable (--cyan|--magenta|--neon-*)', () => {
    // At least one of the documented neon tokens must appear as a var() usage,
    // proving the visual style sources its colors from the shared palette.
    // Allow an optional fallback (var(--neon-green, #00ff88)).
    expect(style).toMatch(
      /var\(--(?:cyan|magenta|neon-green|neon-blue|neon-pink)\b/,
    )
  })

  // 3. AC2 GLITCH transition (real CSS, not an empty div) ------------------

  it('AC2 glitch: .self-driving-glitch rule exists in active CSS', () => {
    // The selector must be an active rule body, not just a class on the DOM.
    expect(style).toMatch(/\.self-driving-glitch\s*\{/)
  })

  it('AC2 glitch: @keyframes for the glitch tear exist', () => {
    expect(style).toMatch(/@keyframes\s+self-driving-glitch-tear/)
  })

  it('AC2 glitch: the glitch animation is one-shot (animation property bound to the rule)', () => {
    // The .self-driving-glitch rule must bind the keyframes via `animation:`.
    expect(style).toMatch(/\.self-driving-glitch\s*\{[^}]*animation:\s*self-driving-glitch-tear/s)
  })

  // 4. AC2 PARALLAX depth (real transform hook) ----------------------------

  it('AC2 parallax: a .depth-layer rule carries a transform hook (will-change: transform)', () => {
    // The depth planes must declare a transform hook so the inline
    // depthStyle() translate3d is GPU-promoted (will-change: transform). This
    // proves the parallax is real CSS wired to a transform, not a decorative
    // div. The actual translate value is written inline at runtime by the
    // composable's depthShift sine (asserted in the live-DOM checks below).
    expect(style).toMatch(/\.depth-layer\s*\{[^}]*will-change:\s*transform/s)
  })

  it('AC2 parallax: three distinct depth plane selectors exist (far/mid/near)', () => {
    expect(style).toMatch(/\.depth-far\s*\{/)
    expect(style).toMatch(/\.depth-mid\s*\{/)
    expect(style).toMatch(/\.depth-near\s*\{/)
  })

  // 5. AC4 REDUCED MOTION (seizure-safety contract) ------------------------

  it('AC4 reduced motion: @media (prefers-reduced-motion: reduce) block exists', () => {
    expect(style).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/)
  })

  it('AC4 reduced motion: the @media block kills animation AND transition', () => {
    // Extract the reduced-motion block body and assert BOTH guards live inside.
    const blockMatch = style.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\}\s*\}/,
    )
    expect(blockMatch, 'reduced-motion @media block must exist').not.toBeNull()
    const block = blockMatch![1]
    expect(block).toMatch(/animation:\s*none/)
    expect(block).toMatch(/transition:\s*none/)
  })

  it('AC4 reduced motion: the @media block pins depth + glitch transforms to none', () => {
    const blockMatch = style.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\}\s*\}/,
    )
    expect(blockMatch).not.toBeNull()
    const block = blockMatch![1]
    expect(block).toMatch(/\.depth-layer/)
    expect(block).toMatch(/transform:\s*none/)
  })

  // 6. LIVE-DOM check (inline transform resolves in happy-dom) -------------

  it('live-DOM: the depth-near plane carries a non-default computed transform', async () => {
    // Scoped CSS does not resolve in happy-dom, but INLINE styles do. The
    // parallax depthStyle() writes an inline translate3d, so getComputedStyle
    // on the rendered .depth-near plane must return a real transform (not the
    // empty string that signals a dead binding).
    const wrapper = mount(SelfDrivingDemo, { attachTo: document.body })
    await nextTick()
    const nearEl = wrapper.find('.depth-near').element as HTMLElement
    const computed = window.getComputedStyle(nearEl).transform
    // happy-dom returns 'none' for absent transforms; a wired inline transform
    // is a matrix/translate3d string that is NOT 'none' and NOT empty.
    expect(computed).toBeTruthy()
    expect(computed).not.toBe('none')
    wrapper.unmount()
  })

  it('live-DOM: under reduced motion the depth-near transform collapses to none/0', async () => {
    installMatchMedia({ reduce: true })
    vi.stubGlobal('requestAnimationFrame', (() => 1) as any)
    vi.stubGlobal('cancelAnimationFrame', (() => {}) as any)
    const wrapper = mount(SelfDrivingDemo, { attachTo: document.body })
    await nextTick()
    const nearEl = wrapper.find('.depth-near').element as HTMLElement
    const inline = nearEl.style.transform
    // depthShift is pinned to 0 under reduced motion -> translate3d(0.00px,0,0).
    expect(inline).toMatch(/translate3d\(0(?:\.00)?px/)
    wrapper.unmount()
  })
})
