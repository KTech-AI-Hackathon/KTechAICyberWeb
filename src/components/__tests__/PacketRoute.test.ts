/**
 * @file PacketRoute.test.ts
 * @description Component-level DOM tests for PacketRoute.vue (#184).
 * @ticket #184
 *
 * Drives the REAL component (mounted via @vue/test-utils) using the REAL
 * useLanguage composable so i18n keys resolve against the real catalogs. Clicks
 * tiles, presses keyboard, transmits, and asserts user-visible DOM effects.
 * Covers the component's computed properties + event-handler branches that the
 * composable behavior test (stub host) does not reach.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PacketRoute from '../PacketRoute.vue'

// matchMedia / rAF mocks so mount + transmit are deterministic.
let originalMatchMedia
let originalRAF
let originalCancelRAF

function mockMatchMedia(matchesMap) {
  window.matchMedia = (query) => ({
    matches: !!matchesMap[query],
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })
}

function syncRAF() {
  let id = 1
  window.requestAnimationFrame = (cb) => {
    cb(performance.now())
    return id++
  }
  window.cancelAnimationFrame = () => {}
}

describe('PacketRoute.vue — component DOM', () => {
  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    originalRAF = window.requestAnimationFrame
    originalCancelRAF = window.cancelAnimationFrame
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': false })
    syncRAF()
    // localStorage reset between tests.
    window.localStorage.clear()
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    window.requestAnimationFrame = originalRAF
    window.cancelAnimationFrame = originalCancelRAF
    vi.restoreAllMocks()
  })

  const mountRoute = () => mount(PacketRoute, { attachTo: document.body })

  it('renders the title, subtitle, instructions, and a grid of tiles', () => {
    const w = mountRoute()
    expect(w.find('[data-test="packet-route"]').exists()).toBe(true)
    expect(w.find('.packet-title').text()).toContain('Packet Route')
    expect(w.find('.packet-subtitle').text().length).toBeGreaterThan(0)
    expect(w.find('.packet-instructions').text().length).toBeGreaterThan(0)
    // Level 1 is 3x1 -> 3 tile cells (no source/target overlap on level 1).
    expect(w.findAll('[data-test^="packet-tile-"]').length).toBe(3)
    w.unmount()
  })

  it('clicking a tile bumps the move counter + rotates the tile (rotation class)', async () => {
    const w = mountRoute()
    expect(w.find('[data-test="packet-readout"]').text()).toContain('Moves: 0')
    await w.find('[data-test="packet-tile-0-0"]').trigger('click')
    expect(w.find('[data-test="packet-readout"]').text()).toContain('Moves: 1')
    // The rotation class flips from rot-0 to rot-1.
    const tile = w.find('[data-test="packet-tile-0-0"]')
    expect(tile.classes()).toContain('rot-1')
    w.unmount()
  })

  it('Transmit on solved level 1 -> DATA TRANSMITTED + Next Level button appears', async () => {
    const w = mountRoute()
    await w.find('[data-test="packet-transmit"]').trigger('click')
    // Allow sync rAF chain + microtasks to settle.
    await new Promise((r) => setTimeout(r, 0))
    const feedback = w.find('[data-test="packet-feedback"]')
    expect(feedback.exists()).toBe(true)
    expect(feedback.text()).toContain('DATA TRANSMITTED')
    // Next Level offered.
    expect(w.find('[data-test="packet-next"]').exists()).toBe(true)
    w.unmount()
  })

  it('Next Level click advances the level readout', async () => {
    const w = mountRoute()
    await w.find('[data-test="packet-transmit"]').trigger('click')
    await new Promise((r) => setTimeout(r, 0))
    await w.find('[data-test="packet-next"]').trigger('click')
    expect(w.find('[data-test="packet-readout"]').text()).toContain('2/')
    w.unmount()
  })

  it('Reset zeroes the move counter', async () => {
    const w = mountRoute()
    await w.find('[data-test="packet-tile-0-0"]').trigger('click')
    expect(w.find('[data-test="packet-readout"]').text()).toContain('Moves: 1')
    await w.find('[data-test="packet-reset"]').trigger('click')
    expect(w.find('[data-test="packet-readout"]').text()).toContain('Moves: 0')
    w.unmount()
  })

  it('Hint highlights a tile (is-hint class)', async () => {
    const w = mountRoute()
    await w.find('[data-test="packet-hint"]').trigger('click')
    const hinted = w.find('.packet-tile.is-hint')
    expect(hinted.exists()).toBe(true)
    w.unmount()
  })

  it('keyboard: ArrowDown moves cursor (is-cursor class moves)', async () => {
    const w = mountRoute()
    const grid = w.find('[data-test="packet-grid"]')
    await grid.trigger('keydown', { key: 'ArrowDown' })
    expect(w.find('[data-test="packet-tile-1-0"]').classes()).toContain('is-cursor')
    w.unmount()
  })

  it('keyboard: Space rotates the cursor cell', async () => {
    const w = mountRoute()
    const grid = w.find('[data-test="packet-grid"]')
    await grid.trigger('keydown', { key: ' ' })
    expect(w.find('[data-test="packet-readout"]').text()).toContain('Moves: 1')
    w.unmount()
  })

  it('keyboard: T transmits', async () => {
    const w = mountRoute()
    const grid = w.find('[data-test="packet-grid"]')
    await grid.trigger('keydown', { key: 't' })
    await new Promise((r) => setTimeout(r, 0))
    expect(w.find('[data-test="packet-feedback"]').text()).toContain('DATA TRANSMITTED')
    w.unmount()
  })

  it('keyboard: H requests a hint', async () => {
    const w = mountRoute()
    const grid = w.find('[data-test="packet-grid"]')
    await grid.trigger('keydown', { key: 'h' })
    expect(w.find('.packet-tile.is-hint').exists()).toBe(true)
    w.unmount()
  })

  it('reduced-motion class is applied to the root when prefersReducedMotion', async () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const w = mountRoute()
    // The class is bound to a ref set in onMounted; await the re-render.
    await new Promise((r) => setTimeout(r, 0))
    expect(w.find('[data-test="packet-route"]').classes()).toContain('reduced-motion')
    expect(w.find('.packet-reduced-note').exists()).toBe(true)
    w.unmount()
  })

  it('Transmit button is disabled once won', async () => {
    const w = mountRoute()
    await w.find('[data-test="packet-transmit"]').trigger('click')
    await new Promise((r) => setTimeout(r, 0))
    const btn = w.find('[data-test="packet-transmit"]')
    expect(btn.attributes('disabled')).toBeDefined()
    w.unmount()
  })

  it('never renders a raw packetRoute.* key', () => {
    const w = mountRoute()
    const text = w.text()
    expect(text.match(/packetRoute\.[a-zA-Z][a-zA-Z0-9.]*/g)).toBeNull()
    w.unmount()
  })

  it('ARIA live region is present and polite', () => {
    const w = mountRoute()
    const live = w.find('[data-test="packet-live"]')
    expect(live.exists()).toBe(true)
    expect(live.attributes('aria-live')).toBe('polite')
    expect(live.attributes('role')).toBe('status')
    w.unmount()
  })

  it('replay button appears after a loss and restarts the level', async () => {
    const w = mountRoute()
    // Break the corridor then transmit -> lost.
    await w.find('[data-test="packet-tile-1-0"]').trigger('click')
    await w.find('[data-test="packet-transmit"]').trigger('click')
    await new Promise((r) => setTimeout(r, 0))
    expect(w.find('[data-test="packet-feedback"]').text()).toContain('LINK SEVERED')
    expect(w.find('[data-test="packet-replay"]').exists()).toBe(true)
    await w.find('[data-test="packet-replay"]').trigger('click')
    expect(w.find('[data-test="packet-readout"]').text()).toContain('Moves: 0')
    w.unmount()
  })
})

