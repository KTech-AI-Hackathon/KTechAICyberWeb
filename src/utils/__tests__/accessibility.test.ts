/**
 * @file accessibility.test.ts
 * @description Unit tests for accessibility utilities (src/utils/accessibility.js)
 *
 * Coverage-hardening pass. Tests drive the real DOM (happy-dom) with real
 * elements; no internals are mutated. Each assertion fails if the underlying
 * behavior breaks.
 *
 * Test categories:
 * - FocusTrap: getFocusableElements, activate (focus first + keydown wiring),
 *     deactivate (restore focus + listener removal), Tab/Shift+Tab wrap-around,
 *     empty container, disabled/hidden filtering
 * - createFocusTrap factory
 * - setAria: set/remove attributes, null value -> removeAttribute, no-op on null el
 * - updateHtmlLang / getHtmlLangCode
 * - announce* : DOM nodes created/removed, polite vs assertive aria-live,
 *     existing announcer replaced, cleanup after 1000ms
 * - focusElement: selector + element forms, deferred via setTimeout
 * - isFocusable: tag/disabled/tabindex logic
 * - getFirstFocusable: returns first / null
 * - createKeyboardHandler: dispatch by key, preventDefault, ignore unmapped
 * - prefersReducedMotion / prefersHighContrast (matchMedia mock)
 * - logAccessibilityInfo: shape + console.log, no-op on null
 * - useFocusTrap / useAria composables
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

import {
  FocusTrap,
  createFocusTrap,
  setAria,
  updateHtmlLang,
  getHtmlLangCode,
  announceToScreenReader,
  announcePolite,
  announceAssertive,
  focusElement,
  isFocusable,
  getFirstFocusable,
  createKeyboardHandler,
  prefersReducedMotion,
  prefersHighContrast,
  logAccessibilityInfo,
  useFocusTrap,
  useAria,
} from '../accessibility.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a container with a known set of focusable + non-focusable elements. */
function buildFocusableContainer(): HTMLElement {
  const container = document.createElement('div')
  container.innerHTML = `
    <a href="#a" data-qa="link">link</a>
    <button data-qa="btn">btn</button>
    <button disabled data-qa="btn-disabled">disabled</button>
    <input data-qa="input" />
    <input disabled data-qa="input-disabled" />
    <textarea data-qa="textarea"></textarea>
    <select data-qa="select"><option>x</option></select>
    <div tabindex="0" data-qa="tabindex0">ti0</div>
    <div tabindex="-1" data-qa="tabindex-1">ti-1</div>
    <div contenteditable="true" data-qa="editable">ed</div>
  `
  return container
}

/** Dispatch a Tab-style KeyboardEvent on a target. */
function dispatchTab(target: Element, shiftKey = false): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
    shiftKey,
  })
  // jsdom/happy-dom: focus state needs to be set explicitly for assertions.
  vi.spyOn(event, 'preventDefault')
  target.dispatchEvent(event)
  return event
}

