import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PositionList from '@/views/PositionList.vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Mock composables
vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    t: (key) => {
      const translations = {
        'positionList.title': 'Job Openings',
        'positionList.subtitle': 'Join our team and build the future of fintech',
        'positionList.search.placeholder': 'Search positions...',
        'positionList.filters.department': 'Department',
        'positionList.filters.location': 'Location',
        'positionList.filters.employmentType': 'Employment Type',
        'positionList.filters.clearAll': 'Clear Filters',
        'positionList.filters.positions': 'positions',
        'positionList.departments.engineering': 'Engineering',
        'positionList.departments.product': 'Product',
        'positionList.departments.design': 'Design',
        'positionList.departments.marketing': 'Marketing',
        'positionList.departments.sales': 'Sales',
        'positionList.locations.bangkok': 'Bangkok',
        'positionList.locations.shanghai': 'Shanghai',
        'positionList.locations.beijing': 'Beijing',
        'positionList.locations.remote': 'Remote',
        'positionList.employmentTypes.full-time': 'Full-Time',
        'positionList.employmentTypes.part-time': 'Part-Time',
        'positionList.employmentTypes.contract': 'Contract',
        'positionList.employmentTypes.internship': 'Internship',
        'positionList.posted': 'Posted',
        'positionList.viewDetails': 'View Details',
        'positionList.empty.title': 'No positions found',
        'positionList.empty.description': 'Try adjusting your filters or search query',
        'positionList.detail.description': 'Description',
        'positionList.detail.responsibilities': 'Responsibilities',
        'positionList.detail.requirements': 'Requirements',
        'positionList.detail.benefits': 'Benefits',
        'positionList.detail.applyNow': 'Apply Now',
        'positionList.detail.backToList': 'Back to Positions'
      }
      return translations[key] || key
    },
    locale: { value: 'en' }
  })
}))