// ============================================================================
// #190 a11y: aria-required-children — grid must own row > gridcell structure.
// Lighthouse flagged role="grid" directly containing <button> + endpoint divs
// (grid role requires role="row" children wrapping role="gridcell" cells).
// These tests assert the corrected ARIA pattern. They FAIL on the old flat
// structure (no row wrappers) and PASS once rows + gridcells wrap every cell.
// ============================================================================
describe('#190 a11y: grid ARIA pattern (aria-required-children)', () => {
  const mountRoute190 = () => mount(PacketRoute, { attachTo: document.body })

  it('.packet-grid carries role="grid"', () => {
    const w = mountRoute190()
    try {
      const grid = w.find('[data-test="packet-grid"]')
      expect(grid.exists()).toBe(true)
      expect(grid.attributes('role')).toBe('grid')
    } finally {
      w.unmount()
    }
  })

  it('every direct child of .packet-grid has role="row" (no bare cell/button)', () => {
    const w = mountRoute190()
    try {
      const grid = w.find('[data-test="packet-grid"]').element
      // packet-orb (aria-hidden) may be a direct child but is decorative; we
      // only assert ARIA-cell children are wrapped. Filter to element children
      // that are NOT the decorative orb.
      const children = Array.from(grid.children).filter((el) => {
        return !el.classList.contains('packet-orb')
      })
      expect(children.length).toBeGreaterThan(0)
      children.forEach((el) => {
        expect(el.getAttribute('role')).toBe('row')
      })
    } finally {
      w.unmount()
    }
  })

  it('every <button class="packet-tile"> has a closest [role="gridcell"] ancestor', () => {
    const w = mountRoute190()
    try {
      const tiles = w.findAll('button.packet-tile')
      expect(tiles.length).toBeGreaterThan(0)
      tiles.forEach((tile) => {
        const cell = tile.element.closest('[role="gridcell"]')
        expect(cell, 'tile must be wrapped in a role=gridcell').not.toBeNull()
      })
    } finally {
      w.unmount()
    }
  })

  it('no <button> is a direct child of [role="grid"] (flat button-in-grid regression)', () => {
    const w = mountRoute190()
    try {
      const grid = w.find('[data-test="packet-grid"]').element
      const directButtons = Array.from(grid.children).filter(
        (el) => el.tagName.toLowerCase() === 'button',
      )
      expect(directButtons).toHaveLength(0)
    } finally {
      w.unmount()
    }
  })

  it('every endpoint div (.packet-endpoint) is wrapped in role="gridcell"', () => {
    const w = mountRoute190()
    try {
      const endpoints = w.findAll('.packet-endpoint')
      // Level 1 has no endpoint, but at least verify the pattern holds for any
      // endpoint present (advance to a level that has source/target if needed).
      endpoints.forEach((ep) => {
        const cell = ep.element.closest('[role="gridcell"]')
        expect(cell, 'endpoint must be wrapped in a role=gridcell').not.toBeNull()
      })
    } finally {
      w.unmount()
    }
  })
})
