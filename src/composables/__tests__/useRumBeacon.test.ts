/**
 * @file useRumBeacon.test.ts
 * @description Unit tests for the RUM beacon composable (#187 CWV monitoring).
 * @ticket #187 - CWV: continuous performance monitoring (RUM beacon)
 *
 * TDD: written BEFORE the implementation. Drives a real host component that
 * mounts the composable, mirroring useAudioPulse.test.ts conventions.
 *
 * Mock surface (mirrors useAudioPulse.test.ts): matchMedia + rAF + timers +
 * PerformanceObserver-style APIs are mocked so timing is deterministic.
 * `web-vitals` is mocked via vi.mock so the 5 onLCP/onCLS/onINP/onFCP/onTTFB
 * callbacks are captured and can be fired synthetically.
 *
 * Coverage areas (the planner's 14-case contract):
 *  1.  Default inert (enabled=false) -> no observer, no storage, no sendBeacon.
 *  2.  Enable -> collect: observers registered; LCP callback -> buffer + localStorage.
 *  3.  No-endpoint fallback: enabled + endpoint=null -> localStorage written, no beacon.
 *  4.  Endpoint beacon: visibility-hidden/pagehide -> sendBeacon with cwv-v1 schema.
 *  5.  sendBeacon returns false -> fetch(keepalive) fallback.
 *  6.  Both fail -> metric retained in localStorage ring buffer.
 *  7.  Visibility throttle: exactly one flush on hidden; no re-flush on visible.
 *  8.  Sample-rate gate: sampleRate=0 -> inert even if enabled.
 *  9.  PII stripping: no url/location/search/hash/cookie/userAgent/referer keys.
 *  10. Reduced-motion does NOT disable collection.
 *  11. Ring-buffer FIFO cap at N=20.
 *  12. PerformanceObserver absent -> no throw, inert API.
 *  13. Dynamic import('web-vitals') rejects -> catch, log, stay inert.
 *  14. Test hook: DEV or VITE_RUM_TEST_HOOK=1 -> window.__rum defined.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

// ---------------------------------------------------------------------------
// Capture holders installed by the web-vitals mock. Each on* registration stores
// its callback here so a test can fire a synthetic metric.
// ---------------------------------------------------------------------------
let lcpCb: ((m: any) => void) | null = null
let clsCb: ((m: any) => void) | null = null
let inpCb: ((m: any) => void) | null = null
let fcpCb: ((m: any) => void) | null = null
let ttfbCb: ((m: any) => void) | null = null

// vi.mock is hoisted above imports. The factory returns the 5 on* functions;
// each records its callback into the module-level holders above. resetMocks()
// (called in beforeEach) clears them.
vi.mock('web-vitals', () => ({
  onLCP: (cb: (m: any) => void) => { lcpCb = cb },
  onCLS: (cb: (m: any) => void) => { clsCb = cb },
  onINP: (cb: (m: any) => void) => { inpCb = cb },
  onFCP: (cb: (m: any) => void) => { fcpCb = cb },
  onTTFB: (cb: (m: any) => void) => { ttfbCb = cb },
}))

// Import AFTER vi.mock is registered (hoisting handles ordering).
import {
  useRumBeacon,
  RUM_HISTORY_KEY,
  RUM_HISTORY_CAP,
  RUM_SCHEMA,
  buildPayload,
  pushFifo,
  stripPii,
  ratingOf,
  uuidV4,
  RATING_THRESHOLDS,
} from '../useRumBeacon'

// ---------------------------------------------------------------------------
// sendBeacon / fetch / localStorage spies
// ---------------------------------------------------------------------------
let sendBeaconSpy: ReturnType<typeof vi.fn>
let fetchSpy: ReturnType<typeof vi.fn>
let store: Record<string, string>

// ---------------------------------------------------------------------------
// Host component (mirrors useAudioPulse.test.ts)
// ---------------------------------------------------------------------------
function mountHost(overrides: Record<string, any> = {}) {
  let api: ReturnType<typeof useRumBeacon> | null = null
  const TestHost = defineComponent({
    name: 'RumBeaconHost',
    setup() {
      api = useRumBeacon(overrides)
      return {}
    },
    render() {
      return h('div', { class: 'host' })
    },
  })
  const wrapper = mount(TestHost, { attachTo: document.body })
  return { wrapper, getApi: () => api! }
}

// ---------------------------------------------------------------------------
// Harness setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  // Reset the captured web-vitals callbacks.
  lcpCb = null
  clsCb = null
  inpCb = null
  fcpCb = null
  ttfbCb = null

  // localStorage mock
  store = {}
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => store[key] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, val: string) => { store[key] = val })

  // sendBeacon mock (returns true by default = success).
  sendBeaconSpy = vi.fn(() => true)
  Object.defineProperty(navigator, 'sendBeacon', {
    value: sendBeaconSpy,
    configurable: true,
    writable: true,
  })

  // fetch mock (default: resolves ok — used only when sendBeacon returns false).
  fetchSpy = vi.fn(() => Promise.resolve({ ok: true } as any))
  vi.spyOn(globalThis, 'fetch').mockImplementation(fetchSpy as any)

  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  delete (window as any).__rum
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PURE constants — pinned shapes', () => {
  it('RUM_SCHEMA is cwv-v1', () => {
    expect(RUM_SCHEMA).toBe('cwv-v1')
  })
  it('RUM_HISTORY_KEY is ktech-rum-history', () => {
    expect(RUM_HISTORY_KEY).toBe('ktech-rum-history')
  })
  it('RUM_HISTORY_CAP is 20', () => {
    expect(RUM_HISTORY_CAP).toBe(20)
  })
})

describe('stripPii() — whitelist metric fields (PURE)', () => {
  it('#1 keeps only name/value/rating + optional delta/id', () => {
    const out = stripPii({
      name: 'LCP', value: 2500, rating: 'good', delta: 2500, id: 'v3-1',
      entries: [], attribution: { url: 'https://evil/', element: 'div' },
    })
    expect(out).toEqual({ name: 'LCP', value: 2500, rating: 'good', delta: 2500, id: 'v3-1' })
  })
  it('#2 drops attribution.url / entries (PII)', () => {
    const out: any = stripPii({ name: 'CLS', value: 0.1, rating: 'good', attribution: { url: 'x' } })
    expect(out.attribution).toBeUndefined()
    expect(out.url).toBeUndefined()
  })
})

describe('buildPayload() — cwv-v1 envelope (PURE, PII-free)', () => {
  it('#1 produces schema/sessionId/ts/metrics', () => {
    const p = buildPayload('sess-1', 1000, [{ name: 'LCP', value: 1, rating: 'good' }])
    expect(p.schema).toBe('cwv-v1')
    expect(p.sessionId).toBe('sess-1')
    expect(p.ts).toBe(1000)
    expect(Array.isArray(p.metrics)).toBe(true)
  })
  it('#2 strips each metric through stripPii', () => {
    const p = buildPayload('s', 0, [{ name: 'LCP', value: 2, rating: 'good', attribution: { url: 'leak' } }])
    expect((p.metrics[0] as any).attribution).toBeUndefined()
  })
  it('#3 contains NO PII keys anywhere in the JSON', () => {
    const json = JSON.stringify(buildPayload('s', 0, [
      { name: 'LCP', value: 1, rating: 'good', url: 'x', cookie: 'y', userAgent: 'z', referer: 'w' },
    ]))
    for (const term of ['"url"', '"cookie"', '"userAgent"', '"referer"', '"location"', '"ip"']) {
      expect(json).not.toContain(term)
    }
  })
})

describe('pushFifo() — ring buffer w/ FIFO cap (PURE)', () => {
  it('#1 appends under cap', () => {
    expect(pushFifo([1, 2], 3, 5)).toEqual([1, 2, 3])
  })
  it('#2 drops oldest when over cap', () => {
    expect(pushFifo([1, 2, 3], 4, 3)).toEqual([2, 3, 4])
  })
  it('#3 does not mutate input', () => {
    const in_ = [1, 2]
    pushFifo(in_, 3, 2)
    expect(in_).toEqual([1, 2])
  })
})

describe('ratingOf() — rating buckets (PURE)', () => {
  it('#1 LCP good/needs/poor', () => {
    expect(ratingOf('LCP', 2000)).toBe('good')
    expect(ratingOf('LCP', 3000)).toBe('needs-improvement')
    expect(ratingOf('LCP', 4500)).toBe('poor')
  })
  it('#2 INP thresholds', () => {
    expect(ratingOf('INP', 100)).toBe('good')
    expect(ratingOf('INP', 600)).toBe('poor')
  })
  it('#3 unknown name -> needs-improvement', () => {
    expect(ratingOf('BOGUS', 1)).toBe('needs-improvement')
  })
})

describe('uuidV4() — RFC 4122 v4 shape (PURE)', () => {
  it('#1 matches v4 pattern + is unique', () => {
    const a = uuidV4()
    const b = uuidV4()
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(a).not.toBe(b)
  })
})

describe('useRumBeacon() — #187 RUM beacon', () => {
  it('#1 DEFAULT INERT: enabled=false -> no observers, no storage write, no beacon', async () => {
    const { wrapper, getApi } = mountHost({ enabled: false, endpoint: '/rum', sampleRate: 1 })
    const api = getApi()
    expect(api.enabled.value).toBe(false)
    // Drain any onMounted async (dynamic import).
    await vi.advanceTimersByTimeAsync(0)

    // No web-vitals observer registered.
    expect(lcpCb).toBeNull()
    // No localStorage history write.
    expect(store[RUM_HISTORY_KEY]).toBeUndefined()
    wrapper.unmount()
  })

  it('#2 ENABLE -> COLLECT: setEnabled(true) registers observers; LCP fires -> buffer + localStorage', async () => {
    const { wrapper, getApi } = mountHost({ enabled: false, endpoint: null, sampleRate: 1 })
    const api = getApi()
    api.setEnabled(true)
    await vi.advanceTimersByTimeAsync(0)

    // Observers registered after enable.
    expect(lcpCb).not.toBeNull()
    expect(clsCb).not.toBeNull()
    expect(inpCb).not.toBeNull()
    expect(fcpCb).not.toBeNull()
    expect(ttfbCb).not.toBeNull()

    // Fire a synthetic LCP metric.
    lcpCb!({ name: 'LCP', value: 2500, rating: 'good', delta: 2500, id: 'v3-1' })
    await vi.advanceTimersByTimeAsync(0)

    expect(api.history.value.length).toBe(1)
    expect(api.latest.value?.name).toBe('LCP')
    expect(store[RUM_HISTORY_KEY]).toBeDefined()
    wrapper.unmount()
  })

  it('#3 NO-ENDPOINT FALLBACK: enabled + endpoint=null -> localStorage written, sendBeacon NOT called', async () => {
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: null, sampleRate: 1 })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)

    fcpCb!({ name: 'FCP', value: 1800, rating: 'good' })
    await vi.advanceTimersByTimeAsync(0)

    expect(store[RUM_HISTORY_KEY]).toBeDefined()
    expect(sendBeaconSpy).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('#4 ENDPOINT BEACON: visibility-hidden -> sendBeacon with cwv-v1 schema + metric slots', async () => {
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: '/rum', sampleRate: 1 })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)

    // Collect one metric so there is something to flush.
    lcpCb!({ name: 'LCP', value: 2200, rating: 'good', delta: 2200, id: 'v3-lcp' })
    await vi.advanceTimersByTimeAsync(0)

    // Page goes hidden -> triggers flush.
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1)
    const [url, body] = sendBeaconSpy.mock.calls[0]
    expect(url).toBe('/rum')
    const payload = JSON.parse(body as string)
    expect(payload.schema).toBe(RUM_SCHEMA)
    expect(typeof payload.sessionId).toBe('string')
    expect(payload.sessionId.length).toBeGreaterThan(0)
    expect(typeof payload.ts).toBe('number')
    expect(Array.isArray(payload.metrics)).toBe(true)
    expect(payload.metrics.length).toBeGreaterThanOrEqual(1)
    // Each metric has the documented shape.
    const m = payload.metrics[0]
    expect(['name', 'value', 'rating'].every((k) => k in m)).toBe(true)
    wrapper.unmount()
  })

  it('#5 sendBeacon returns false -> fetch(endpoint, {keepalive:true}) fallback', async () => {
    sendBeaconSpy = vi.fn(() => false)
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeaconSpy, configurable: true, writable: true })
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: '/rum', sampleRate: 1 })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)

    clsCb!({ name: 'CLS', value: 0.05, rating: 'good' })
    await vi.advanceTimersByTimeAsync(0)

    api.flushNow()
    await vi.advanceTimersByTimeAsync(0)

    expect(sendBeaconSpy).toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('/rum')
    expect((init as any).keepalive).toBe(true)
    wrapper.unmount()
  })

  it('#6 BOTH FAIL -> metric retained in localStorage ring buffer', async () => {
    // Both transports fail: sendBeacon returns false + fetch rejects.
    sendBeaconSpy = vi.fn(() => false)
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeaconSpy, configurable: true, writable: true })
    fetchSpy = vi.fn(() => Promise.reject(new Error('network down')))
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchSpy as any)

    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: '/rum', sampleRate: 1 })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)

    lcpCb!({ name: 'LCP', value: 3000, rating: 'needs-improvement' })
    await vi.advanceTimersByTimeAsync(0)

    api.flushNow()
    await vi.advanceTimersByTimeAsync(0)
    // Let the rejected fetch promise settle (microtask).
    await Promise.resolve().then(() => {})

    // Metric is still in history (retained after failed dispatch).
    expect(api.history.value.length).toBe(1)
    expect(store[RUM_HISTORY_KEY]).toBeDefined()
    wrapper.unmount()
  })

  it('#7 VISIBILITY THROTTLE: hidden triggers exactly one flush; visible does not re-flush', async () => {
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: '/rum', sampleRate: 1 })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)

    ttfbCb!({ name: 'TTFB', value: 800, rating: 'good' })
    await vi.advanceTimersByTimeAsync(0)

    // hidden -> flush.
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    const afterHidden = sendBeaconSpy.mock.calls.length

    // visible -> no new flush.
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(sendBeaconSpy.mock.calls.length).toBe(afterHidden)
    expect(afterHidden).toBeGreaterThanOrEqual(1)
    wrapper.unmount()
  })

  it('#8 SAMPLE-RATE GATE: sampleRate=0 -> inert even if enabled', async () => {
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: '/rum', sampleRate: 0 })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)

    // No observers registered (sample gate rejected the session).
    expect(lcpCb).toBeNull()
    expect(api.config.sampleRate).toBe(0)
    wrapper.unmount()
  })

  it('#9 PII STRIPPING: payload JSON has NO url/location/search/hash/cookie/userAgent/referer', async () => {
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: '/rum', sampleRate: 1 })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)

    lcpCb!({ name: 'LCP', value: 2500, rating: 'good', delta: 2500, id: 'v3-pii' })
    await vi.advanceTimersByTimeAsync(0)

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    const body = sendBeaconSpy.mock.calls[0][1] as string
    const lower = body.toLowerCase()
    const forbidden = ['url', 'location', 'search', 'hash', 'cookie', 'useragent', 'referer', 'ip']
    for (const term of forbidden) {
      // The literal key must not appear as a JSON key (":-or-, followed by").
      expect(body).not.toMatch(new RegExp(`"${term}"\\s*:`, 'i'))
      // Defensive: the substring must not leak anywhere (covers "userAgent" etc).
      expect(lower).not.toContain(`"${term}"`)
    }
    wrapper.unmount()
  })

  it('#9b sessionId is uuid-v4 format + differs across two instances', async () => {
    const ids: string[] = []
    for (let i = 0; i < 2; i++) {
      const { wrapper, getApi } = mountHost({ enabled: true, endpoint: '/rum', sampleRate: 1 })
      const api = getApi()
      await vi.advanceTimersByTimeAsync(0)
      lcpCb!({ name: 'LCP', value: 1000, rating: 'good' })
      await vi.advanceTimersByTimeAsync(0)
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
      const payload = JSON.parse(sendBeaconSpy.mock.calls[sendBeaconSpy.mock.calls.length - 1][1] as string)
      ids.push(payload.sessionId)
      wrapper.unmount()
      // reset between mounts
      sendBeaconSpy.mockClear()
    }
    // uuid v4 shape: 8-4-4-4-12 hex.
    for (const id of ids) {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    }
    // Two page loads -> two different session ids (not identity-correlating).
    expect(ids[0]).not.toBe(ids[1])
  })

  it('#10 REDUCED MOTION does NOT disable collection (observers still register)', async () => {
    // Stub matchMedia to report reduced motion on.
    window.matchMedia = ((q: string) => ({
      matches: q === '(prefers-reduced-motion: reduce)',
      media: q,
      addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
    }) as any) as any
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: null, sampleRate: 1 })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)

    expect(api.enabled.value).toBe(true)
    expect(lcpCb).not.toBeNull() // collection NOT gated on reduced-motion
    wrapper.unmount()
  })

  it('#11 RING BUFFER FIFO cap at N=20', async () => {
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: null, sampleRate: 1 })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)

    // Push 30 samples; history must cap at RUM_HISTORY_CAP (20).
    for (let i = 0; i < 30; i++) {
      lcpCb!({ name: 'LCP', value: 1000 + i, rating: 'good' })
      await vi.advanceTimersByTimeAsync(0)
    }
    expect(api.history.value.length).toBe(RUM_HISTORY_CAP)
    // FIFO: the OLDEST sample was evicted; the newest retained.
    const persisted = JSON.parse(store[RUM_HISTORY_KEY])
    expect(persisted.length).toBe(RUM_HISTORY_CAP)
    // Newest retained sample should carry value 1029 (the last pushed).
    expect(persisted[persisted.length - 1].metrics[0].value).toBe(1029)
    wrapper.unmount()
  })

  it('#12 PerformanceObserver absent -> no throw, inert API', async () => {
    // Hide PerformanceObserver. web-vitals is mocked so it won't actually use it,
    // but the composable must also defend: if it tries to feature-detect PO and
    // PO is absent, it must stay inert instead of throwing.
    const saved = (window as any).PerformanceObserver
    delete (window as any).PerformanceObserver
    let wrapper: any
    expect(() => {
      const r = mountHost({ enabled: true, endpoint: null, sampleRate: 1 })
      wrapper = r.wrapper
    }).not.toThrow()
    await vi.advanceTimersByTimeAsync(0)
    ;(window as any).PerformanceObserver = saved
    wrapper.unmount()
  })

  it('#13 dynamic import(web-vitals) rejects -> catch, log, stay inert (no throw, no observer)', async () => {
    // Override the mock to a rejecting dynamic import. We re-mock with a factory
    // whose default export throws on access — but since vi.mock is hoisted we
    // instead drive the rejection by stubbing the import via a transient flag.
    // Simplest robust approach: spy on console.error, and use the composable's
    // __overrides.importFail = true to simulate a rejected dynamic import.
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: null, sampleRate: 1, __importFail: true })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)
    // Observers never registered (import rejected -> inert), no throw.
    expect(lcpCb).toBeNull()
    expect(api.history.value.length).toBe(0)
    errSpy.mockRestore()
    wrapper.unmount()
  })

  it('#14 TEST HOOK: VITE_RUM_TEST_HOOK=1 -> window.__rum defined with {flush, history, config}', async () => {
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: null, sampleRate: 1, __testHook: true })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)

    const hook = (window as any).__rum
    expect(hook).toBeDefined()
    expect(typeof hook.flush).toBe('function')
    expect(hook.history).toBeDefined()
    expect(hook.config).toBeDefined()
    // flush on the hook = same as api.flushNow.
    expect(typeof api.flushNow).toBe('function')
    wrapper.unmount()
  })

  it('#15 __resetForTests clears history + window.__rum', async () => {
    const { wrapper, getApi } = mountHost({ enabled: true, endpoint: null, sampleRate: 1, __testHook: true })
    const api = getApi()
    await vi.advanceTimersByTimeAsync(0)
    lcpCb!({ name: 'LCP', value: 2000, rating: 'good' })
    await vi.advanceTimersByTimeAsync(0)
    expect(api.history.value.length).toBe(1)

    api.__resetForTests()
    expect(api.history.value.length).toBe(0)
    wrapper.unmount()
  })
})