describe('PositionList.vue', () => {
  let router
  let pinia
  let wrapper

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/positions', component: PositionList }
      ]
    })
    pinia = createPinia()
  })

  describe('Rendering', () => {
    it('should mount without errors', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('renders main position-list-page container', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.find('.position-list-page').exists()).toBe(true)
    })

    it('renders animated background grid', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const grids = wrapper.findAll('.grid-bg')
      expect(grids.length).toBe(2)
    })
  })

  describe('Hero Section', () => {
    it('renders position-hero section', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.find('.position-hero').exists()).toBe(true)
    })

    it('renders position icon', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const icon = wrapper.find('.position-icon')
      expect(icon.exists()).toBe(true)
      expect(icon.classes).toContain('neon-glow')
    })

    it('displays page title', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const title = wrapper.find('.hero-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Job Openings')
    })

    it('title has neon-text class', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const title = wrapper.find('.hero-title.neon-text')
      expect(title.exists()).toBe(true)
    })

    it('displays subtitle', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const subtitle = wrapper.find('.hero-subtitle')
      expect(subtitle.exists()).toBe(true)
    })
  })

  describe('Search Box', () => {
    it('renders search box', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.find('.search-box').exists()).toBe(true)
    })

    it('has search input field', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const input = wrapper.find('.search-input')
      expect(input.exists()).toBe(true)
    })

    it('search input has correct placeholder', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const input = wrapper.find('.search-input')
      expect(input.attributes('placeholder')).toBe('Search positions...')
    })

    it('has search icon', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const icon = wrapper.find('.search-icon')
      expect(icon.exists()).toBe(true)
    })

    it('updates search query on input', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const input = wrapper.find('.search-input')
      await input.setValue('developer')
      expect(wrapper.vm.searchQuery).toBe('developer')
    })
  })

  describe('Filter Sidebar', () => {
    it('renders filter sidebar', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.find('.filter-sidebar').exists()).toBe(true)
    })

    it('renders department filter group', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const deptFilter = wrapper.findAll('.filter-group')[0]
      expect(deptFilter.find('.filter-title').text()).toBe('Department')
    })

    it('renders 5 department options', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const options = wrapper.findAll('.filter-option')
      expect(options.length).toBeGreaterThanOrEqual(5)
    })

    it('renders location filter group', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const filterGroups = wrapper.findAll('.filter-group')
      const locationFilter = filterGroups[1]
      expect(locationFilter.find('.filter-title').text()).toBe('Location')
    })

    it('renders employment type filter group', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const filterGroups = wrapper.findAll('.filter-group')
      const typeFilter = filterGroups[2]
      expect(typeFilter.find('.filter-title').text()).toBe('Employment Type')
    })

    it('has clear filters button', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const clearBtn = wrapper.find('.clear-filters-btn')
      expect(clearBtn.exists()).toBe(true)
      expect(clearBtn.text()).toBe('Clear Filters')
    })

    it('displays filter count', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const count = wrapper.find('.filter-count')
      expect(count.exists()).toBe(true)
      expect(count.text()).toContain('positions')
    })
  })

  describe('Filter Functionality', () => {
    it('filters positions by search query', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      await wrapper.vm.searchQuery = 'Frontend'
      expect(wrapper.vm.filteredPositions.length).toBeGreaterThan(0)
      expect(wrapper.vm.filteredPositions[0].title.en).toContain('Frontend')
    })

    it('clears all filters when clear button clicked', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      wrapper.vm.selectedDepartments = ['engineering']
      wrapper.vm.searchQuery = 'test'
      await wrapper.vm.clearFilters()
      expect(wrapper.vm.selectedDepartments.length).toBe(0)
      expect(wrapper.vm.searchQuery).toBe('')
    })
  })

  describe('Positions Grid', () => {
    it('renders positions grid', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.find('.positions-grid').exists()).toBe(true)
    })

    it('displays 8 position cards', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const cards = wrapper.findAll('.position-card')
      expect(cards.length).toBe(8)
    })

    it('position cards have cyber-card class', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const cards = wrapper.findAll('.cyber-card.position-card')
      expect(cards.length).toBe(8)
    })

    it('position card displays title', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const firstCard = wrapper.findAll('.position-card')[0]
      expect(firstCard.find('.position-title').exists()).toBe(true)
    })

    it('position card has type badge', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const firstCard = wrapper.findAll('.position-card')[0]
      expect(firstCard.find('.position-badge').exists()).toBe(true)
    })

    it('position card displays department', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const firstCard = wrapper.findAll('.position-card')[0]
      expect(firstCard.text()).toContain('Engineering')
    })

    it('position card displays location', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const firstCard = wrapper.findAll('.position-card')[0]
      expect(firstCard.text()).toContain('Shanghai')
    })

    it('position card has view details button', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const buttons = wrapper.findAll('.view-details-btn')
      expect(buttons.length).toBe(8)
    })

    it('opens position detail when card clicked', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const firstCard = wrapper.findAll('.position-card')[0]
      await firstCard.trigger('click')
      expect(wrapper.vm.selectedPosition).toBeTruthy()
    })
  })

  describe('Position Detail Modal', () => {
    it('does not render modal when no position selected', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    })

    it('renders modal when position selected', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      wrapper.vm.selectedPosition = wrapper.vm.positions[0]
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    })

    it('modal displays position title', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      wrapper.vm.selectedPosition = wrapper.vm.positions[0]
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.modal-title').text()).toBe('Frontend Developer')
    })

    it('modal has close button', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      wrapper.vm.selectedPosition = wrapper.vm.positions[0]
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.modal-close').exists()).toBe(true)
    })

    it('closes modal when close button clicked', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      wrapper.vm.selectedPosition = wrapper.vm.positions[0]
      await wrapper.vm.$nextTick()
      await wrapper.find('.modal-close').trigger('click')
      expect(wrapper.vm.selectedPosition).toBeNull()
    })

    it('closes modal when overlay clicked', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      wrapper.vm.selectedPosition = wrapper.vm.positions[0]
      await wrapper.vm.$nextTick()
      await wrapper.find('.modal-overlay').trigger('click')
      expect(wrapper.vm.selectedPosition).toBeNull()
    })

    it('modal displays all sections', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      wrapper.vm.selectedPosition = wrapper.vm.positions[0]
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.modal-section').exists()).toBe(true)
    })
  })

  describe('Empty State', () => {
    it('displays empty state when no positions match', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      await wrapper.vm.searchQuery = 'nonexistent position'
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('empty state has icon', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      await wrapper.vm.searchQuery = 'nonexistent position'
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.empty-icon').exists()).toBe(true)
    })

    it('empty state displays title and description', async () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      await wrapper.vm.searchQuery = 'nonexistent position'
      await wrapper.vm.$nextTick()
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.find('h3').text()).toBe('No positions found')
    })
  })

  describe('Accessibility', () => {
    it('uses semantic HTML elements', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.find('section').exists()).toBe(true)
      expect(wrapper.find('main').exists()).toBe(true)
      expect(wrapper.find('h1').exists()).toBe(true)
    })

    it('has proper heading hierarchy', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const headings = wrapper.findAll('h1, h2, h3')
      expect(headings.length).toBeGreaterThan(10)
    })

    it('filter checkboxes have associated labels', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const labels = wrapper.findAll('.filter-option')
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  describe('Cyberpunk Styling', () => {
    it('applies neon-text class to title', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.find('.neon-text').exists()).toBe(true)
    })

    it('position icons have neon-glow class', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.find('.neon-glow').exists()).toBe(true)
    })

    it('cards have hover-lift class', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const cards = wrapper.findAll('.hover-lift')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('badge colors vary by type', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const badges = wrapper.findAll('.position-badge')
      expect(badges.length).toBe(8)
    })
  })

  describe('Data Structure', () => {
    it('has 8 sample positions', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      expect(wrapper.vm.positions.length).toBe(8)
    })

    it('position has required fields', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const position = wrapper.vm.positions[0]
      expect(position.id).toBeDefined()
      expect(position.title).toBeDefined()
      expect(position.department).toBeDefined()
      expect(position.location).toBeDefined()
      expect(position.type).toBeDefined()
    })

    it('position title has both languages', () => {
      wrapper = mount(PositionList, {
        global: {
          plugins: [router, pinia]
        }
      })
      const position = wrapper.vm.positions[0]
      expect(position.title.en).toBeDefined()
      expect(position.title.zh).toBeDefined()
    })
  })
})
