/**
 * Issue #270 — Contact form must not fake success.
 *
 * These tests drive the REAL submit path of Contact.vue's `handleSubmit`:
 *  - When `contactConfig.endpoint` is set → real `fetch` POST; success/error
 *    reflect the network result (issue #270 AC §1, §2).
 *  - When `contactConfig.endpoint` is null → the form shows a clear DEMO
 *    notice and NEVER fabricates a "success" (issue #270 AC §1 last option).
 *
 * The contact config module is mocked per-test so we can exercise both branches
 * without depending on a real backend.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { useLanguage } from '../../src/composables/useLanguage'
import { nextTick } from 'vue'

// Build a fully-valid form payload so validation passes and we reach the
// submit path under test.
const VALID_FORM = {
  name: 'Alice Lee',
  phone: '+86 755 0000 0000',
  company: 'KTech',
  email: 'alice@example.com',
  subject: 'general',
  message: 'Hello, I would like to discuss a partnership opportunity.',
  privacy: true,
}

async function fillForm(wrapper) {
  const form = wrapper.find('form')
  // Set each input on the underlying element then dispatch input so Vue
  // reactivity picks it up (v-model two-way binding).
  const setInput = (selector, value) => {
    const el = wrapper.find(selector).element
    el.value = value
    wrapper.find(selector).trigger('input')
  }
  setInput('input[name="name"]', VALID_FORM.name)
  setInput('input[name="phone"]', VALID_FORM.phone)
  setInput('input[name="company"]', VALID_FORM.company)
  setInput('input[name="email"]', VALID_FORM.email)
  // <select> uses @change in this component.
  const selectEl = wrapper.find('select[name="subject"]').element
  selectEl.value = VALID_FORM.subject
  wrapper.find('select[name="subject"]').trigger('change')
  setInput('textarea[name="message"]', VALID_FORM.message)
  // Privacy checkbox
  const checkbox = wrapper.find('input[name="privacy"]')
  checkbox.element.checked = true
  checkbox.trigger('change')
  await nextTick()
  return form
}

function makeWrapper() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div/>' } }],
  })
  const pinia = createPinia()
  return mount(Contact, { global: { plugins: [router, pinia] } })
}

// Lazy import so vi.mock runs first.
let Contact
let mockConfig

describe('Contact.vue submit (issue #270 — no fake success)', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = global.fetch
    useLanguage().setLanguage('en')
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
    vi.resetModules()
    if (mockConfig) mockConfig.endpoint = null
  })

  it('shows a DEMO notice (not success) when no endpoint is configured', async () => {
    mockConfig = { endpoint: null, demoEmail: 'demo@ktech.example' }
    vi.doMock('../../src/config/contact', () => ({ contactConfig: mockConfig }))
    Contact = (await import('../../src/views/Contact.vue')).default

    const wrapper = makeWrapper()
    const form = await fillForm(wrapper)
    await form.trigger('submit.prevent')
    await flushPromises()

    const status = wrapper.find('.submit-message')
    expect(status.exists()).toBe(true)
    // The DEMO path must NOT use type 'success' (the bug was a fake success).
    expect(status.classes()).not.toContain('success')
    // Demo copy is shown so the user knows nothing was actually sent.
    expect(status.text().toLowerCase()).toMatch(/demo|演示/)
    // isSubmitting must already be false (no async work pending).
    expect(wrapper.find('button.submit-button').attributes('disabled')).toBeFalsy()
  })

  it('performs a real fetch POST when an endpoint is configured and reflects success', async () => {
    mockConfig = { endpoint: 'https://formspree.io/f/xxxx', demoEmail: 'demo@ktech.example' }
    vi.doMock('../../src/config/contact', () => ({ contactConfig: mockConfig }))
    Contact = (await import('../../src/views/Contact.vue')).default

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    global.fetch = fetchMock

    const wrapper = makeWrapper()
    const form = await fillForm(wrapper)
    await form.trigger('submit.prevent')
    await flushPromises()

    // fetch was called against the configured endpoint with POST + JSON body.
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe(mockConfig.endpoint)
    expect(opts.method).toBe('POST')
    const body = JSON.parse(opts.body)
    expect(body.email).toBe(VALID_FORM.email)
    expect(body.message).toBe(VALID_FORM.message)

    // Success reflects the REAL network result.
    const status = wrapper.find('.submit-message')
    expect(status.classes()).toContain('success')
  })

  it('shows an error when the real submission fails (network or non-2xx)', async () => {
    mockConfig = { endpoint: 'https://formspree.io/f/xxxx', demoEmail: 'demo@ktech.example' }
    vi.doMock('../../src/config/contact', () => ({ contactConfig: mockConfig }))
    Contact = (await import('../../src/views/Contact.vue')).default

    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })

    const wrapper = makeWrapper()
    const form = await fillForm(wrapper)
    await form.trigger('submit.prevent')
    await flushPromises()

    const status = wrapper.find('.submit-message')
    expect(status.classes()).toContain('error')
    // And the bug-regression guard: NOT success.
    expect(status.classes()).not.toContain('success')
  })

  it('shows an error when the real fetch throws (offline / network error)', async () => {
    mockConfig = { endpoint: 'https://formspree.io/f/xxxx', demoEmail: 'demo@ktech.example' }
    vi.doMock('../../src/config/contact', () => ({ contactConfig: mockConfig }))
    Contact = (await import('../../src/views/Contact.vue')).default

    global.fetch = vi.fn().mockRejectedValue(new Error('Network'))

    const wrapper = makeWrapper()
    const form = await fillForm(wrapper)
    await form.trigger('submit.prevent')
    await flushPromises()

    const status = wrapper.find('.submit-message')
    expect(status.classes()).toContain('error')
    expect(status.classes()).not.toContain('success')
  })
})
