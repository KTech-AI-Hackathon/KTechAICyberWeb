/**
 * @file NewsFilter.test.ts
 * @description Comprehensive unit tests for NewsFilter component
 * @ticket #60 - TEST-013: News Section Component Unit Tests - TDD with Vitest
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import NewsFilter from '../NewsFilter.vue'

// Mock useLanguage composable
vi.mock('../../composables/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'news.filter': 'Filter by category',
        'news.categories.all': 'All',
        'news.categories.company': 'Company News',
        'news.categories.industry': 'Industry Insights',
        'news.categories.technology': 'Technology Updates',
        'news.categories.events': 'Events',
      }
      return translations[key] || key
    },
  }),
}))

describe('NewsFilter.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  describe('Rendering', () => {
    beforeEach(() => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
    })

    it('should mount without errors', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('renders news-filter div with correct class', () => {
      const filter = wrapper.find('.news-filter')
      expect(filter.exists()).toBe(true)
    })

    it('has region role and aria-label', () => {
      const filter = wrapper.find('.news-filter')
      expect(filter.attributes('role')).toBe('region')
      expect(filter.attributes('aria-label')).toBe('Filter by category')
    })

    it('renders buttons container with role group', () => {
      const buttonsContainer = wrapper.find('.news-filter__buttons')
      expect(buttonsContainer.exists()).toBe(true)
      expect(buttonsContainer.attributes('role')).toBe('group')
    })

    it('has heading with filter-heading id', () => {
      const heading = wrapper.find('#filter-heading')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Filter by category')
    })

    it('buttons container has aria-labelledby', () => {
      const buttonsContainer = wrapper.find('.news-filter__buttons')
      expect(buttonsContainer.attributes('aria-labelledby')).toBe('filter-heading')
    })
  })

  describe('Props', () => {
    it('accepts selectedCategory prop', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'Company News',
        },
      })
      expect(wrapper.props('selectedCategory')).toBe('Company News')
    })

    it('has default selectedCategory of All', () => {
      wrapper = mount(NewsFilter, {
        props: {},
      })
      expect(wrapper.props('selectedCategory')).toBe('All')
    })

    it('accepts empty selectedCategory', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: '',
        },
      })
      expect(wrapper.props('selectedCategory')).toBe('')
    })
  })

  describe('Category Buttons', () => {
    beforeEach(() => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
    })

    it('renders 5 category buttons', () => {
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons).toHaveLength(5)
    })

    it('displays All button first', () => {
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[0].text()).toBe('All')
    })

    it('displays Company News button', () => {
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[1].text()).toBe('Company News')
    })

    it('displays Industry Insights button', () => {
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[2].text()).toBe('Industry Insights')
    })

    it('displays Technology Updates button', () => {
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[3].text()).toBe('Technology Updates')
    })

    it('displays Events button', () => {
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[4].text()).toBe('Events')
    })
  })

  describe('Active State', () => {
    it('applies active class to selected category', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'Company News',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[1].classes()).toContain('news-filter__button--active')
    })

    it('only one button has active class at a time', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      const activeButtons = buttons.filter(b => b.classes().includes('news-filter__button--active'))
      expect(activeButtons).toHaveLength(1)
    })

    it('All is active when selectedCategory is All', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[0].classes()).toContain('news-filter__button--active')
    })

    it('removes active class when selection changes', async () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      let buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[0].classes()).toContain('news-filter__button--active')
      
      await wrapper.setProps({ selectedCategory: 'Company News' })
      buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[0].classes()).not.toContain('news-filter__button--active')
      expect(buttons[1].classes()).toContain('news-filter__button--active')
    })
  })

  describe('Button Interactions', () => {
    it('emits filter-change when button clicked', async () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      await buttons[1].trigger('click')
      expect(wrapper.emitted('filter-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')).toHaveLength(1)
    })

    it('emits correct category when Company News clicked', async () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      await buttons[1].trigger('click')
      expect(wrapper.emitted('filter-change')?.[0]).toEqual(['Company News'])
    })

    it('emits All when All button clicked', async () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'Company News',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      await buttons[0].trigger('click')
      expect(wrapper.emitted('filter-change')?.[0]).toEqual(['All'])
    })

    it('emits Industry Insights when clicked', async () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      await buttons[2].trigger('click')
      expect(wrapper.emitted('filter-change')?.[0]).toEqual(['Industry Insights'])
    })

    it('emits Technology Updates when clicked', async () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      await buttons[3].trigger('click')
      expect(wrapper.emitted('filter-change')?.[0]).toEqual(['Technology Updates'])
    })

    it('emits Events when clicked', async () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      await buttons[4].trigger('click')
      expect(wrapper.emitted('filter-change')?.[0]).toEqual(['Events'])
    })
  })

  describe('Styling', () => {
    beforeEach(() => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
    })

    it('applies correct CSS classes to filter container', () => {
      const filter = wrapper.find('.news-filter')
      expect(filter.classes()).toContain('news-filter')
    })

    it('applies correct CSS classes to buttons container', () => {
      const buttonsContainer = wrapper.find('.news-filter__buttons')
      expect(buttonsContainer.classes()).toContain('news-filter__buttons')
    })

    it('applies correct CSS classes to buttons', () => {
      const buttons = wrapper.findAll('.news-filter__button')
      buttons.forEach(button => {
        expect(button.classes()).toContain('news-filter__button')
      })
    })

    it('active button has active class', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'Company News',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[1].classes()).toContain('news-filter__button--active')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
    })

    it('has screen reader only heading', () => {
      const heading = wrapper.find('.sr-only')
      expect(heading.exists()).toBe(true)
      expect(heading.attributes('id')).toBe('filter-heading')
    })

    it('region has aria-label', () => {
      const filter = wrapper.find('.news-filter')
      expect(filter.attributes('aria-label')).toBe('Filter by category')
    })

    it('buttons group has role and aria-labelledby', () => {
      const buttonsContainer = wrapper.find('.news-filter__buttons')
      expect(buttonsContainer.attributes('role')).toBe('group')
      expect(buttonsContainer.attributes('aria-labelledby')).toBe('filter-heading')
    })

    it('each button has aria-label', () => {
      const buttons = wrapper.findAll('.news-filter__button')
      buttons.forEach(button => {
        expect(button.attributes('aria-label')).toBeTruthy()
      })
    })

    it('each button has aria-pressed', () => {
      const buttons = wrapper.findAll('.news-filter__button')
      buttons.forEach(button => {
        expect(button.attributes('aria-pressed')).toBeDefined()
      })
    })

    it('active button has aria-pressed true', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'Company News',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[1].attributes('aria-pressed')).toBe('true')
    })

    it('inactive buttons have aria-pressed false', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'Company News',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[0].attributes('aria-pressed')).toBe('false')
      expect(buttons[2].attributes('aria-pressed')).toBe('false')
    })

    it('aria-pressed updates when selection changes', async () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      let buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[0].attributes('aria-pressed')).toBe('true')
      
      await wrapper.setProps({ selectedCategory: 'Company News' })
      buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[0].attributes('aria-pressed')).toBe('false')
      expect(buttons[1].attributes('aria-pressed')).toBe('true')
    })
  })

  describe('Internationalization', () => {
    it('translates filter label', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const filter = wrapper.find('.news-filter')
      expect(filter.attributes('aria-label')).toBe('Filter by category')
    })

    it('translates All category', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[0].text()).toBe('All')
    })

    it('translates Company News category', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[1].text()).toBe('Company News')
    })

    it('translates Industry Insights category', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[2].text()).toBe('Industry Insights')
    })

    it('translates Technology Updates category', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[3].text()).toBe('Technology Updates')
    })

    it('translates Events category', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons[4].text()).toBe('Events')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined selectedCategory gracefully', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: undefined as any,
        },
      })
      expect(wrapper.exists()).toBe(true)
      const buttons = wrapper.findAll('.news-filter__button')
      expect(buttons).toHaveLength(5)
    })

    it('handles non-existent selectedCategory', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'NonExistent Category',
        },
      })
      const buttons = wrapper.findAll('.news-filter__button--active')
      expect(buttons).toHaveLength(0)
    })

    it('can be mounted and unmounted multiple times', () => {
      const wrappers = [
        mount(NewsFilter, { props: { selectedCategory: 'All' } }),
        mount(NewsFilter, { props: { selectedCategory: 'All' } }),
        mount(NewsFilter, { props: { selectedCategory: 'All' } }),
      ]
      wrappers.forEach(w => expect(w.exists()).toBe(true))
      wrappers.forEach(w => w.unmount())
    })

    it('handles rapid prop changes', async () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const categories = ['All', 'Company News', 'Industry Insights', 'Technology Updates', 'Events', 'All']
      for (const category of categories) {
        await wrapper.setProps({ selectedCategory: category })
      }
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    beforeEach(() => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
    })

    it('has correct DOM hierarchy', () => {
      const filter = wrapper.find('.news-filter')
      const buttonsContainer = filter.find('.news-filter__buttons')
      const heading = filter.find('.sr-only')
      expect(filter.exists()).toBe(true)
      expect(buttonsContainer.exists()).toBe(true)
      expect(heading.exists()).toBe(true)
    })

    it('all buttons are direct children of buttons container', () => {
      const buttonsContainer = wrapper.find('.news-filter__buttons')
      const buttons = buttonsContainer.findAll('.news-filter__button')
      expect(buttons).toHaveLength(5)
    })
  })

  describe('Computed Properties', () => {
    it('categories returns correct array', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      const categories = wrapper.vm.categories
      expect(categories).toHaveLength(5)
      expect(categories[0]).toEqual({ key: 'All', label: 'All' })
      expect(categories[1]).toEqual({ key: 'Company News', label: 'Company News' })
    })

    it('isSelected returns true for selected category', () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'Company News',
        },
      })
      expect(wrapper.vm.isSelected('Company News')).toBe(true)
      expect(wrapper.vm.isSelected('All')).toBe(false)
    })
  })

  describe('Methods', () => {
    it('selectCategory emits filter-change event', async () => {
      wrapper = mount(NewsFilter, {
        props: {
          selectedCategory: 'All',
        },
      })
      await wrapper.vm.selectCategory('Industry Insights')
      expect(wrapper.emitted('filter-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')?.[0]).toEqual(['Industry Insights'])
    })
  })
})