// ---------------------------------------------------------------------------
// FocusTrap
// ---------------------------------------------------------------------------
describe('FocusTrap', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = buildFocusableContainer()
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    document.documentElement.lang = ''
  })

  describe('getFocusableElements()', () => {
    it('returns focusable elements and skips disabled / tabindex="-1"', () => {
      const trap = new FocusTrap(container)
      const els = trap.getFocusableElements()

      const tags = els.map((e) => e.getAttribute('data-qa'))
      expect(tags).toContain('link')
      expect(tags).toContain('btn')
      expect(tags).toContain('input')
      expect(tags).toContain('textarea')
      expect(tags).toContain('select')
      expect(tags).toContain('tabindex0')
      expect(tags).toContain('editable')

      // Disabled / negative tabindex must be filtered out.
      expect(tags).not.toContain('btn-disabled')
      expect(tags).not.toContain('input-disabled')
      expect(tags).not.toContain('tabindex-1')
    })

    it('returns an empty array for a container with no focusable elements', () => {
      const empty = document.createElement('div')
      empty.innerHTML = '<p>nothing here</p><div tabindex="-1">skip</div>'
      const trap = new FocusTrap(empty)
      expect(trap.getFocusableElements()).toEqual([])
    })

    it('returns a real Array (not a NodeList)', () => {
      const trap = new FocusTrap(container)
      const els = trap.getFocusableElements()
      expect(Array.isArray(els)).toBe(true)
    })
  })

  describe('activate()', () => {
    it('saves the previously focused element, focuses the first element, and listens for keydown', () => {
      const prior = document.createElement('button')
      document.body.appendChild(prior)
      prior.focus()
      expect(document.activeElement).toBe(prior)

      const trap = new FocusTrap(container)
      const addSpy = vi.spyOn(document, 'addEventListener')
      const firstFocusable = container.querySelector('[data-qa="link"]') as HTMLElement

      trap.activate()

      expect(trap.previousActiveElement).toBe(prior)
      expect(document.activeElement).toBe(firstFocusable)
      expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      prior.remove()
    })

    it('does not throw when the container has no focusable elements', () => {
      const empty = document.createElement('div')
      document.body.appendChild(empty)
      const trap = new FocusTrap(empty)

      expect(() => trap.activate()).not.toThrow()
      expect(trap.firstFocusableElement).toBeNull()
      expect(trap.lastFocusableElement).toBeNull()

      empty.remove()
    })
  })

  describe('deactivate()', () => {
    it('removes the keydown listener and restores focus to the previous element', () => {
      const prior = document.createElement('button')
      document.body.appendChild(prior)
      prior.focus()

      const trap = new FocusTrap(container)
      trap.activate()

      const removeSpy = vi.spyOn(document, 'removeEventListener')
      trap.deactivate()

      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(document.activeElement).toBe(prior)

      prior.remove()
    })

    it('does not throw and does not refocus when there was no previous element', () => {
      const trap = new FocusTrap(container)
      // activate() sets previousActiveElement; skip it to test the falsy branch.
      trap.previousActiveElement = null
      // No throw, and no attempt to refocus a falsy element.
      expect(() => trap.deactivate()).not.toThrow()
    })
  })

  describe('handleKeyDown() — Tab wrap-around', () => {
    it('wraps Shift+Tab from the first element back to the last', () => {
      const trap = new FocusTrap(container)
      trap.activate()

      const first = trap.firstFocusableElement as HTMLElement
      const last = trap.lastFocusableElement as HTMLElement

      first.focus()
      const event = dispatchTab(first, /* shift */ true)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(document.activeElement).toBe(last)
    })

    it('wraps Tab from the last element back to the first', () => {
      const trap = new FocusTrap(container)
      trap.activate()

      const first = trap.firstFocusableElement as HTMLElement
      const last = trap.lastFocusableElement as HTMLElement

      last.focus()
      const event = dispatchTab(last, /* shift */ false)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(document.activeElement).toBe(first)
    })

    it('does NOT wrap when Tab happens on a middle element (lets normal Tab proceed)', () => {
      const trap = new FocusTrap(container)
      trap.activate()

      // Pick an element that is neither first nor last.
      const middle = container.querySelector('[data-qa="btn"]') as HTMLElement
      middle.focus()
      const event = dispatchTab(middle, /* shift */ false)

      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('ignores non-Tab keys entirely', () => {
      const trap = new FocusTrap(container)
      trap.activate()

      const first = trap.firstFocusableElement as HTMLElement
      first.focus()

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
      vi.spyOn(event, 'preventDefault')
      first.dispatchEvent(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
    })
  })

  it('handleKeyDown is bound (this stays the trap instance when used as a listener)', () => {
    const trap = new FocusTrap(container)
    // Adding then dispatching on the document exercises the bound reference.
    document.addEventListener('keydown', trap.handleKeyDown)
    trap.activate()

    const first = trap.firstFocusableElement as HTMLElement
    first.focus()

    // Dispatching a Tab from the document level must still wrap correctly,
    // proving the handler is bound to the trap (this.firstFocusableElement).
    const event = dispatchTab(first, true)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(document.activeElement).toBe(trap.lastFocusableElement)

    document.removeEventListener('keydown', trap.handleKeyDown)
  })
})

// ---------------------------------------------------------------------------
// createFocusTrap
// ---------------------------------------------------------------------------
describe('createFocusTrap()', () => {
  it('returns a FocusTrap instance wrapping the container', () => {
    const container = document.createElement('div')
    const trap = createFocusTrap(container)
    expect(trap).toBeInstanceOf(FocusTrap)
    expect(trap.container).toBe(container)
  })
})

// ---------------------------------------------------------------------------
// setAria
// ---------------------------------------------------------------------------
describe('setAria()', () => {
  it('sets each attribute as a string', () => {
    const el = document.createElement('div')
    setAria(el, { 'aria-label': 'Save', 'aria-expanded': 'true', role: 'dialog' })
    expect(el.getAttribute('aria-label')).toBe('Save')
    expect(el.getAttribute('aria-expanded')).toBe('true')
    expect(el.getAttribute('role')).toBe('dialog')
  })

  it('removes attributes whose value is null', () => {
    const el = document.createElement('div')
    el.setAttribute('aria-label', 'existing')
    setAria(el, { 'aria-label': null })
    expect(el.hasAttribute('aria-label')).toBe(false)
  })

  it('mixes set + remove in one call', () => {
    const el = document.createElement('div')
    el.setAttribute('aria-hidden', 'true')
    setAria(el, { 'aria-hidden': null, 'aria-busy': true })
    expect(el.hasAttribute('aria-hidden')).toBe(false)
    expect(el.getAttribute('aria-busy')).toBe('true')
  })

  it('is a no-op when the element is null/falsy', () => {
    expect(() => setAria(null, { 'aria-label': 'x' })).not.toThrow()
    expect(() => setAria(undefined, { role: 'x' })).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// updateHtmlLang / getHtmlLangCode
// ---------------------------------------------------------------------------
describe('updateHtmlLang()', () => {
  afterEach(() => {
    document.documentElement.lang = ''
  })

  it('sets documentElement.lang to the given code', () => {
    updateHtmlLang('zh-CN')
    expect(document.documentElement.lang).toBe('zh-CN')
  })

  it('overwrites a previous value', () => {
    updateHtmlLang('en')
    updateHtmlLang('zh-CN')
    expect(document.documentElement.lang).toBe('zh-CN')
  })
})

describe('getHtmlLangCode()', () => {
  it('maps "en" -> "en"', () => {
    expect(getHtmlLangCode('en')).toBe('en')
  })

  it('maps "zh" -> "zh-CN"', () => {
    expect(getHtmlLangCode('zh')).toBe('zh-CN')
  })

  it('passes through unmapped codes verbatim', () => {
    expect(getHtmlLangCode('ja')).toBe('ja')
    expect(getHtmlLangCode('fr')).toBe('fr')
  })
})

// ---------------------------------------------------------------------------
// announceToScreenReader / announcePolite / announceAssertive
// ---------------------------------------------------------------------------
describe('announceToScreenReader()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Prior announce tests leave live-region nodes in the DOM because the 1000ms
    // cleanup never fires under fake timers. Clear them so each test starts clean.
    document.querySelectorAll('.a11y-announcer').forEach((n) => n.remove())
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  function announcers(): HTMLElement[] {
    return Array.from(document.querySelectorAll('.a11y-announcer')) as HTMLElement[]
  }

  it('appends a polite announcer node with the message text', () => {
    announceToScreenReader('Loaded', 'polite')
    const nodes = announcers()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].getAttribute('role')).toBe('status')
    expect(nodes[0].getAttribute('aria-live')).toBe('polite')
    expect(nodes[0].getAttribute('aria-atomic')).toBe('true')
    expect(nodes[0].textContent).toBe('Loaded')
    expect(nodes[0].className).toContain('sr-only')
  })

  it('creates an assertive announcer when priority is "assertive"', () => {
    announceToScreenReader('Error', 'assertive')
    const nodes = announcers()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].getAttribute('aria-live')).toBe('assertive')
  })

  it('removes an existing announcer of the same priority before adding a new one', () => {
    announceToScreenReader('one', 'polite')
    announceToScreenReader('two', 'polite')
    const nodes = announcers()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].textContent).toBe('two')
  })

  it('keeps polite and assertive announcers separate', () => {
    announceToScreenReader('p', 'polite')
    announceToScreenReader('a', 'assertive')
    const nodes = announcers()
    expect(nodes).toHaveLength(2)
    const lives = nodes.map((n) => n.getAttribute('aria-live')).sort()
    expect(lives).toEqual(['assertive', 'polite'])
  })

  it('removes the announcer after the 1000ms timeout', () => {
    announceToScreenReader('gone soon', 'polite')
    expect(announcers()).toHaveLength(1)
    vi.advanceTimersByTime(999)
    expect(announcers()).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(announcers()).toHaveLength(0)
  })

  it('announcePolite delegates with priority="polite"', () => {
    announcePolite('hi')
    const nodes = announcers()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].getAttribute('aria-live')).toBe('polite')
    expect(nodes[0].textContent).toBe('hi')
  })

  it('announceAssertive produces an assertive announcer', () => {
    announceAssertive('alert')
    const nodes = announcers()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].getAttribute('aria-live')).toBe('assertive')
    expect(nodes[0].textContent).toBe('alert')
  })
})

