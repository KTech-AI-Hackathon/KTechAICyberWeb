/**
 * @file App.test.ts
 * @description Dark-theme lock wiring tests for the App shell (#239).
 *
 * #239 locked the site to the dark theme unconditionally. The preferences
 * STORE still owns a theme value (+ localStorage persistence), but App.vue
 * no longer mirrors it onto <html data-theme="..."> — it hardcodes
 * data-theme="dark" once on mount and never flips it. The dark/light
 * ThemeToggle component was deleted, so there is no UI affordance that
 * reaches the store's setTheme/toggleTheme actions.
 *
 * These tests pin that locked-dark contract end-to-end by mounting the REAL
 * App component with a REAL preferences store and asserting the user-visible
 * DOM attribute. Each AC has a test that would FAIL if the lock regressed:
 *   - On mount, data-theme is "dark" regardless of the store's initial theme.
 *   - data-theme stays "dark" even when store.theme is later set to "light"
 *     (proves the old watch(preferences.theme) reactive mirror is gone).
 *   - The store's theme value can still be mutated (the actions are inert,
 *     not stripped) — only the DOM is locked.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { usePreferencesStore } from '../stores/preferences'

// Mock @vueuse/head so App.setup() can register reactive head tags without a
// real <head> manager. useHead just no-ops.
vi.mock('@vueuse/head', () => ({
  useHead: () => {},
}))

// Mock vue-router: provide a stable empty route + RouterLink/RouterView stubs
// so App.vue's <router-view/> and <router-link> render without a real router.
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/', meta: {} }),
  RouterLink: { template: '<a><slot/></a>' },
  RouterView: { template: '<div></div>' },
}))

// Mock the i18n barrel so App.setup() doesn't try to load translations during
// these tests. t returns the key (the fallback used everywhere else).
vi.mock('../i18n', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    loadCurrentTranslations: async () => {},
  }),
  initLanguage: () => {},
}))

// Mock SEO helpers — App computes head meta from these, but the tests below
// assert on the theme attribute, not the meta tags.
vi.mock('../utils/seo', () => ({
  getRouteMeta: () => ({
    title: 't', description: 'd', keywords: 'k',
    ogType: 'website', ogLocale: 'en', ogSiteName: 's', ogUrl: 'u',
    ogImage: 'i', twitterCard: 'summary', twitterSite: 's', twitterImage: 'i',
    canonical: 'c',
  }),
  getStructuredData: () => [],
}))

// Mock the child components. #239 deleted ThemeToggle.vue — it is no longer
// mocked here (the component no longer exists). LanguageSwitcher + SkipLink
// are stubbed; Header renders its #toolbar slot so the App shell's toolbar
// wiring still mounts.
vi.mock('../components/LanguageSwitcher.vue', () => ({
  default: { name: 'LanguageSwitcher', template: '<div class="lang-stub"></div>' },
}))
vi.mock('../components/SkipLink.vue', () => ({
  default: { name: 'SkipLink', template: '<div class="skip-stub"></div>' },
}))
// Header.vue owns the routed nav (#164). It is mounted for real + asserted
// end-to-end (dropdown triggers, language toggle, mobile drawer) in its own
// suite AND in the shipped-app wiring test (App.nav-wiring.test.ts). Here we
// stub it so this theme-focused test stays decoupled from Header internals
// (it calls useRouter(), which this suite's vue-router mock intentionally
// omits — stubbing Header avoids coupling the theme contract to nav plumbing).
vi.mock('../components/Header.vue', () => ({
  default: {
    name: 'Header',
    template: '<nav class="header-stub"><slot name="toolbar" /></nav>',
  },
}))

const App = (await import('../App.vue')).default

describe('App.vue dark-theme lock (#239)', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mountApp = async () => {
    const wrapper = mount(App, { global: { plugins: [pinia] } })
    await flushPromises()
    await wrapper.vm.$nextTick()
    return wrapper
  }

  it('sets <html data-theme> to "dark" on initial mount regardless of store theme', async () => {
    // Seed the store to LIGHT before mount. The old code would have mirrored
    // "light" onto <html>; the #239 lock must force "dark" instead.
    const store = usePreferencesStore()
    store.setTheme('light')
    await mountApp()

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('stays "dark" even when store.theme is set to "light" after mount (watcher is gone)', async () => {
    const store = usePreferencesStore()
    store.setTheme('dark')
    await mountApp()

    // The old watch(preferences.theme) would have flipped <html> to "light"
    // here. The lock must NOT react to store mutations.
    store.setTheme('light')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 0))

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('the store theme value is still mutable (inert actions, locked DOM)', async () => {
    // Proves we did not strip the store's theme actions — they still update
    // state, they just no longer reach the DOM. This guards against a future
    // "cleanup" that deletes setTheme/toggleTheme and breaks persist/hydrate.
    const store = usePreferencesStore()
    store.setTheme('dark')
    await mountApp()

    store.setTheme('light')
    await flushPromises()
    expect(store.theme).toBe('light')
    // ...but the DOM stays dark.
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
