/**
 * @file App.selfdriving-wiring.test.ts
 * @description Shipped-app verification that SelfDrivingDemo is actually wired
 * into App.vue (#203 Self-Driving ambient demo).
 *
 * WHY THIS TEST EXISTS:
 * The #203 demo ships a SelfDrivingDemo.vue component + useAutoDemoLoop
 * composable + 4 child components. If that root component is NEVER rendered
 * inside App.vue — only tested in isolation — the entire feature is dead code
 * on the shipped app (same class of bug as the #164 nav overhaul that lived as
 * an orphan until a wiring test was added; see App.nav-wiring.test.ts). Every
 * isolated SelfDrivingDemo unit test would still pass while the site showed no
 * ambient background.
 *
 * This test mounts the REAL App.vue with a REAL router and the REAL child
 * components (Header, SelfDrivingDemo, the toggles, i18n are NOT mocked), then
 * asserts that the demo's root element + its bound data attributes actually
 * reach the DOM. If anyone reverts the wiring (removes <SelfDrivingDemo /> from
 * App.vue), this test fails — [data-selfdriving-root] would vanish.
 *
 * Test that would FAIL if SelfDrivingDemo weren't wired:
 *   - [data-selfdriving-root] is present in the rendered App.
 *   - data-current-phase is one of the 8 pipeline phases (proves the composable
 *     mounted and bound its FSM state).
 *
 * @ticket #203
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'

// useHead registers reactive <head> tags; stub it so App.setup() doesn't need
// a real head manager. This is the ONLY App dependency we mock — everything
// else (Header, SelfDrivingDemo, the toggles, i18n, the router) is real.
vi.mock('@vueuse/head', () => ({
  useHead: () => {},
}))

vi.mock('../utils/seo', () => ({
  getRouteMeta: () => ({
    title: 't', description: 'd', keywords: 'k',
    ogType: 'website', ogLocale: 'en', ogSiteName: 's', ogUrl: 'u',
    ogImage: 'i', twitterCard: 'summary', twitterSite: 's', twitterImage: 'i',
    canonical: 'c',
  }),
  getStructuredData: () => [],
}))

// happy-dom lacks matchMedia; install a benign default so useAutoDemoLoop's
// reduced-motion probe + useNeuralNet's breakpoint listener don't throw.
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
}))

// Deferred rAF so the loop does NOT recurse synchronously during mount.
const _rafQueue: FrameRequestCallback[] = []
vi.stubGlobal('requestAnimationFrame', ((cb: FrameRequestCallback) => {
  _rafQueue.push(cb)
  return _rafQueue.length
}) as any)
vi.stubGlobal('cancelAnimationFrame', (() => {}) as any)

// No-op IntersectionObserver (happy-dom ships one; replace to avoid spurious
// offscreen throttle during the unit mount).
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

const routes = [
  { path: '/', component: { template: '<div></div>' } },
  { path: '/about', component: { template: '<div></div>' } },
]

const buildRouter = (): Router =>
  createRouter({ history: createMemoryHistory(), routes })

const App = (await import('../App.vue')).default

describe('App.vue -> SelfDrivingDemo wiring (#203 shipped-app gate)', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mountApp = async () => {
    const router = buildRouter()
    await router.push('/')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [pinia, router] } })
    await flushPromises()
    await wrapper.vm.$nextTick()
    return wrapper
  }

  it('renders [data-selfdriving-root] in the shipped App (not only in isolation)', async () => {
    const wrapper = await mountApp()
    expect(wrapper.find('[data-selfdriving-root]').exists()).toBe(true)
  })

  it('binds a real pipeline phase to data-current-phase (proves the FSM mounted)', async () => {
    const wrapper = await mountApp()
    const phase = wrapper.find('[data-selfdriving-root]').attributes('data-current-phase')
    expect(phase).toBeTruthy()
    expect([
      'intake', 'triage', 'planner', 'coder',
      'security', 'evaluator', 'merger', 'resolved',
    ]).toContain(phase)
  })

  it('the demo region is aria-hidden so foreground content stays selectable', async () => {
    const wrapper = await mountApp()
    expect(
      wrapper.find('[data-selfdriving-root]').attributes('aria-hidden'),
    ).toBe('true')
  })
})