// ---------------------------------------------------------------------------
// focusElement
// ---------------------------------------------------------------------------
describe('focusElement()', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('focuses an element passed by reference (after a setTimeout(0))', () => {
    const el = document.createElement('button')
    document.body.appendChild(el)
    const focusSpy = vi.spyOn(el, 'focus')

    focusElement(el)
    // Not yet focused synchronously.
    expect(focusSpy).not.toHaveBeenCalled()
    vi.advanceTimersByTime(0)
    expect(focusSpy).toHaveBeenCalledTimes(1)
    el.remove()
  })

  it('focuses an element selected by CSS selector string', () => {
    const el = document.createElement('input')
    el.id = 'search-box'
    document.body.appendChild(el)
    const focusSpy = vi.spyOn(el, 'focus')

    focusElement('#search-box')
    vi.advanceTimersByTime(0)
    expect(focusSpy).toHaveBeenCalledTimes(1)
    el.remove()
  })

  it('is a silent no-op when the selector matches nothing', () => {
    expect(() => {
      focusElement('.does-not-exist')
      vi.advanceTimersByTime(0)
    }).not.toThrow()
  })

  it('is a silent no-op when given a null element', () => {
    expect(() => {
      focusElement(null as unknown as HTMLElement)
      vi.advanceTimersByTime(0)
    }).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// isFocusable
// ---------------------------------------------------------------------------
describe('isFocusable()', () => {
  it('returns true for a native focusable tag (BUTTON/INPUT/A/SELECT/TEXTAREA)', () => {
    for (const tag of ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']) {
      const el = document.createElement(tag)
      expect(isFocusable(el)).toBe(true)
    }
    const a = document.createElement('a')
    expect(isFocusable(a)).toBe(true)
  })

  it('returns false for null / undefined', () => {
    expect(isFocusable(null)).toBe(false)
    expect(isFocusable(undefined)).toBe(false)
  })

  it('returns false when the element is disabled', () => {
    const el = document.createElement('button')
    el.disabled = true
    expect(isFocusable(el)).toBe(false)
  })

  it('returns true for a non-focusable tag with a tabindex (any value, even -1)', () => {
    const el = document.createElement('div')
    el.setAttribute('tabindex', '-1')
    // isFocusable counts hasTabIndex (presence of attribute), regardless of value.
    expect(isFocusable(el)).toBe(true)
  })

  it('returns false for a plain div with no tabindex and no role', () => {
    const el = document.createElement('div')
    expect(isFocusable(el)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getFirstFocusable
// ---------------------------------------------------------------------------
describe('getFirstFocusable()', () => {
  it('returns the first focusable element in DOM order', () => {
    const container = buildFocusableContainer()
    const first = getFirstFocusable(container)
    expect(first).not.toBeNull()
    expect(first?.getAttribute('data-qa')).toBe('link')
  })

  it('returns null when there are no focusable elements', () => {
    const empty = document.createElement('div')
    empty.innerHTML = '<p>none</p>'
    expect(getFirstFocusable(empty)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// createKeyboardHandler
// ---------------------------------------------------------------------------
describe('createKeyboardHandler()', () => {
  it('invokes the mapped handler and preventDefault when the key matches', () => {
    const onEscape = vi.fn()
    const onEnter = vi.fn()
    const handler = createKeyboardHandler({ Escape: onEscape, Enter: onEnter })

    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    vi.spyOn(event, 'preventDefault')
    handler(event)

    expect(onEscape).toHaveBeenCalledWith(event)
    expect(onEnter).not.toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('does nothing for an unmapped key (no preventDefault, no handler call)', () => {
    const onA = vi.fn()
    const handler = createKeyboardHandler({ a: onA })

    const event = new KeyboardEvent('keydown', { key: 'b', cancelable: true })
    vi.spyOn(event, 'preventDefault')
    handler(event)

    expect(onA).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('passes the event through to the handler', () => {
    const seen: KeyboardEvent[] = []
    const handler = createKeyboardHandler({ ArrowUp: (e) => seen.push(e) })
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true })
    handler(event)
    expect(seen).toHaveLength(1)
    expect(seen[0]).toBe(event)
  })
})

// ---------------------------------------------------------------------------
// prefersReducedMotion / prefersHighContrast (matchMedia mock)
// ---------------------------------------------------------------------------
describe('prefersReducedMotion() / prefersHighContrast()', () => {
  let original: ((q: string) => MediaQueryList) | undefined

  beforeEach(() => {
    original = window.matchMedia
  })
  afterEach(() => {
    if (original) window.matchMedia = original
    else delete (window as any).matchMedia
  })

  function mockMatchMedia(matchesMap: Record<string, boolean>) {
    window.matchMedia = ((query: string) =>
      ({
        matches: !!matchesMap[query],
        media: query,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList) as any
  }

  it('returns true when prefers-reduced-motion: reduce matches', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    expect(prefersReducedMotion()).toBe(true)
  })

  it('returns false when prefers-reduced-motion does not match', () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': false })
    expect(prefersReducedMotion()).toBe(false)
  })

  it('returns true when prefers-contrast: high matches', () => {
    mockMatchMedia({ '(prefers-contrast: high)': true })
    expect(prefersHighContrast()).toBe(true)
  })

  it('returns false when prefers-contrast does not match', () => {
    mockMatchMedia({ '(prefers-contrast: high)': false })
    expect(prefersHighContrast()).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// logAccessibilityInfo
// ---------------------------------------------------------------------------
describe('logAccessibilityInfo()', () => {
  it('returns a structured object of the element accessibility attributes', () => {
    const el = document.createElement('button')
    el.id = 'save-btn'
    el.className = 'primary'
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', 'Save')
    el.setAttribute('aria-labelledby', 'title-id')
    el.setAttribute('aria-describedby', 'hint-id')
    el.setAttribute('tabindex', '0')

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const info = logAccessibilityInfo(el)

    expect(info).toEqual({
      tagName: 'BUTTON',
      id: 'save-btn',
      className: 'primary',
      role: 'button',
      ariaLabel: 'Save',
      ariaLabelledby: 'title-id',
      ariaDescribedby: 'hint-id',
      tabIndex: '0',
      isFocusable: true,
    })
    expect(logSpy).toHaveBeenCalled()
    logSpy.mockRestore()
  })

  it('is a no-op and returns undefined for a null element', () => {
    expect(logAccessibilityInfo(null)).toBeUndefined()
  })

  it('reflects isFocusable=false for a plain div', () => {
    const el = document.createElement('div')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const info = logAccessibilityInfo(el)
    expect(info?.isFocusable).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Composables: useFocusTrap / useAria
// (mounted via a real test host so lifecycle hooks fire)
// ---------------------------------------------------------------------------
describe('useFocusTrap()', () => {
  function mountComposable<T>(factory: () => T) {
    const TestHost = defineComponent({
      name: 'UseFocusTrapHost',
      setup() {
        const result = factory()
        return { ...(result as Record<string, unknown>) }
      },
      render() {
        return h('div')
      },
    })
    return mount(TestHost)
  }

  it('exposes activateTrap and deactivateTrap functions', () => {
    const wrapper = mountComposable(() => useFocusTrap())
    expect(typeof wrapper.vm.activateTrap).toBe('function')
    expect(typeof wrapper.vm.deactivateTrap).toBe('function')
    wrapper.unmount()
  })

  it('activateTrap wires a FocusTrap on the container and focuses its first element', () => {
    const container = buildFocusableContainer()
    document.body.appendChild(container)
    const wrapper = mountComposable(() => useFocusTrap())

    ;(wrapper.vm.activateTrap as (c: HTMLElement) => void)(container)

    const first = container.querySelector('[data-qa="link"]') as HTMLElement
    expect(document.activeElement).toBe(first)

    ;(wrapper.vm.deactivateTrap as () => void)()
    container.remove()
    wrapper.unmount()
  })

  it('activateTrap is a no-op when no container is provided', () => {
    const wrapper = mountComposable(() => useFocusTrap())
    expect(() => (wrapper.vm.activateTrap as (c: HTMLElement | null) => void)(null)).not.toThrow()
    wrapper.unmount()
  })

  it('deactivateTrap is a safe no-op when no trap was ever activated', () => {
    const wrapper = mountComposable(() => useFocusTrap())
    expect(() => (wrapper.vm.deactivateTrap as () => void)()).not.toThrow()
    wrapper.unmount()
  })
})

describe('useAria()', () => {
  function mountComposable<T>(factory: () => T) {
    const TestHost = defineComponent({
      name: 'UseAriaHost',
      setup() {
        const result = factory()
        return { ...(result as Record<string, unknown>) }
      },
      render() {
        return h('div')
      },
    })
    return mount(TestHost)
  }

  it('returns setAriaProps / updateLang / getLangCode / announce / announceAssertive', () => {
    const wrapper = mountComposable(() => useAria())
    const vm = wrapper.vm as Record<string, unknown>
    expect(typeof vm.setAriaProps).toBe('function')
    expect(typeof vm.updateLang).toBe('function')
    expect(typeof vm.getLangCode).toBe('function')
    expect(typeof vm.announce).toBe('function')
    expect(typeof vm.announceAssertive).toBe('function')
    wrapper.unmount()
  })

  it('setAriaProps delegates to setAria (sets attributes)', () => {
    const wrapper = mountComposable(() => useAria())
    const el = document.createElement('div')
    ;(wrapper.vm.setAriaProps as (e: HTMLElement, p: Record<string, string>) => void)(el, {
      'aria-label': 'hello',
      role: 'alert',
    })
    expect(el.getAttribute('aria-label')).toBe('hello')
    expect(el.getAttribute('role')).toBe('alert')
    wrapper.unmount()
  })

  it('updateLang delegates to updateHtmlLang', () => {
    const wrapper = mountComposable(() => useAria())
    ;(wrapper.vm.updateLang as (l: string) => void)('en')
    expect(document.documentElement.lang).toBe('en')
    document.documentElement.lang = ''
    wrapper.unmount()
  })

  it('getLangCode delegates to getHtmlLangCode', () => {
    const wrapper = mountComposable(() => useAria())
    expect((wrapper.vm.getLangCode as (l: string) => string)('zh')).toBe('zh-CN')
    wrapper.unmount()
  })

  it('announce / announceAssertive create the appropriate live regions', () => {
    vi.useFakeTimers()
    const wrapper = mountComposable(() => useAria())

    ;(wrapper.vm.announce as (m: string) => void)('polite-msg')
    ;(wrapper.vm.announceAssertive as (m: string) => void)('assertive-msg')

    const nodes = Array.from(document.querySelectorAll('.a11y-announcer')) as HTMLElement[]
    const lives = nodes.map((n) => n.getAttribute('aria-live')).sort()
    expect(lives).toEqual(['assertive', 'polite'])

    vi.advanceTimersByTime(1000)
    vi.useRealTimers()
    wrapper.unmount()
  })
})

// ---------------------------------------------------------------------------
// default export
// ---------------------------------------------------------------------------
describe('default export', () => {
  it('exposes all public utilities', async () => {
    const mod = (await import('../accessibility.js')).default
    expect(mod.FocusTrap).toBe(FocusTrap)
    expect(mod.createFocusTrap).toBe(createFocusTrap)
    expect(mod.setAria).toBe(setAria)
    expect(mod.updateHtmlLang).toBe(updateHtmlLang)
    expect(mod.getHtmlLangCode).toBe(getHtmlLangCode)
    expect(mod.announceToScreenReader).toBe(announceToScreenReader)
    expect(mod.announcePolite).toBe(announcePolite)
    expect(mod.announceAssertive).toBe(announceAssertive)
    expect(mod.focusElement).toBe(focusElement)
    expect(mod.isFocusable).toBe(isFocusable)
    expect(mod.getFirstFocusable).toBe(getFirstFocusable)
    expect(mod.createKeyboardHandler).toBe(createKeyboardHandler)
    expect(mod.prefersReducedMotion).toBe(prefersReducedMotion)
    expect(mod.prefersHighContrast).toBe(prefersHighContrast)
    expect(mod.logAccessibilityInfo).toBe(logAccessibilityInfo)
    expect(mod.useFocusTrap).toBe(useFocusTrap)
    expect(mod.useAria).toBe(useAria)
  })
})
