/**
 * @file PipelineCard.test.ts
 * @description Unit tests for PipelineCard (#203, a11y revision #225).
 * @ticket #225 - desktop Lighthouse a11y: resolve `aria-allowed-role`.
 *
 * The card's root host was originally an <article role="listitem">, which is
 * an ARIA role incompatible with <article>'s implicit `article` role —
 * Lighthouse flags it as `aria-allowed-role`. The fix is to swap the host tag
 * to native <li> (implicit role `listitem`, so the explicit role is allowed
 * and redundant) while keeping every binding, class, and the role attribute.
 *
 * Drives the REAL component with the REAL useLanguage. Asserts user-visible
 * DOM (tagName + attributes + classes), not internals.
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import PipelineCard from '../selfdriving/PipelineCard.vue'

describe('PipelineCard', () => {
  it('mounts a native <li> root (NOT <article>) so role="listitem" is allowed', () => {
    const wrapper = mount(PipelineCard, {
      props: { phase: 'intake' },
    })
    const root = wrapper.find('.pipeline-card')
    expect(root.exists()).toBe(true)
    // Host tag must be native <li>: its implicit role is `listitem`, so the
    // explicit role="listitem" is allowed-by-implicit-role and Lighthouse's
    // `aria-allowed-role` audit passes. <article> was rejected because its
    // implicit role (`article`) is incompatible with `listitem`.
    expect(root.element.tagName.toLowerCase()).toBe('li')
  })

  it('keeps role="listitem" so the parent role="list" SR contract is preserved', () => {
    const wrapper = mount(PipelineCard, {
      props: { phase: 'planner' },
    })
    const root = wrapper.find('.pipeline-card')
    expect(root.attributes('role')).toBe('listitem')
  })

  it('keeps the pipeline-card class + data-phase binding (no styling/data-viz regression)', () => {
    const wrapper = mount(PipelineCard, {
      props: { phase: 'coder', isCurrent: true },
    })
    const root = wrapper.find('.pipeline-card')
    expect(root.classes()).toContain('pipeline-card')
    expect(root.attributes('data-phase')).toBe('coder')
    expect(root.attributes('data-current')).toBe('true')
  })
})
