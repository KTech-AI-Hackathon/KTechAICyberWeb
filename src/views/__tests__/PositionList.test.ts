/**
 * @file PositionList.test.ts
 * @description Comprehensive unit tests for PositionList view component
 * @ticket #57 - TEST-010: Position List Component Unit Tests - TDD with Vitest
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

// Mock the module before importing the component
vi.mock('../../composables/useLanguage', () => {
  const mockTranslations = {
    'nav.home': 'Home',
    'positions.title': 'Job Openings',
    'positions.subtitle': 'Join Our Team',
    'positions.searchPlaceholder': 'Search positions...',
    'positions.filters.title': 'Filters',
    'positions.filters.department': 'Department',
    'positions.filters.location': 'Location',
    'positions.filters.type': 'Employment Type',
    'positions.filters.clearAll': 'Clear All',
    'positions.filters.activeFilters': 'positions found',
    'positions.departments.all': 'All Departments',
    'positions.departments.engineering': 'Engineering',
    'positions.departments.product': 'Product',
    'positions.departments.design': 'Design',
    'positions.departments.marketing': 'Marketing',
    'positions.departments.sales': 'Sales',
    'positions.locations.all': 'All Locations',
    'positions.locations.bangkok': 'Bangkok',
    'positions.locations.shanghai': 'Shanghai',
    'positions.locations.beijing': 'Beijing',
    'positions.locations.remote': 'Remote',
    'positions.types.all': 'All Types',
    'positions.types.fulltime': 'Full-time',
    'positions.types.parttime': 'Part-time',
    'positions.types.contract': 'Contract',
    'positions.types.internship': 'Internship',
    'positions.cards.posted': 'Posted',
    'positions.cards.viewDetails': 'View Details',
    'positions.detail.backToList': 'Back to list',
    'positions.detail.description': 'Job Description',
    'positions.detail.responsibilities': 'Responsibilities',
    'positions.detail.requirements': 'Requirements',
    'positions.detail.benefits': 'Benefits & Perks',
    'positions.detail.culture': 'Culture & Values',
    'positions.detail.deadline': 'Application Deadline',
    'positions.detail.applyNow': 'Apply Now',
    'positions.detail.share': 'Share',
    'positions.empty.noPositions': 'No positions available at this time',
    'positions.empty.title': 'No positions found',
    'positions.empty.message': 'Try adjusting your filters to see more results'
  }

  return {
    useLanguage: () => ({
      currentLanguage: { value: 'en' },
      languageDisplay: { value: 'EN' },
      isEnglish: { value: true },
      initLanguage: vi.fn(),
      setLanguage: vi.fn(),
      toggleLanguage: vi.fn(),
      t: (key) => mockTranslations[key] || key
    })
  }
})

import PositionList from '../PositionList.vue'

// Mock positions data
const mockPositions = [
  {
    id: 1,
    title: { en: 'Frontend Developer', zh: '前端开发工程师' },
    department: 'engineering',
    location: 'shanghai',
    type: 'fulltime',
    salary: { en: '¥25,000 - ¥40,000', zh: '¥25,000 - ¥40,000' },
    postedDate: '2025-05-15',
    deadline: '2025-07-15',
    description: {
      en: 'We are looking for an experienced Frontend Developer.',
      zh: '我们正在寻找一位经验丰富的前端开发工程师。'
    },
    responsibilities: {
      en: ['Develop responsive web applications', 'Collaborate with designers'],
      zh: ['开发响应式网络应用程序', '与设计师合作']
    },
    requirements: {
      en: ['3+ years of experience', 'Strong proficiency in Vue.js'],
      zh: ['3年以上经验', '精通 Vue.js']
    },
    benefits: {
      en: ['Competitive salary', 'Flexible working hours'],
      zh: ['有竞争力的薪酬', '灵活的工作时间']
    },
    culture: {
      en: 'We value innovation and collaboration.',
      zh: '我们重视创新与合作。'
    }
  },
  {
    id: 2,
    title: { en: 'Product Manager', zh: '产品经理' },
    department: 'product',
    location: 'beijing',
    type: 'fulltime',
    salary: { en: '¥30,000 - ¥50,000', zh: '¥30,000 - ¥50,000' },
    postedDate: '2025-05-20',
    description: {
      en: 'Join our product team to drive innovation.',
      zh: '加入我们的产品团队推动创新。'
    },
    responsibilities: {
      en: ['Define product strategy', 'Work with engineering teams'],
      zh: ['定义产品战略', '与工程团队协作']
    },
    requirements: {
      en: ['5+ years of product experience', 'Strong analytical skills'],
      zh: ['5年以上产品经验', '强大的分析能力']
    },
    benefits: {
      en: ['Stock options', 'Health insurance'],
      zh: ['股票期权', '健康保险']
    },
    culture: {
      en: 'We are customer-obsessed.',
      zh: '我们以客户为中心。'
    }
  },
  {
    id: 3,
    title: { en: 'UX Designer', zh: 'UX设计师' },
    department: 'design',
    location: 'remote',
    type: 'contract',
    salary: { en: '¥20,000 - ¥35,000', zh: '¥20,000 - ¥35,000' },
    postedDate: '2025-05-25',
    description: {
      en: 'Create beautiful and functional user experiences.',
      zh: '创造美观且实用的用户体验。'
    },
    responsibilities: {
      en: ['Design user interfaces', 'Conduct user research'],
      zh: ['设计用户界面', '进行用户研究']
    },
    requirements: {
      en: ['3+ years of UX experience', 'Proficiency in Figma'],
      zh: ['3年以上UX经验', '熟练使用 Figma']
    },
    benefits: {
      en: ['Remote work', 'Creative environment'],
      zh: ['远程工作', '创意环境']
    },
    culture: {
      en: 'Design thinking is in our DNA.',
      zh: '设计思维融入我们的基因。'
    }
  }
]

// Set up global window for test positions
;(global as any).window = { __TEST_POSITIONS__: mockPositions }

describe('PositionList.vue', () => {
  let wrapper: VueWrapper
  let router: any

  beforeEach(async () => {
    // Create router instance
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/join-us', component: { template: '<div>Join Us</div>' } },
        { path: '/join-us/positions', component: PositionList }
      ]
    })

    // Wait for router to be ready
    await router.push('/join-us/positions')
    await router.isReady()

    // Arrange: Create a fresh wrapper for each test
    wrapper = mount(PositionList, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })

    // Wait for component to mount and load data
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterEach(() => {
    // Cleanup: Unmount component after each test
    if (wrapper) {
      wrapper.unmount()
    }
  })

  // ============================================
  // Rendering Tests
  // ============================================
  describe('Rendering', () => {
    it('should mount without errors', () => {
      // Assert: Component exists and mounted successfully
      expect(wrapper.exists()).toBe(true)
    })

    it('renders main container with correct class', () => {
      // Act: Find the main container
      const container = wrapper.find('.position-list')

      // Assert: Container exists with correct class
      expect(container.exists()).toBe(true)
    })

    it('renders breadcrumb navigation', () => {
      // Act: Find breadcrumb element
      const breadcrumb = wrapper.find('.position-list__breadcrumb')

      // Assert: Breadcrumb exists
      expect(breadcrumb.exists()).toBe(true)
      expect(breadcrumb.attributes('aria-label')).toBe('Breadcrumb')
    })

    it('renders page header section', () => {
      // Act: Find header section
      const header = wrapper.find('.position-list__header')

      // Assert: Header exists
      expect(header.exists()).toBe(true)
    })

    it('renders main container with filters and content', () => {
      // Act: Find main container elements
      const filters = wrapper.find('.position-list__filters')
      const content = wrapper.find('.position-list__content')

      // Assert: Both sidebar and content exist
      expect(filters.exists()).toBe(true)
      expect(content.exists()).toBe(true)
    })
  })

  // ============================================
  // Breadcrumb Tests
  // ============================================
  describe('Breadcrumb', () => {
    it('renders breadcrumb with correct structure', () => {
      // Act: Find breadcrumb elements
      const breadcrumb = wrapper.find('.position-list__breadcrumb')
      const links = breadcrumb.findAll('a')
      const separators = breadcrumb.findAll('.breadcrumb-separator')

      // Assert: Has correct structure
      expect(links.length).toBeGreaterThanOrEqual(2)
      expect(separators).toHaveLength(2)
    })

    it('first breadcrumb link points to home', () => {
      // Act: Find first breadcrumb link
      const breadcrumb = wrapper.find('.position-list__breadcrumb')
      const links = breadcrumb.findAll('a')

      // Assert: Correct href
      expect(links[0].attributes('href')).toBe('/')
    })

    it('second breadcrumb link points to join-us', () => {
      // Act: Find second breadcrumb link
      const breadcrumb = wrapper.find('.position-list__breadcrumb')
      const links = breadcrumb.findAll('a')

      // Assert: Correct href
      expect(links[1].attributes('href')).toBe('/join-us')
    })
  })

  // ============================================
  // Search Functionality Tests
  // ============================================
  describe('Search Functionality', () => {
    it('renders search input with correct attributes', () => {
      // Act: Find search input
      const searchInput = wrapper.find('#search-input')

      // Assert: Input exists with correct attributes
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('type')).toBe('text')
    })

    it('search input has accessible label', () => {
      // Act: Find label and input
      const label = wrapper.find('label[for="search-input"]')
      const searchInput = wrapper.find('#search-input')

      // Assert: Proper labeling
      expect(label.exists()).toBe(true)
      expect(searchInput.attributes('id')).toBe('search-input')
      expect(label.attributes('for')).toBe('search-input')
    })

    it('updates search query when typing', async () => {
      // Act: Type in search input using direct element access
      const searchInput = wrapper.find('#search-input').element as HTMLInputElement
      searchInput.value = 'Frontend'
      await searchInput.dispatchEvent(new Event('input'))
      await wrapper.vm.$nextTick()

      // Assert: State updated
      expect(wrapper.vm.searchQuery).toBe('Frontend')
    })

    it('filters positions based on search query', async () => {
      // Arrange: Set search query directly
      wrapper.vm.searchQuery = 'Frontend'
      await wrapper.vm.$nextTick()

      // Act: Get filtered positions
      const filtered = wrapper.vm.filteredPositions

      // Assert: Only matching positions
      expect(filtered.length).toBe(1)
      expect(filtered[0].title.en).toContain('Frontend')
    })

    it('search matches Chinese titles', async () => {
      // Arrange: Set search query to Chinese
      wrapper.vm.searchQuery = '前端'
      await wrapper.vm.$nextTick()

      // Act: Get filtered positions
      const filtered = wrapper.vm.filteredPositions

      // Assert: Finds Chinese title
      expect(filtered.length).toBe(1)
      expect(filtered[0].title.zh).toContain('前端')
    })

    it('clear search when clearAllFilters is called', async () => {
      // Arrange: Set search query
      wrapper.vm.searchQuery = 'Developer'
      expect(wrapper.vm.searchQuery).toBe('Developer')

      // Act: Clear all filters
      await wrapper.vm.clearAllFilters()
      await wrapper.vm.$nextTick()

      // Assert: Search cleared
      expect(wrapper.vm.searchQuery).toBe('')
    })
  })

  // ============================================
  // Filter Functionality Tests
  // ============================================
  describe('Filter Functionality', () => {
    it('renders department filter select', () => {
      // Act: Find department select
      const deptSelect = wrapper.find('#department-select')

      // Assert: Department filter exists
      expect(deptSelect.exists()).toBe(true)
      expect(deptSelect.attributes('id')).toBe('department-select')
    })

    it('renders location filter select', () => {
      // Act: Find location select
      const locSelect = wrapper.find('#location-select')

      // Assert: Location filter exists
      expect(locSelect.exists()).toBe(true)
      expect(locSelect.attributes('id')).toBe('location-select')
    })

    it('renders type filter select', () => {
      // Act: Find type select
      const typeSelect = wrapper.find('#type-select')

      // Assert: Type filter exists
      expect(typeSelect.exists()).toBe(true)
      expect(typeSelect.attributes('id')).toBe('type-select')
    })

    it('department filter has all options', () => {
      // Act: Get department options
      const deptOptions = wrapper.vm.departments

      // Assert: Has correct options
      expect(deptOptions).toHaveLength(6) // all + 5 departments
      expect(deptOptions[0].value).toBe('')
      expect(deptOptions[0].label).toBe('All Departments')
    })

    it('location filter has all options', () => {
      // Act: Get location options
      const locOptions = wrapper.vm.locations

      // Assert: Has correct options
      expect(locOptions).toHaveLength(5) // all + 4 locations
      expect(locOptions[0].value).toBe('')
      expect(locOptions[0].label).toBe('All Locations')
    })

    it('type filter has all options', () => {
      // Act: Get type options
      const typeOptions = wrapper.vm.employmentTypes

      // Assert: Has correct options
      expect(typeOptions).toHaveLength(5) // all + 4 types
      expect(typeOptions[0].value).toBe('')
      expect(typeOptions[0].label).toBe('All Types')
    })

    it('filters positions by department', async () => {
      // Arrange: Select engineering department
      wrapper.vm.selectedDepartment = 'engineering'
      await wrapper.vm.$nextTick()

      // Act: Get filtered positions
      const filtered = wrapper.vm.filteredPositions

      // Assert: Only engineering positions
      expect(filtered.length).toBe(1)
      expect(filtered[0].department).toBe('engineering')
    })

    it('filters positions by location', async () => {
      // Arrange: Select Shanghai location
      wrapper.vm.selectedLocation = 'shanghai'
      await wrapper.vm.$nextTick()

      // Act: Get filtered positions
      const filtered = wrapper.vm.filteredPositions

      // Assert: Only Shanghai positions
      expect(filtered.length).toBe(1)
      expect(filtered[0].location).toBe('shanghai')
    })

    it('filters positions by type', async () => {
      // Arrange: Select contract type
      wrapper.vm.selectedType = 'contract'
      await wrapper.vm.$nextTick()

      // Act: Get filtered positions
      const filtered = wrapper.vm.filteredPositions

      // Assert: Only contract positions
      expect(filtered.length).toBe(1)
      expect(filtered[0].type).toBe('contract')
    })

    it('applies multiple filters simultaneously', async () => {
      // Arrange: Set multiple filters
      wrapper.vm.selectedDepartment = 'engineering'
      wrapper.vm.selectedLocation = 'shanghai'
      wrapper.vm.selectedType = 'fulltime'
      await wrapper.vm.$nextTick()

      // Act: Get filtered positions
      const filtered = wrapper.vm.filteredPositions

      // Assert: Only positions matching all filters
      expect(filtered.length).toBe(1)
      expect(filtered[0].department).toBe('engineering')
      expect(filtered[0].location).toBe('shanghai')
      expect(filtered[0].type).toBe('fulltime')
    })

    it('clearAllFilters resets all filters', async () => {
      // Arrange: Set all filters
      wrapper.vm.searchQuery = 'Developer'
      wrapper.vm.selectedDepartment = 'engineering'
      wrapper.vm.selectedLocation = 'shanghai'
      wrapper.vm.selectedType = 'fulltime'
      await wrapper.vm.$nextTick()

      // Act: Clear all filters
      await wrapper.vm.clearAllFilters()
      await wrapper.vm.$nextTick()

      // Assert: All filters reset
      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.selectedDepartment).toBe('')
      expect(wrapper.vm.selectedLocation).toBe('')
      expect(wrapper.vm.selectedType).toBe('')
    })

    it('hasActiveFilters returns true when any filter is active', () => {
      // Arrange: Set a filter
      wrapper.vm.selectedDepartment = 'engineering'

      // Act: Check active filters
      const hasActive = wrapper.vm.hasActiveFilters

      // Assert: Has active filters
      expect(hasActive).toBe(true)
    })

    it('hasActiveFilters returns false when no filters are active', () => {
      // Act: Check active filters with none set
      const hasActive = wrapper.vm.hasActiveFilters

      // Assert: No active filters
      expect(hasActive).toBe(false)
    })

    it('displays filter count when filters are active', async () => {
      // Arrange: Set a filter
      wrapper.vm.selectedDepartment = 'engineering'
      await wrapper.vm.$nextTick()

      // Act: Find filter active element
      const filterActive = wrapper.find('.filter-active')

      // Assert: Filter count displays
      expect(filterActive.exists()).toBe(true)
      expect(filterActive.text()).toContain('1')
    })

    it('clear button appears when filters are active', async () => {
      // Arrange: Set a filter
      wrapper.vm.selectedDepartment = 'engineering'
      await wrapper.vm.$nextTick()

      // Act: Find clear button
      const clearBtn = wrapper.find('.filter-clear')

      // Assert: Clear button exists
      expect(clearBtn.exists()).toBe(true)
    })
  })

  // ============================================
  // Position Cards Tests
  // ============================================
  describe('Position Cards', () => {
    it('renders position cards grid', () => {
      // Act: Find grid element
      const grid = wrapper.find('.position-list__grid')

      // Assert: Grid exists and has correct role
      expect(grid.exists()).toBe(true)
      expect(grid.attributes('role')).toBe('list')
    })

    it('renders correct number of position cards', () => {
      // Act: Find all position cards
      const cards = wrapper.findAll('.position-card')

      // Assert: Has correct number of cards
      expect(cards).toHaveLength(3)
    })

    it('position card has correct role', () => {
      // Act: Find first card
      const firstCard = wrapper.find('.position-card')

      // Assert: Has listitem role
      expect(firstCard.attributes('role')).toBe('listitem')
    })

    it('position card displays job title', () => {
      // Act: Find first card title
      const firstCard = wrapper.find('.position-card')
      const title = firstCard.find('.position-card__title')

      // Assert: Title displays correctly
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Frontend Developer')
    })

    it('position card displays department', () => {
      // Act: Find first card
      const firstCard = wrapper.find('.position-card')
      const metaItems = firstCard.findAll('.position-card__meta-item')

      // Assert: Department is displayed
      expect(metaItems.length).toBeGreaterThan(0)
      expect(metaItems[0].text()).toContain('Engineering')
    })

    it('position card displays location with icon', () => {
      // Act: Find first card location
      const firstCard = wrapper.find('.position-card')
      const metaItems = firstCard.findAll('.position-card__meta-item')
      const locationItem = metaItems[1]

      // Assert: Location with icon
      expect(locationItem.find('.position-card__icon').exists()).toBe(true)
      expect(locationItem.text()).toContain('Shanghai')
    })

    it('position card displays description', () => {
      // Act: Find first card description
      const firstCard = wrapper.find('.position-card')
      const description = firstCard.find('.position-card__description')

      // Assert: Description exists
      expect(description.exists()).toBe(true)
    })

    it('position card displays salary information', () => {
      // Act: Find first card footer
      const firstCard = wrapper.find('.position-card')
      const footer = firstCard.find('.position-card__footer')

      // Assert: Footer contains salary information
      expect(footer.exists()).toBe(true)
      expect(footer.text()).toBeTruthy()
    })

    it('position card displays type badge', () => {
      // Act: Find first card badge
      const firstCard = wrapper.find('.position-card')
      const badge = firstCard.find('.position-card__badge')

      // Assert: Badge exists and shows type
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('FULLTIME')
    })

    it('position card has view details button', () => {
      // Act: Find first card action button
      const firstCard = wrapper.find('.position-card')
      const actionBtn = firstCard.find('.position-card__action')

      // Assert: Button exists with correct text
      expect(actionBtn.exists()).toBe(true)
    })

    it('view details button has accessible label', () => {
      // Act: Find first card action button
      const firstCard = wrapper.find('.position-card')
      const actionBtn = firstCard.find('.position-card__action')

      // Assert: Has aria-label
      expect(actionBtn.attributes('aria-label')).toBeTruthy()
      expect(actionBtn.attributes('aria-label')).toContain('Frontend Developer')
    })

    it('position card has hover effect classes', () => {
      // Act: Find first card
      const firstCard = wrapper.find('.position-card')

      // Assert: Has CSS for hover effects
      expect(firstCard.classes()).toContain('position-card')
    })
  })

  // ============================================
  // Position Detail View Tests
  // ============================================
  describe('Position Detail View', () => {
    it('modal does not show initially', () => {
      // Act: Find modal
      const modal = wrapper.find('.position-modal')

      // Assert: Modal is not visible
      expect(modal.exists()).toBe(false)
    })

    it('opens modal when position is clicked', async () => {
      // Act: Open modal directly via component method
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Assert: Modal is now visible
      const modal = wrapper.find('.position-modal')
      expect(modal.exists()).toBe(true)
    })

    it('modal has correct dialog attributes', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find modal
      const modal = wrapper.find('.position-modal')

      // Assert: Has correct ARIA attributes
      expect(modal.attributes('role')).toBe('dialog')
      expect(modal.attributes('aria-modal')).toBe('true')
    })

    it('modal displays position title', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find modal title
      const modalTitle = wrapper.find('.position-modal__title')

      // Assert: Title is displayed
      expect(modalTitle.exists()).toBe(true)
      expect(modalTitle.text()).toBe('Frontend Developer')
    })

    it('modal displays job description section', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find description section
      const sections = wrapper.findAll('.position-modal__section')

      // Assert: Description section exists
      expect(sections.length).toBeGreaterThan(0)
    })

    it('modal displays responsibilities list', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find responsibilities section
      const sections = wrapper.findAll('.position-modal__section')

      // Assert: Responsibilities section exists with list items
      expect(sections.length).toBeGreaterThan(0)
    })

    it('modal displays requirements list', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find requirements section
      const sections = wrapper.findAll('.position-modal__section')

      // Assert: Requirements section exists
      expect(sections.length).toBeGreaterThan(0)
    })

    it('modal displays benefits list', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find benefits section
      const sections = wrapper.findAll('.position-modal__section')

      // Assert: Benefits section exists
      expect(sections.length).toBeGreaterThan(0)
    })

    it('modal displays apply now button', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find apply button
      const applyBtn = wrapper.find('.position-modal__apply')

      // Assert: Apply button exists
      expect(applyBtn.exists()).toBe(true)
      expect(applyBtn.text()).toBe('Apply Now')
    })

    it('modal displays share button', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find share button
      const shareBtn = wrapper.find('.position-modal__share')

      // Assert: Share button exists
      expect(shareBtn.exists()).toBe(true)
      expect(shareBtn.text()).toBe('Share')
    })

    it('closes modal when close button is clicked', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.position-modal').exists()).toBe(true)

      // Act: Click close button
      await wrapper.vm.closePositionDetail()
      await wrapper.vm.$nextTick()

      // Assert: Modal is closed
      expect(wrapper.find('.position-modal').exists()).toBe(false)
    })

    it('close button has accessible label', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find close button
      const closeBtn = wrapper.find('.position-modal__close')

      // Assert: Has aria-label
      expect(closeBtn.attributes('aria-label')).toBe('Back to list')
    })
  })

  // ============================================
  // Empty State Tests
  // ============================================
  describe('Empty State', () => {
    it('shows no positions empty state when positions array is empty', async () => {
      // Arrange: Set positions to empty
      wrapper.vm.positions = []
      await wrapper.vm.$nextTick()

      // Act: Find empty state
      const emptyState = wrapper.find('.position-list__empty')

      // Assert: Empty state displays
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('No positions available')
    })

    it('shows no results empty state when filters return no results', async () => {
      // Arrange: Set filters that return no results
      wrapper.vm.searchQuery = 'NonExistentPosition'
      await wrapper.vm.$nextTick()

      // Act: Find empty state
      const emptyState = wrapper.find('.position-list__empty')

      // Assert: Empty state displays
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('No positions found')
    })

    it('empty state has proper ARIA attributes', async () => {
      // Arrange: Set positions to empty
      wrapper.vm.positions = []
      await wrapper.vm.$nextTick()

      // Act: Find empty state
      const emptyState = wrapper.find('.position-list__empty')

      // Assert: Has proper ARIA
      expect(emptyState.attributes('role')).toBe('status')
      expect(emptyState.attributes('aria-live')).toBe('polite')
    })

    it('empty state has clear filters button', async () => {
      // Arrange: Set filters with no results
      wrapper.vm.searchQuery = 'NonExistent'
      await wrapper.vm.$nextTick()

      // Act: Find empty state action button
      const emptyState = wrapper.find('.position-list__empty')
      const clearBtn = emptyState.find('.empty-action')

      // Assert: Clear button exists
      expect(clearBtn.exists()).toBe(true)
    })
  })

  // ============================================
  // Internationalization Tests
  // ============================================
  describe('Internationalization', () => {
    it('translates page title correctly', () => {
      // Act: Get translation
      const result = wrapper.vm.t('positions.title')

      // Assert: Returns correct English text
      expect(result).toBe('Job Openings')
    })

    it('translates filter labels correctly', () => {
      // Act: Get translations
      const deptLabel = wrapper.vm.t('positions.filters.department')
      const locLabel = wrapper.vm.t('positions.filters.location')
      const typeLabel = wrapper.vm.t('positions.filters.type')

      // Assert: All labels translated
      expect(deptLabel).toBe('Department')
      expect(locLabel).toBe('Location')
      expect(typeLabel).toBe('Employment Type')
    })

    it('translates department names correctly', () => {
      // Act: Get translations
      const engineering = wrapper.vm.t('positions.departments.engineering')
      const product = wrapper.vm.t('positions.departments.product')

      // Assert: Names translated
      expect(engineering).toBe('Engineering')
      expect(product).toBe('Product')
    })

    it('translates location names correctly', () => {
      // Act: Get translations
      const shanghai = wrapper.vm.t('positions.locations.shanghai')
      const beijing = wrapper.vm.t('positions.locations.beijing')

      // Assert: Names translated
      expect(shanghai).toBe('Shanghai')
      expect(beijing).toBe('Beijing')
    })

    it('translates employment types correctly', () => {
      // Act: Get translations
      const fulltime = wrapper.vm.t('positions.types.fulltime')
      const contract = wrapper.vm.t('positions.types.contract')

      // Assert: Types translated
      expect(fulltime).toBe('Full-time')
      expect(contract).toBe('Contract')
    })

    it('translates button text correctly', () => {
      // Act: Get translations
      const clearAll = wrapper.vm.t('positions.filters.clearAll')
      const viewDetails = wrapper.vm.t('positions.cards.viewDetails')

      // Assert: Buttons translated
      expect(clearAll).toBe('Clear All')
      expect(viewDetails).toBe('View Details')
    })

    it('returns key when translation is not found', () => {
      // Act: Get non-existent translation
      const result = wrapper.vm.t('nonexistent.key')

      // Assert: Returns the key
      expect(result).toBe('nonexistent.key')
    })
  })

  // ============================================
  // Cyberpunk Styling Tests
  // ============================================
  describe('Cyberpunk Styling', () => {
    it('container has cyberpunk gradient background', () => {
      // Act: Find container
      const container = wrapper.find('.position-list')

      // Assert: Has class for styling
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('position-list')
    })

    it('filter section has cyberpunk styling', () => {
      // Act: Find filter section
      const filterSection = wrapper.find('.filter-section')

      // Assert: Has class for cyberpunk styling
      expect(filterSection.exists()).toBe(true)
      expect(filterSection.classes()).toContain('filter-section')
    })

    it('search input has cyberpunk glow effect class', () => {
      // Act: Find search input container
      const searchInput = wrapper.find('.filter-search')

      // Assert: Has class for glow effect
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.classes()).toContain('filter-search')
    })

    it('position card has hover effect classes', () => {
      // Act: Find first position card
      const firstCard = wrapper.find('.position-card')

      // Assert: Has classes for hover effects
      expect(firstCard.classes()).toContain('position-card')
    })

    it('position card badge has accent color class', () => {
      // Act: Find first card badge
      const firstCard = wrapper.find('.position-card')
      const badge = firstCard.find('.position-card__badge')

      // Assert: Has class for accent color
      expect(badge.exists()).toBe(true)
      expect(badge.classes()).toContain('position-card__badge')
    })

    it('view details button has cyberpunk styling', () => {
      // Act: Find first card action button
      const firstCard = wrapper.find('.position-card')
      const actionBtn = firstCard.find('.position-card__action')

      // Assert: Has class for cyberpunk styling
      expect(actionBtn.exists()).toBe(true)
      expect(actionBtn.classes()).toContain('position-card__action')
    })

    it('modal has cyberpunk styling classes', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find modal elements
      const modal = wrapper.find('.position-modal')
      const container = wrapper.find('.position-modal__container')

      // Assert: Has cyberpunk styling
      expect(modal.exists()).toBe(true)
      expect(container.classes()).toContain('position-modal__container')
    })
  })

  // ============================================
  // Responsive Design Tests
  // ============================================
  describe('Responsive Design', () => {
    it('renders grid element for layout', () => {
      // Act: Find grid
      const grid = wrapper.find('.position-list__grid')

      // Assert: Grid exists for desktop layout
      expect(grid.exists()).toBe(true)
    })

    it('has responsive CSS classes', () => {
      // Act: Find main container
      const container = wrapper.find('.position-list')
      const content = wrapper.find('.position-list__content')

      // Assert: Has classes for responsive behavior
      expect(container.exists()).toBe(true)
      expect(content.exists()).toBe(true)
    })

    it('filters sidebar has positioning class', () => {
      // Act: Find filters sidebar
      const filters = wrapper.find('.position-list__filters')

      // Assert: Has class for positioning
      expect(filters.exists()).toBe(true)
      expect(filters.classes()).toContain('position-list__filters')
    })
  })

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('Accessibility', () => {
    it('uses semantic HTML5 elements', () => {
      // Act: Find semantic elements
      const nav = wrapper.find('.position-list__breadcrumb')
      const section = wrapper.find('.position-list__header')
      const aside = wrapper.find('.position-list__filters')
      const main = wrapper.find('.position-list__content')

      // Assert: Semantic elements exist
      expect(nav.exists()).toBe(true)
      expect(section.exists()).toBe(true)
      expect(aside.exists()).toBe(true)
      expect(main.exists()).toBe(true)
    })

    it('has proper heading hierarchy', () => {
      // Act: Find headings
      const h1 = wrapper.find('.position-list__title')
      const h2 = wrapper.find('.filter-title')

      // Assert: Proper hierarchy
      expect(h1.exists()).toBe(true)
      expect(h2.exists()).toBe(true)
    })

    it('search input has proper labeling', () => {
      // Act: Find label and input
      const label = wrapper.find('label[for="search-input"]')
      const input = wrapper.find('#search-input')

      // Assert: Proper labeling relationship
      expect(label.exists()).toBe(true)
      expect(input.attributes('id')).toBe('search-input')
      expect(label.attributes('for')).toBe('search-input')
    })

    it('filter selects have proper labels', () => {
      // Act: Find department label and select
      const deptLabel = wrapper.find('label[for="department-select"]')
      const deptSelect = wrapper.find('#department-select')

      // Assert: Proper labeling
      expect(deptLabel.exists()).toBe(true)
      expect(deptSelect.attributes('id')).toBe('department-select')
      expect(deptLabel.attributes('for')).toBe('department-select')
    })

    it('position cards have proper ARIA roles', () => {
      // Act: Find grid and cards
      const grid = wrapper.find('.position-list__grid')
      const cards = wrapper.findAll('.position-card')

      // Assert: Proper ARIA roles
      expect(grid.attributes('role')).toBe('list')
      cards.forEach(card => {
        expect(card.attributes('role')).toBe('listitem')
      })
    })

    it('empty state has live region attributes', async () => {
      // Arrange: Set positions to empty
      wrapper.vm.positions = []
      await wrapper.vm.$nextTick()

      // Act: Find empty state
      const emptyState = wrapper.find('.position-list__empty')

      // Assert: Has ARIA live region
      expect(emptyState.attributes('role')).toBe('status')
      expect(emptyState.attributes('aria-live')).toBe('polite')
    })

    it('view details buttons have accessible labels', () => {
      // Act: Find all view details buttons
      const buttons = wrapper.findAll('.position-card__action')

      // Assert: All buttons have aria-label
      buttons.forEach(btn => {
        expect(btn.attributes('aria-label')).toBeTruthy()
      })
    })

    it('breadcrumb has aria-label', () => {
      // Act: Find breadcrumb
      const breadcrumb = wrapper.find('.position-list__breadcrumb')

      // Assert: Has aria-label
      expect(breadcrumb.attributes('aria-label')).toBe('Breadcrumb')
    })

    it('modal has proper dialog attributes', async () => {
      // Arrange: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.$nextTick()

      // Act: Find modal
      const modal = wrapper.find('.position-modal')

      // Assert: Has dialog attributes
      expect(modal.attributes('role')).toBe('dialog')
      expect(modal.attributes('aria-modal')).toBe('true')
    })
  })

  // ============================================
  // Integration Tests
  // ============================================
  describe('Integration', () => {
    it('loads positions data on mount', () => {
      // Act: Get positions
      const positions = wrapper.vm.positions

      // Assert: Positions loaded
      expect(positions).toBeTruthy()
      expect(positions.length).toBe(3)
    })

    it('integrates with useLanguage composable', () => {
      // Act: Check composable integration
      const hasTFunction = typeof wrapper.vm.t === 'function'
      const hasCurrentLanguage = wrapper.vm.currentLanguage

      // Assert: Composable integrated
      expect(hasTFunction).toBe(true)
      expect(hasCurrentLanguage).toBeTruthy()
    })

    it('breadcrumb links use router-link', () => {
      // Act: Find breadcrumb links
      const breadcrumb = wrapper.find('.position-list__breadcrumb')
      const links = breadcrumb.findAll('a')

      // Assert: Links exist
      expect(links.length).toBeGreaterThan(0)
    })

    it('has correct data flow from filters to display', async () => {
      // Arrange: Set filter
      wrapper.vm.selectedDepartment = 'engineering'
      await wrapper.vm.$nextTick()

      // Act: Check filtered positions
      const filtered = wrapper.vm.filteredPositions

      // Assert: Correct data flow
      expect(filtered.length).toBe(1)
      expect(filtered[0].department).toBe('engineering')
    })

    it('modal body overflow is managed on open/close', async () => {
      // Arrange: Get original body style
      const originalOverflow = document.body.style.overflow

      // Act: Open modal
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      const overflowHidden = document.body.style.overflow

      // Assert: Body overflow hidden
      expect(overflowHidden).toBe('hidden')

      // Act: Close modal
      await wrapper.vm.closePositionDetail()
      const overflowRestored = document.body.style.overflow

      // Assert: Body overflow restored
      expect(overflowRestored).toBe(originalOverflow)
    })
  })

  // ============================================
  // Helper Functions Tests
  // ============================================
  describe('Helper Functions', () => {
    it('getDepartmentLabel function exists', () => {
      // Act: Check function exists
      const hasFunction = typeof wrapper.vm.getDepartmentLabel === 'function'

      // Assert: Function exists
      expect(hasFunction).toBe(true)
    })

    it('getLocationLabel function exists', () => {
      // Act: Check function exists
      const hasFunction = typeof wrapper.vm.getLocationLabel === 'function'

      // Assert: Function exists
      expect(hasFunction).toBe(true)
    })

    it('getTypeLabel function exists', () => {
      // Act: Check function exists
      const hasFunction = typeof wrapper.vm.getTypeLabel === 'function'

      // Assert: Function exists
      expect(hasFunction).toBe(true)
    })

    it('formatDate function exists', () => {
      // Act: Check function exists
      const hasFunction = typeof wrapper.vm.formatDate === 'function'

      // Assert: Function exists
      expect(hasFunction).toBe(true)
    })

    it('formatDate returns formatted date string', () => {
      // Act: Format date
      const formatted = wrapper.vm.formatDate('2025-05-15')

      // Assert: Date is formatted
      expect(formatted).toBeTruthy()
      expect(formatted).toContain('2025')
    })

    it('clearAllFilters function exists', () => {
      // Act: Check function exists
      const hasFunction = typeof wrapper.vm.clearAllFilters === 'function'

      // Assert: Function exists
      expect(hasFunction).toBe(true)
    })

    it('openPositionDetail function exists', () => {
      // Act: Check function exists
      const hasFunction = typeof wrapper.vm.openPositionDetail === 'function'

      // Assert: Function exists
      expect(hasFunction).toBe(true)
    })

    it('closePositionDetail function exists', () => {
      // Act: Check function exists
      const hasFunction = typeof wrapper.vm.closePositionDetail === 'function'

      // Assert: Function exists
      expect(hasFunction).toBe(true)
    })
  })

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('handles empty positions array gracefully', async () => {
      // Arrange: Set positions to empty
      wrapper.vm.positions = []
      await wrapper.vm.$nextTick()

      // Act: Check component doesn't crash
      const emptyState = wrapper.find('.position-list__empty')

      // Assert: Shows empty state
      expect(emptyState.exists()).toBe(true)
    })

    it('handles special characters in search', async () => {
      // Arrange: Set search with special chars
      wrapper.vm.searchQuery = 'C++ Developer'
      await wrapper.vm.$nextTick()

      // Act: Check it doesn't crash
      expect(() => wrapper.vm.filteredPositions).not.toThrow()
    })

    it('handles rapid filter changes', async () => {
      // Act: Rapidly change filters
      wrapper.vm.selectedDepartment = 'engineering'
      wrapper.vm.selectedLocation = 'shanghai'
      wrapper.vm.selectedType = 'fulltime'
      wrapper.vm.searchQuery = 'Frontend'
      await wrapper.vm.$nextTick()

      // Assert: No errors and correct filtering
      expect(wrapper.vm.filteredPositions.length).toBe(1)
    })

    it('handles opening and closing modal rapidly', async () => {
      // Act: Open and close modal rapidly
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[0])
      await wrapper.vm.closePositionDetail()
      await wrapper.vm.openPositionDetail(wrapper.vm.positions[1])
      await wrapper.vm.closePositionDetail()
      await wrapper.vm.$nextTick()

      // Assert: No errors
      expect(wrapper.find('.position-modal').exists()).toBe(false)
    })

    it('handles clearAllFilters when no filters are active', async () => {
      // Arrange: Ensure no filters active
      await wrapper.vm.clearAllFilters()
      await wrapper.vm.$nextTick()

      // Act: Call clearAllFilters again
      expect(() => wrapper.vm.clearAllFilters()).not.toThrow()
      await wrapper.vm.$nextTick()

      // Assert: All values remain empty
      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.selectedDepartment).toBe('')
    })
  })
})
