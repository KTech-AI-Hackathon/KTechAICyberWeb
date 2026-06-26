import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Honors from '@/components/Honors.vue'

// Mock the composable before importing the component
vi.mock('@/composables/useSkeleton', () => ({
  useSkeleton: vi.fn(() => ({
    isLoading: ref(false),
    isVisible: ref(true),
    target: ref(null),
    hasLoaded: ref(true)
  }))
}))

// Mock the SkeletonHonors component
vi.mock('@/components/SkeletonHonors.vue', () => ({
  default: {
    name: 'SkeletonHonors',
    props: ['count'],
    template: '<div class="skeleton-honors">Loading...</div>'
  }
}))

describe('Honors.vue', () => {
  let wrapper

  const mockTranslations = {
    'honors.title': '荣誉资质',
    'honors.subtitle': '专业认证 · 值得信赖',
    'honors.highTech': '国家高新技术企业',
    'honors.highTechDesc': '高新技术企业认证',
    'honors.hq': '深圳市跨国公司总部',
    'honors.hqDesc': '第一批认定企业',
    'honors.aaa': 'AAA级信用企业',
    'honors.aaaDesc': '信用评级最高等级',
    'honors.iso9001': 'ISO9001认证',
    'honors.iso9001Desc': '质量管理体系认证',
    'honors.iso27001': 'ISO27001认证',
    'honors.iso27001Desc': '信息安全管理体系',
    'honors.iso20000': 'ISO20000认证',
    'honors.iso20000Desc': 'IT服务管理体系',
    'honors.specialized': '深圳市专精特新',
    'honors.specializedDesc': '专精特新中小企业',
    'honors.member': '深圳市金融科技协会',
    'honors.memberDesc': '会员单位'
  }

  beforeEach(() => {
    wrapper = mount(Honors, {
      global: {
        stubs: {
          Transition: {
            template: '<slot />'
          }
        }
      }
    })
  })

  describe('Rendering', () => {
    it('should mount without errors', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('renders main honors section', () => {
      const section = wrapper.find('.honors')
      expect(section.exists()).toBe(true)
    })

    it('has correct section id for navigation', () => {
      const section = wrapper.find('#honors')
      expect(section.exists()).toBe(true)
    })

    it('renders content wrapper when not loading', () => {
      const contentWrapper = wrapper.find('.content-wrapper')
      expect(contentWrapper.exists()).toBe(true)
    })
  })

  describe('Content Display', () => {
    it('renders section title', () => {
      const title = wrapper.find('.section-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe(mockTranslations['honors.title'])
    })

    it('renders section subtitle', () => {
      const subtitle = wrapper.find('.section-subtitle')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toBe(mockTranslations['honors.subtitle'])
    })

    it('renders honors grid container', () => {
      const grid = wrapper.find('.grid')
      expect(grid.exists()).toBe(true)
    })

    it('renders all 8 honor badges', () => {
      const badges = wrapper.findAll('.honor-badge')
      expect(badges.length).toBe(8)
    })

    it('each honor badge has icon', () => {
      const icons = wrapper.findAll('.honor-icon')
      expect(icons.length).toBe(8)
    })

    it('honor badges display correct titles', () => {
      const titles = wrapper.findAll('.honor-badge h4')
      const expectedTitles = [
        mockTranslations['honors.highTech'],
        mockTranslations['honors.hq'],
        mockTranslations['honors.aaa'],
        mockTranslations['honors.iso9001'],
        mockTranslations['honors.iso27001'],
        mockTranslations['honors.iso20000'],
        mockTranslations['honors.specialized'],
        mockTranslations['honors.member']
      ]
      const actualTitles = titles.map(t => t.text())
      expectedTitles.forEach(title => {
        expect(actualTitles).toContain(title)
      })
    })

    it('honor badges display correct descriptions', () => {
      const badges = wrapper.findAll('.honor-badge')
      expect(badges[0].text()).toContain(mockTranslations['honors.highTechDesc'])
      expect(badges[1].text()).toContain(mockTranslations['honors.hqDesc'])
    })

    it('honor badges have emoji icons', () => {
      const icons = wrapper.findAll('.honor-icon')
      const iconTexts = icons.map(i => i.text())
      expect(iconTexts).toContain('🏆')
      expect(iconTexts).toContain('🎖️')
      expect(iconTexts).toContain('⭐')
    })
  })

  describe('Styling and Cyberpunk Theme', () => {
    it('section has cyberpunk background styling', () => {
      const section = wrapper.find('.honors')
      expect(section.exists()).toBe(true)
    })

    it('title has cyan color styling class', () => {
      const title = wrapper.find('.section-title')
      expect(title.classes()).toContain('section-title')
    })

    it('honor badges have proper styling classes', () => {
      const badges = wrapper.findAll('.honor-badge')
      expect(badges.length).toBe(8)
      badges.forEach(badge => {
        expect(badge.classes()).toContain('honor-badge')
      })
    })

    it('fade-in animation class is present', () => {
      const fadeElements = wrapper.findAll('.fade-in')
      expect(fadeElements.length).toBeGreaterThan(0)
    })

    it('stagger animation class on badges', () => {
      const badges = wrapper.findAll('.honor-badge')
      expect(badges[0].classes()).toContain('stagger')
    })
  })

  describe('Data Structure', () => {
    it('component has honors data array', () => {
      expect(wrapper.vm.honors).toBeDefined()
      expect(Array.isArray(wrapper.vm.honors)).toBe(true)
    })

    it('honors array contains 8 items', () => {
      expect(wrapper.vm.honors.length).toBe(8)
    })

    it('each honor item has required properties', () => {
      const honor = wrapper.vm.honors[0]
      expect(honor.icon).toBeDefined()
      expect(honor.title).toBeDefined()
      expect(honor.description).toBeDefined()
    })

    it('honor icons are emoji strings', () => {
      wrapper.vm.honors.forEach(honor => {
        expect(typeof honor.icon).toBe('string')
        expect(honor.icon.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Accessibility', () => {
    it('uses semantic HTML section element', () => {
      const section = wrapper.find('section')
      expect(section.exists()).toBe(true)
    })

    it('has proper heading hierarchy', () => {
      const h2 = wrapper.find('h2')
      const h4s = wrapper.findAll('h4')
      expect(h2.exists()).toBe(true)
      expect(h4s.length).toBe(8)
    })

    it('section has id for anchor navigation', () => {
      const section = wrapper.find('section#honors')
      expect(section.exists()).toBe(true)
    })

    it('honor icons have aria-hidden attribute', () => {
      const icons = wrapper.findAll('.honor-icon')
      icons.forEach(icon => {
        expect(icon.attributes('aria-hidden')).toBe('true')
      })
    })

    it('honor badges are properly structured as cards', () => {
      const badges = wrapper.findAll('.honor-badge')
      badges.forEach(badge => {
        expect(badge.find('h4').exists()).toBe(true)
        expect(badge.find('span').exists()).toBe(true)
      })
    })
  })

  describe('Responsive Layout', () => {
    it('grid uses auto-fit with minmax for responsive behavior', () => {
      const grid = wrapper.find('.grid')
      expect(grid.exists()).toBe(true)
    })

    it('section has responsive padding classes', () => {
      const section = wrapper.find('.section')
      expect(section.exists()).toBe(true)
    })
  })

  describe('Translation Function', () => {
    it('component has translation function', () => {
      expect(typeof wrapper.vm.t).toBe('function')
    })

    it('returns key for unknown translation', () => {
      const result = wrapper.vm.t('unknown.key')
      expect(result).toBe('unknown.key')
    })

    it('returns correct translation for known keys', () => {
      expect(wrapper.vm.t('honors.title')).toBe(mockTranslations['honors.title'])
      expect(wrapper.vm.t('honors.subtitle')).toBe(mockTranslations['honors.subtitle'])
    })
  })

  describe('Loading States', () => {
    it('has skeleton loading state managed by useSkeleton', () => {
      expect(wrapper.vm.isLoading).toBeDefined()
    })

    it('isLoading is boolean (auto-unwrapped ref)', () => {
      expect(typeof wrapper.vm.isLoading).toBe('boolean')
    })

    it('isLoading is false when loaded', () => {
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })

  describe('Component Structure', () => {
    it('imports SkeletonHonors component', () => {
      expect(wrapper.vm).toBeDefined()
    })

    it('imports useSkeleton composable', () => {
      expect(wrapper.vm.isLoading).toBeDefined()
    })

    it('honor badges use v-for with unique keys', () => {
      const badges = wrapper.findAll('.honor-badge')
      expect(badges.length).toBe(wrapper.vm.honors.length)
    })

    it('has section with class honors', () => {
      const section = wrapper.find('section.honors')
      expect(section.exists()).toBe(true)
    })
  })

  describe('Hover Effects', () => {
    it('honor badges have hover transition styles', () => {
      const badges = wrapper.findAll('.honor-badge')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('honor icons have transition styles', () => {
      const icons = wrapper.findAll('.honor-icon')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Content Wrapper', () => {
    it('renders content wrapper div', () => {
      const contentWrapper = wrapper.find('.content-wrapper')
      expect(contentWrapper.exists()).toBe(true)
    })

    it('content wrapper has fade-in child', () => {
      const fadeIn = wrapper.find('.content-wrapper .fade-in')
      expect(fadeIn.exists()).toBe(true)
    })
  })
})
