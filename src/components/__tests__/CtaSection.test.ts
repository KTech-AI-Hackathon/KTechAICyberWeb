/**
 * @file CtaSection.test.ts
 * @description Comprehensive unit tests for CtaSection component
 * @ticket #78 - TEST-018: CTA Section Component Unit Tests - TDD with Vitest
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { useRouter } from 'vue-router'
import CtaSection from '../CtaSection.vue'
import RouterLinkStub from './RouterLinkStub.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}))

describe('CtaSection.vue', () => {
  let wrapper: VueWrapper
  let mockRouter: any

  const defaultProps = {
    title: 'Ready to Get Started?',
    description: 'Join thousands of companies transforming their business.',
    buttonText: 'Get Started',
    buttonLink: '/contact',
    ariaLabel: 'Get started with KTech AI',
    variant: 'primary'
  }

  beforeEach(() => {
    mockRouter = { push: vi.fn(), resolve: vi.fn() }
    ;(useRouter as any).mockReturnValue(mockRouter)
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  describe('Rendering', () => {
    beforeEach(() => {
      wrapper = mount(CtaSection, {
        props: defaultProps,
        global: { components: { RouterLink: RouterLinkStub } },
      })
    })

    it('should mount without errors', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('renders section with correct class', () => {
      const section = wrapper.find('.cta-section')
      expect(section.exists()).toBe(true)
    })

    it('has background element for styling', () => {
      const background = wrapper.find('.cta-background')
      expect(background.exists()).toBe(true)
      expect(background.attributes('aria-hidden')).toBe('true')
    })

    it('has content wrapper div', () => {
      const content = wrapper.find('.cta-content')
      expect(content.exists()).toBe(true)
    })

    it('has primary variant class by default', () => {
      const section = wrapper.find('.cta-section')
      expect(section.classes()).toContain('cta-section--primary')
    })
  })

  describe('Props', () => {
    it('accepts title prop', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, title: 'Custom Title' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('title')).toBe('Custom Title')
    })

    it('accepts description prop', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, description: 'Custom Description' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('description')).toBe('Custom Description')
    })

    it('accepts buttonText prop', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, buttonText: 'Click Me' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('buttonText')).toBe('Click Me')
    })

    it('accepts buttonLink prop', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, buttonLink: '/test-link' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('buttonLink')).toBe('/test-link')
    })

    it('accepts ariaLabel prop', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, ariaLabel: 'Custom ARIA Label' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('ariaLabel')).toBe('Custom ARIA Label')
    })

    it('accepts variant prop with primary', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, variant: 'primary' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('variant')).toBe('primary')
    })

    it('accepts variant prop with secondary', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, variant: 'secondary' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('variant')).toBe('secondary')
    })

    it('accepts variant prop with accent', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, variant: 'accent' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('variant')).toBe('accent')
    })

    it('has default values for optional props', () => {
      wrapper = mount(CtaSection, {
        props: { title: 'Test Title' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('description')).toBe('')
      expect(wrapper.props('buttonText')).toBe('Get Started')
      expect(wrapper.props('buttonLink')).toBe('')
      expect(wrapper.props('variant')).toBe('primary')
    })

    it('accepts secondaryLink and secondaryText props', () => {
      wrapper = mount(CtaSection, {
        props: {
          ...defaultProps,
          secondaryLink: '/learn-more',
          secondaryText: 'Learn More'
        },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('secondaryLink')).toBe('/learn-more')
      expect(wrapper.props('secondaryText')).toBe('Learn More')
    })

    it('accepts secondaryAriaLabel prop', () => {
      wrapper = mount(CtaSection, {
        props: {
          ...defaultProps,
          secondaryLink: '/learn-more',
          secondaryText: 'Learn More',
          secondaryAriaLabel: 'Learn more about our services'
        },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      expect(wrapper.props('secondaryAriaLabel')).toBe('Learn more about our services')
    })
  })

  describe('Content Display', () => {
    beforeEach(() => {
      wrapper = mount(CtaSection, {
        props: defaultProps,
        global: { components: { RouterLink: RouterLinkStub } },
      })
    })

    it('displays title text', () => {
      const title = wrapper.find('.cta-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Ready to Get Started?')
    })

    it('displays description when provided', () => {
      const description = wrapper.find('.cta-description')
      expect(description.exists()).toBe(true)
      expect(description.text()).toBe('Join thousands of companies transforming their business.')
    })

    it('displays button text', () => {
      const buttonText = wrapper.find('.cta-button-text')
      expect(buttonText.exists()).toBe(true)
      expect(buttonText.text()).toBe('Get Started')
    })

    it('displays arrow icon', () => {
      const icon = wrapper.find('.cta-button-icon')
      expect(icon.exists()).toBe(true)
      expect(icon.text()).toBe('→')
      expect(icon.attributes('aria-hidden')).toBe('true')
    })

    it('hides description when not provided', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, description: '' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const description = wrapper.find('.cta-description')
      expect(description.exists()).toBe(false)
    })
  })

  describe('Button Behavior', () => {
    it('uses router-link when buttonLink is provided', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, buttonLink: '/contact' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const link = wrapper.findComponent(RouterLinkStub)
      expect(link.exists()).toBe(true)
      expect(link.props('to')).toBe('/contact')
    })

    it('uses button element when buttonLink is empty', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, buttonLink: '' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const button = wrapper.find('button.cta-button')
      expect(button.exists()).toBe(true)
    })

    it('emits click event when button is clicked without link', async () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, buttonLink: '' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const button = wrapper.find('button.cta-button')
      await button.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('does not emit click event when using router-link', async () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, buttonLink: '/contact' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const link = wrapper.findComponent(RouterLinkStub)
      await link.trigger('click')
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('has aria-label on button', () => {
      wrapper = mount(CtaSection, {
        props: defaultProps,
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const button = wrapper.find('.cta-button')
      expect(button.attributes('aria-label')).toBe('Get started with KTech AI')
    })
  })

  describe('Variant Styling', () => {
    it('applies primary variant class', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, variant: 'primary' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const section = wrapper.find('.cta-section')
      const button = wrapper.find('.cta-button')
      expect(section.classes()).toContain('cta-section--primary')
      expect(button.classes()).toContain('cta-button--primary')
    })

    it('applies secondary variant class', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, variant: 'secondary' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const section = wrapper.find('.cta-section')
      const button = wrapper.find('.cta-button')
      expect(section.classes()).toContain('cta-section--secondary')
      expect(button.classes()).toContain('cta-button--secondary')
    })

    it('applies accent variant class', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, variant: 'accent' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const section = wrapper.find('.cta-section')
      const button = wrapper.find('.cta-button')
      expect(section.classes()).toContain('cta-section--accent')
      expect(button.classes()).toContain('cta-button--accent')
    })
  })

  describe('Secondary Link', () => {
    it('renders secondary link when props are provided', () => {
      wrapper = mount(CtaSection, {
        props: {
          ...defaultProps,
          secondaryLink: '/learn-more',
          secondaryText: 'Learn More'
        },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const secondary = wrapper.find('.cta-secondary')
      expect(secondary.exists()).toBe(true)
      expect(secondary.text()).toBe('Learn More')
    })

    it('does not render secondary link when props are missing', () => {
      wrapper = mount(CtaSection, {
        props: defaultProps,
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const secondary = wrapper.find('.cta-secondary')
      expect(secondary.exists()).toBe(false)
    })

    it('has correct href on secondary link', () => {
      wrapper = mount(CtaSection, {
        props: {
          ...defaultProps,
          secondaryLink: '/learn-more',
          secondaryText: 'Learn More'
        },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const secondary = wrapper.find('.cta-secondary')
      expect(secondary.attributes('href')).toBe('/learn-more')
    })

    it('has aria-label on secondary link', () => {
      wrapper = mount(CtaSection, {
        props: {
          ...defaultProps,
          secondaryLink: '/learn-more',
          secondaryText: 'Learn More',
          secondaryAriaLabel: 'Learn more about our services'
        },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const secondary = wrapper.find('.cta-secondary')
      expect(secondary.attributes('aria-label')).toBe('Learn more about our services')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      wrapper = mount(CtaSection, {
        props: defaultProps,
        global: { components: { RouterLink: RouterLinkStub } },
      })
    })

    it('uses semantic section element', () => {
      const section = wrapper.find('section.cta-section')
      expect(section.exists()).toBe(true)
      expect(section.element.tagName.toLowerCase()).toBe('section')
    })

    it('has proper heading hierarchy with h2', () => {
      const title = wrapper.find('.cta-title')
      expect(title.element.tagName.toLowerCase()).toBe('h2')
    })

    it('button has aria-label for screen readers', () => {
      const button = wrapper.find('.cta-button')
      expect(button.attributes('aria-label')).toBe('Get started with KTech AI')
    })

    it('arrow icon has aria-hidden to hide from screen readers', () => {
      const icon = wrapper.find('.cta-button-icon')
      expect(icon.attributes('aria-hidden')).toBe('true')
    })

    it('background element has aria-hidden', () => {
      const background = wrapper.find('.cta-background')
      expect(background.attributes('aria-hidden')).toBe('true')
    })

    it('secondary link has aria-label when provided', () => {
      wrapper = mount(CtaSection, {
        props: {
          ...defaultProps,
          secondaryLink: '/learn-more',
          secondaryText: 'Learn More',
          secondaryAriaLabel: 'Learn more about our services'
        },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const secondary = wrapper.find('.cta-secondary')
      expect(secondary.attributes('aria-label')).toBe('Learn more about our services')
    })
  })

  describe('Cyberpunk Styling', () => {
    beforeEach(() => {
      wrapper = mount(CtaSection, {
        props: defaultProps,
        global: { components: { RouterLink: RouterLinkStub } },
      })
    })

    it('has correct CSS class on section element', () => {
      const section = wrapper.find('.cta-section')
      expect(section.classes()).toContain('cta-section')
    })

    it('has correct CSS class on content wrapper', () => {
      const content = wrapper.find('.cta-content')
      expect(content.classes()).toContain('cta-content')
    })

    it('has correct CSS class on title', () => {
      const title = wrapper.find('.cta-title')
      expect(title.classes()).toContain('cta-title')
    })

    it('has correct CSS class on description', () => {
      const description = wrapper.find('.cta-description')
      expect(description.classes()).toContain('cta-description')
    })

    it('has correct CSS class on actions wrapper', () => {
      const actions = wrapper.find('.cta-actions')
      expect(actions.classes()).toContain('cta-actions')
    })

    it('has correct CSS class on button', () => {
      const button = wrapper.find('.cta-button')
      expect(button.classes()).toContain('cta-button')
    })

    it('has correct CSS class on button text', () => {
      const buttonText = wrapper.find('.cta-button-text')
      expect(buttonText.classes()).toContain('cta-button-text')
    })

    it('has correct CSS class on button icon', () => {
      const icon = wrapper.find('.cta-button-icon')
      expect(icon.classes()).toContain('cta-button-icon')
    })
  })

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      wrapper = mount(CtaSection, {
        props: defaultProps,
        global: { components: { RouterLink: RouterLinkStub } },
      })
    })

    it('maintains proper structure for responsive layouts', () => {
      const content = wrapper.find('.cta-content')
      const actions = wrapper.find('.cta-actions')
      expect(content.exists()).toBe(true)
      expect(actions.exists()).toBe(true)
    })

    it('has flex layout for actions', () => {
      const actions = wrapper.find('.cta-actions')
      expect(actions.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty title gracefully', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, title: '' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const title = wrapper.find('.cta-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('')
    })

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(200)
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, title: longTitle },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const title = wrapper.find('.cta-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe(longTitle)
    })

    it('handles very long description', () => {
      const longDescription = 'B'.repeat(500)
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, description: longDescription },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const description = wrapper.find('.cta-description')
      expect(description.exists()).toBe(true)
      expect(description.text()).toBe(longDescription)
    })

    it('handles special characters in title', () => {
      const specialTitle = 'Test: "Special" & <Characters>'
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, title: specialTitle },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const title = wrapper.find('.cta-title')
      expect(title.text()).toBe(specialTitle)
    })

    it('handles special characters in button text', () => {
      const specialText = 'Click: "Here" & <Now>'
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, buttonText: specialText },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const buttonText = wrapper.find('.cta-button-text')
      expect(buttonText.text()).toBe(specialText)
    })

    it('handles undefined buttonLink gracefully', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, buttonLink: undefined },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const button = wrapper.find('button.cta-button')
      expect(button.exists()).toBe(true)
    })

    it('can be mounted and unmounted multiple times', () => {
      const wrappers = [
        mount(CtaSection, {
          props: defaultProps,
          global: { components: { RouterLink: RouterLinkStub } },
        }),
        mount(CtaSection, {
          props: defaultProps,
          global: { components: { RouterLink: RouterLinkStub } },
        }),
      ]
      wrappers.forEach(w => expect(w.exists()).toBe(true))
      wrappers.forEach(w => w.unmount())
    })
  })

  describe('Component Structure', () => {
    beforeEach(() => {
      wrapper = mount(CtaSection, {
        props: defaultProps,
        global: { components: { RouterLink: RouterLinkStub } },
      })
    })

    it('has correct DOM hierarchy', () => {
      const section = wrapper.find('.cta-section')
      const background = section.find('.cta-background')
      const content = section.find('.cta-content')
      expect(section.exists()).toBe(true)
      expect(background.exists()).toBe(true)
      expect(content.exists()).toBe(true)
    })

    it('all major sections are present', () => {
      const section = wrapper.find('.cta-section')
      const background = wrapper.find('.cta-background')
      const content = wrapper.find('.cta-content')
      const title = wrapper.find('.cta-title')
      const description = wrapper.find('.cta-description')
      const actions = wrapper.find('.cta-actions')
      const button = wrapper.find('.cta-button')
      expect(section.exists()).toBe(true)
      expect(background.exists()).toBe(true)
      expect(content.exists()).toBe(true)
      expect(title.exists()).toBe(true)
      expect(description.exists()).toBe(true)
      expect(actions.exists()).toBe(true)
      expect(button.exists()).toBe(true)
    })
  })

  describe('Component Integration', () => {
    it('works with router navigation', () => {
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, buttonLink: '/services' },
        global: { components: { RouterLink: RouterLinkStub } },
      })
      const link = wrapper.findComponent(RouterLinkStub)
      expect(link.props('to')).toBe('/services')
    })

    it('supports custom click handlers', async () => {
      const onClick = vi.fn()
      wrapper = mount(CtaSection, {
        props: { ...defaultProps, buttonLink: '' },
        global: { components: { RouterLink: RouterLinkStub } },
        attrs: { onClick }
      })
      const button = wrapper.find('button.cta-button')
      await button.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })
})
