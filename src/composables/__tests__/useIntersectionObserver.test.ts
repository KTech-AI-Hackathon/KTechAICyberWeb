/**
 * @file useIntersectionObserver.test.ts
 * @description Unit tests for useIntersectionObserver + useIntersectionObserverList composables.
 *
 * Coverage-hardening pass. The composables construct a real IntersectionObserver,
 * so the global is replaced with a controllable mock that records every instance
 * and lets the test fire intersection callbacks deterministically. The "not
 * supported" path is exercised by un-stubbing the global (removing it entirely).
 *
 * The composables are imported statically so they're available synchronously
 * inside setup(); onMounted / onUnmounted then fire via @vue/test-utils exactly
 * as in production. No internals are mutated.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

import {
  useIntersectionObserver,
  useIntersectionObserverList,
} from '../useIntersectionObserver.js'

// ---------------------------------------------------------------------------
// IntersectionObserver mock
// ---------------------------------------------------------------------------
// Each `new IntersectionObserver(cb, opts)` call pushes a controller here so a
// test can fire the callback and assert observe/unobserve/disconnect behavior.
interface ObserverController {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit
  observe: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  takeRecords: ReturnType<typeof vi.fn>
}

const instances: ObserverController[] = []

function lastObserver(): ObserverController {
  return instances[instances.length - 1]
}

// happy-dom ships a real IntersectionObserver, so the "unsupported" path must
// be exercised by fully deleting the property (unstubAllGlobals would restore
// the native impl). We snapshot and restore it to keep tests hermetic.
function removeIntersectionObserver(): { restore: () => void } {
  const w = window as unknown as Record<string, unknown>
  const saved = Object.prototype.hasOwnProperty.call(w, 'IntersectionObserver')
    ? w.IntersectionObserver
    : undefined
  // unset both own property and any prototype chain hit so `'IntersectionObserver' in window` is false.
  try {
    delete w.IntersectionObserver
  } catch {
    /* ignore */
  }
  return {
    restore: () => {
      if (saved !== undefined) w.IntersectionObserver = saved
    },
  }
}

class FakeIntersectionObserver {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
  root = null
  rootMargin = ''
  thresholds: number[] = []

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback
    this.options = options
    instances.push({
      callback,
      options,
      observe: this.observe,
      unobserve: this.unobserve,
      disconnect: this.disconnect,
      takeRecords: this.takeRecords,
    })
  }
}

// Build an entry-like object acceptable to the callback signature.
function makeEntry(target: Element, isIntersecting: boolean): IntersectionObserverEntry {
  return {
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    intersectionRect: {} as DOMRectReadOnly,
    boundingClientRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: 0,
  } as IntersectionObserverEntry
}

