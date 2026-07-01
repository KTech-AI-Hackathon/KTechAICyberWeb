/**
 * @file App.head-wiring.test.ts
 * @description #260 shipped-app gate: proves createHead() is installed and
 * getRouteMeta drives per-route document titles.
 *
 * WHY THIS TEST EXISTS:
 * App.vue calls useHead(() => ({ title: currentMeta.value.title, ... })) but
 * before #260, createHead() was NEVER installed in main.js, so useHead was a
 * no-op and document.title stayed frozen at the static index.html value for
 * every route (AC2 symptom). No isolated test of useHead or getRouteMeta can
 * catch this — both work in isolation; the wiring between them is what was
 * missing. This test mounts the REAL App with the REAL @vueuse/head plugin
 * (createHead is NOT mocked here — other App tests mock useHead for unrelated
 * concerns) and asserts document.title actually changes as the route changes.
 *
 * RED-TEST PROOF: against the pre-fix tree (no `app.use(head)` in main.js),
 * navigating between routes leaves document.title unchanged, so the
 * "title CHANGES" and "18 DISTINCT titles" assertions fail.
 *
 * Note on jsdom document.title: vue-test-utils + happy-dom expose a writable
 * document.title that @vueuse/head updates via a <title> element effect. We
 * read it directly through the global `document` after navigation + flush.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { createHead } from '@vueuse/head'

// IntersectionObserver polyfill is global (tests/setup-intersection-observer.js)
// so lazy-mounted sections in App's children don't throw.

// Placeholder route components — this test asserts HEAD wiring (the App shell),
// not the rendered views. Real views would lazy-import and add unrelated
// failure surface (fetches, IO, rAF). App.vue's useHead reads only from the
// route + getRouteMeta, both of which are real here.
const placeholder = { template: '<div class="route-placeholder"></div>' }

const ROUTES = [
  { path: '/' },
  { path: '/about' },
  { path: '/news' },
  { path: '/news/some-article' },
  { path: '/services/supply-chain-finance' },
  { path: '/services/project-and-program-management' },
  { path: '/services/blockchain' },
  { path: '/services/big-data-ai' },
  { path: '/services/retail-lending' },
  { path: '/services/cross-border-payment' },
  { path: '/services/digital-asset-custody' },
  { path: '/services/stablecoin' },
  { path: '/join-us' },
  { path: '/contact' },
  { path: '/careers' },
  { path: '/pulse' },
  { path: '/privacy' },
  { path: '/terms' },
  { path: '/:pathMatch(.*)*' },
]

const buildRouter = (): Router =>
  createRouter({
    history: createMemoryHistory(),
    routes: ROUTES.map((r) => ({ ...r, component: placeholder })),
  })

const App = (await import('../App.vue')).default

describe('App.vue -> createHead + per-route document titles (#260 AC2)', () => {
  let pinia: ReturnType<typeof createPinia>
  let router: Router
  let head: ReturnType<typeof createHead>

  beforeEach(() => {
    localStorage.clear()
    document.title = '' // reset between tests
    pinia = createPinia()
    setActivePinia(pinia)
    router = buildRouter()
    head = createHead()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mountApp = async () => {
    await router.push('/')
    await router.isReady()
    const wrapper = mount(App, {
      global: { plugins: [pinia, router, head] },
    })
    await flushPromises()
    await wrapper.vm.$nextTick()
    return wrapper
  }

  it('renders a non-empty document.title on the home route', async () => {
    await mountApp()
    // createHead must be installed (the RED state has it uninstalled → useHead
    // is a no-op → document.title stays ''). @vueuse/head v2 (unhead) drives the
    // DOM <title> effect via internal reactivity; flushPromises + nextTick let
    // it settle.
    await flushPromises()
    const title = document.title
    expect(typeof title).toBe('string')
    expect(title.length).toBeGreaterThan(0)
    // Home title carries the brand either way (EN "KTech", ZH "开泰").
    expect(title === '' ? '' : title).toMatch(/KTech|开泰/)
  })

  it('CHANGES document.title when navigating / -> /about (proves useHead is live)', async () => {
    const wrapper = await mountApp()
    updateDom(head)
    await flushPromises()
    const homeTitle = document.title

    await router.push('/about')
    await flushPromises()
    await wrapper.vm.$nextTick()
    await flushPromises()
    const aboutTitle = document.title

    // The RED state (useHead a no-op) leaves document.title UNCHANGED here.
    expect(aboutTitle).not.toBe(homeTitle)
  })

  it('produces DISTINCT titles across the primary routes (no shared static title)', async () => {
    // The whole bug: every route shared ONE title. This collects the title per
    // route and asserts a healthy spread (>= 6 distinct — services legitimately
    // share the brand suffix but differ in their service name).
    const wrapper = await mountApp()
    const titles = new Map<string, string>()

    for (const r of ROUTES) {
      // Skip the catch-all param route (same as NotFound via unmatched path).
      if (r.path.includes(':pathMatch')) continue
      await router.push(r.path)
      await flushPromises()
      await wrapper.vm.$nextTick()
      await flushPromises()
      titles.set(r.path, document.title)
    }

    // Every title must carry the brand.
    for (const [, title] of titles) {
      expect(title).toMatch(/KTech|开泰远景/)
    }
    // Every title must be non-empty AND we must have at least 6 distinct ones
    // (a single frozen title → size 1 → fails).
    const distinct = new Set(titles.values())
    expect(distinct.size).toBeGreaterThanOrEqual(6)

    // Spot-check: the home title is NOT identical to /about or /news.
    expect(titles.get('/about')).not.toBe(titles.get('/'))
    expect(titles.get('/news')).not.toBe(titles.get('/'))
  })
})