// ---------------------------------------------------------------------------
// Test host helper
// ---------------------------------------------------------------------------
function mountComposable<T>(factory: () => T) {
  const TestHost = defineComponent({
    name: 'IntersectionObserverHost',
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

type VM = Record<string, any>

// ---------------------------------------------------------------------------
// Tests — useIntersectionObserver
// ---------------------------------------------------------------------------
describe('useIntersectionObserver()', () => {
  beforeEach(() => {
    instances.length = 0
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    instances.length = 0
  })

  describe('initial state', () => {
    it('exposes isVisible=false and observe/unobserve functions', () => {
      const wrapper = mountComposable(() => useIntersectionObserver())
      const vm = wrapper.vm as VM
      expect(vm.isVisible).toBe(false)
      expect(typeof vm.observe).toBe('function')
      expect(typeof vm.unobserve).toBe('function')
      wrapper.unmount()
    })
  })

  describe('observe(element)', () => {
    it('creates an IntersectionObserver and calls observe() on the element', () => {
      const wrapper = mountComposable(() => useIntersectionObserver())
      const vm = wrapper.vm as VM
      const el = document.createElement('div')

      vm.observe(el)

      expect(instances).toHaveLength(1)
      const obs = lastObserver()
      expect(obs.observe).toHaveBeenCalledWith(el)
      // Internally the target ref is captured so the callback can unobserve it.
      // We verify that contract by firing an intersection event below and
      // asserting the same element gets unobserved.
      obs.callback([makeEntry(el, true)], obs as any)
      expect(obs.unobserve).toHaveBeenCalledWith(el)
      wrapper.unmount()
    })

    it('forwards merged options (defaults overridden by caller) to the observer', () => {
      const wrapper = mountComposable(() =>
        useIntersectionObserver({ rootMargin: '20px', threshold: 0.5 }),
      )
      const vm = wrapper.vm as VM
      vm.observe(document.createElement('div'))

      const obs = lastObserver()
      // caller options win/extend the defaults
      expect(obs.options).toMatchObject({ rootMargin: '20px', threshold: 0.5 })
      wrapper.unmount()
    })

    it('does NOT create an observer when called with no element', () => {
      const wrapper = mountComposable(() => useIntersectionObserver())
      const vm = wrapper.vm as VM

      vm.observe(null)
      expect(instances).toHaveLength(0)
      expect(vm.isVisible).toBe(false)
      wrapper.unmount()
    })

    it('sets isVisible=true immediately when IntersectionObserver is not supported', () => {
      // happy-dom ships a native IntersectionObserver; the `'IntersectionObserver' in window`
      // guard fails only once we delete the property. observe() then short-circuits to isVisible=true.
      vi.unstubAllGlobals()
      const io = removeIntersectionObserver()
      try {
        const wrapper = mountComposable(() => useIntersectionObserver())
        const vm = wrapper.vm as VM

        vm.observe(document.createElement('div'))
        expect(vm.isVisible).toBe(true)
        wrapper.unmount()
      } finally {
        io.restore()
      }
    })
  })

  describe('intersection callback', () => {
    it('sets isVisible=true when the target intersects and unobserves it', () => {
      const wrapper = mountComposable(() => useIntersectionObserver())
      const vm = wrapper.vm as VM
      const el = document.createElement('div')

      vm.observe(el)
      const obs = lastObserver()

      obs.callback([makeEntry(el, true)], obs as any)

      expect(vm.isVisible).toBe(true)
      // First intersection should also unobserve the target (lazy-load semantics).
      expect(obs.unobserve).toHaveBeenCalledWith(el)
      wrapper.unmount()
    })

    it('leaves isVisible=false when the entry is not intersecting', () => {
      const wrapper = mountComposable(() => useIntersectionObserver())
      const vm = wrapper.vm as VM
      const el = document.createElement('div')

      vm.observe(el)
      const obs = lastObserver()

      obs.callback([makeEntry(el, false)], obs as any)
      expect(vm.isVisible).toBe(false)
      expect(obs.unobserve).not.toHaveBeenCalled()
      wrapper.unmount()
    })

    it('handles multiple entries in a single callback (any intersecting wins)', () => {
      const wrapper = mountComposable(() => useIntersectionObserver())
      const vm = wrapper.vm as VM
      const el = document.createElement('div')

      vm.observe(el)
      const obs = lastObserver()

      obs.callback([makeEntry(el, false), makeEntry(el, true)], obs as any)
      expect(vm.isVisible).toBe(true)
      wrapper.unmount()
    })
  })

  describe('unobserve()', () => {
    it('disconnects and nulls the observer when an observer exists', () => {
      const wrapper = mountComposable(() => useIntersectionObserver())
      const vm = wrapper.vm as VM
      const el = document.createElement('div')

      vm.observe(el)
      const obs = lastObserver()

      vm.unobserve()
      expect(obs.unobserve).toHaveBeenCalledWith(el)
      expect(obs.disconnect).toHaveBeenCalled()
      wrapper.unmount()
    })

    it('is a safe no-op when no observer has been created', () => {
      const wrapper = mountComposable(() => useIntersectionObserver())
      const vm = wrapper.vm as VM
      expect(() => vm.unobserve()).not.toThrow()
      wrapper.unmount()
    })
  })

  describe('lifecycle cleanup', () => {
    it('disconnects the observer on unmount', () => {
      const wrapper = mountComposable(() => useIntersectionObserver())
      const vm = wrapper.vm as VM
      const el = document.createElement('div')
      vm.observe(el)
      const obs = lastObserver()

      wrapper.unmount()
      expect(obs.disconnect).toHaveBeenCalled()
    })

    it('does not throw on unmount if no observer was set up', () => {
      const wrapper = mountComposable(() => useIntersectionObserver())
      expect(() => wrapper.unmount()).not.toThrow()
    })
  })
})

// ---------------------------------------------------------------------------
// Tests — useIntersectionObserverList
// ---------------------------------------------------------------------------
describe('useIntersectionObserverList()', () => {
  beforeEach(() => {
    instances.length = 0
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    instances.length = 0
  })

  describe('initial state', () => {
    it('exposes a visibleItems Set and observeItem/unobserveAll functions', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      const vm = wrapper.vm as VM
      expect(vm.visibleItems).toBeInstanceOf(Set)
      expect(vm.visibleItems.size).toBe(0)
      expect(typeof vm.observeItem).toBe('function')
      expect(typeof vm.unobserveAll).toBe('function')
      wrapper.unmount()
    })
  })

  describe('observeItem(element, index)', () => {
    it('creates one observer per item and calls observe() on the element', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      const vm = wrapper.vm as VM
      const a = document.createElement('div')
      const b = document.createElement('div')

      vm.observeItem(a, 0)
      vm.observeItem(b, 2)

      expect(instances).toHaveLength(2)
      expect(instances[0].observe).toHaveBeenCalledWith(a)
      expect(instances[1].observe).toHaveBeenCalledWith(b)
      // index is stashed on the element dataset for later lookup
      expect(a.dataset.index).toBe('0')
      expect(b.dataset.index).toBe('2')
      wrapper.unmount()
    })

    it('passes merged options (default rootMargin 50px) to the observer', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      const vm = wrapper.vm as VM
      vm.observeItem(document.createElement('div'), 0)

      expect(lastObserver().options).toMatchObject({ rootMargin: '50px', threshold: 0.1 })
      wrapper.unmount()
    })

    it('does NOT create an observer when called with no element', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      const vm = wrapper.vm as VM

      vm.observeItem(null, 0)
      expect(instances).toHaveLength(0)
      expect(vm.visibleItems.size).toBe(0)
      wrapper.unmount()
    })

    it('adds the index directly when IntersectionObserver is not supported', () => {
      vi.unstubAllGlobals()
      const io = removeIntersectionObserver()
      try {
        const wrapper = mountComposable(() => useIntersectionObserverList())
        const vm = wrapper.vm as VM

        vm.observeItem(document.createElement('div'), 5)
        expect(vm.visibleItems.has(5)).toBe(true)
        wrapper.unmount()
      } finally {
        io.restore()
      }
    })
  })

  describe('intersection callback', () => {
    it('adds the index to visibleItems when an item intersects and unobserves it', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      const vm = wrapper.vm as VM
      const el = document.createElement('div')
      vm.observeItem(el, 3)

      const obs = lastObserver()
      obs.callback([makeEntry(el, true)], obs as any)

      expect(vm.visibleItems.has(3)).toBe(true)
      expect(obs.unobserve).toHaveBeenCalledWith(el)
      wrapper.unmount()
    })

    it('parses the index via dataset (numeric conversion, not the raw string)', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      const vm = wrapper.vm as VM
      const el = document.createElement('div')
      vm.observeItem(el, 7)
      const obs = lastObserver()

      // dataset.index is the string "7"; the callback must parseInt it before adding.
      obs.callback([makeEntry(el, true)], obs as any)
      expect(vm.visibleItems.has(7)).toBe(true)
      // a string-typed membership check must NOT pass (it is parsed as a number)
      expect((vm.visibleItems as Set<unknown>).has('7' as unknown)).toBe(false)
      wrapper.unmount()
    })

    it('ignores entries that are not intersecting', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      const vm = wrapper.vm as VM
      const el = document.createElement('div')
      vm.observeItem(el, 4)
      const obs = lastObserver()

      obs.callback([makeEntry(el, false)], obs as any)
      expect(vm.visibleItems.size).toBe(0)
      expect(obs.unobserve).not.toHaveBeenCalled()
      wrapper.unmount()
    })
  })

  describe('unobserveAll()', () => {
    it('disconnects every observer created via observeItem', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      const vm = wrapper.vm as VM

      vm.observeItem(document.createElement('div'), 0)
      vm.observeItem(document.createElement('div'), 1)
      vm.observeItem(document.createElement('div'), 2)
      expect(instances).toHaveLength(3)

      vm.unobserveAll()
      instances.forEach((inst) => {
        expect(inst.disconnect).toHaveBeenCalled()
      })
      wrapper.unmount()
    })

    it('is a safe no-op when nothing has been observed', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      const vm = wrapper.vm as VM
      expect(() => vm.unobserveAll()).not.toThrow()
      wrapper.unmount()
    })
  })

  describe('lifecycle cleanup', () => {
    it('disconnects all observers on unmount', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      const vm = wrapper.vm as VM
      vm.observeItem(document.createElement('div'), 0)
      vm.observeItem(document.createElement('div'), 1)
      const captured = [...instances]

      wrapper.unmount()
      captured.forEach((inst) => expect(inst.disconnect).toHaveBeenCalled())
    })

    it('does not throw on unmount when no items were observed', () => {
      const wrapper = mountComposable(() => useIntersectionObserverList())
      expect(() => wrapper.unmount()).not.toThrow()
    })
  })
})
