/**
 * @file Contact.test.ts
 * @description Unit tests for the Contact view (#13 - FEAT-004 form validation)
 *
 * Covers: required-field validation, min-length (name), email-format validation,
 * numeric phone validation, privacy checkbox requirement, inline accessible
 * error messages (aria-invalid / aria-describedby / role="alert"), submit is
 * blocked while invalid, and successful submission resets the form.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper, flushPromises } from '@vue/test-utils'
import Contact from '../Contact.vue'

/**
 * Deterministic i18n mock. Mirrors the new contact.* / theme.* keys so tests
 * can assert on real translated strings instead of raw keys, following the
 * JoinUs/News test style (mock useLanguage with a translation map).
 */
const dictionary: Record<string, string> = {
  'contact.title': 'Contact',
  'contact.titleAccent': 'Us',
  'contact.subtitle': 'Reach out',
  'contact.breadcrumb': 'Home / Contact',
  'contact.form.title': 'Send Us a Message',
  'contact.form.name': 'Name',
  'contact.form.namePlaceholder': 'Your full name',
  'contact.form.phone': 'Phone',
  'contact.form.phonePlaceholder': 'Your phone number',
  'contact.form.company': 'Company',
  'contact.form.companyPlaceholder': 'Your company name',
  'contact.form.email': 'Email',
  'contact.form.emailPlaceholder': 'you@example.com',
  'contact.form.privacy': 'I agree to the privacy policy',
  'contact.form.submit': 'Submit',
  'contact.form.submitting': 'Submitting...',
  'contact.form.success': 'Thank you!',
  'contact.form.error': 'Please fix the errors above.',
  'contact.form.validation.nameRequired': 'Name is required.',
  'contact.form.validation.nameTooShort': 'Name must be at least 2 characters.',
  'contact.form.validation.phoneRequired': 'Phone is required.',
  'contact.form.validation.phoneInvalid': 'Phone must contain only digits.',
  'contact.form.validation.companyRequired': 'Company is required.',
  'contact.form.validation.emailRequired': 'Email is required.',
  'contact.form.validation.emailInvalid': 'Please enter a valid email address.',
  'contact.form.validation.privacyRequired': 'You must agree to the privacy policy.',
  'contact.info.title': 'Company Information',
  'contact.info.address': 'Address',
  'contact.info.addressValue': 'Shenzhen',
  'contact.info.email': 'Email',
  'contact.info.emailValue': 'contact@ktech.fintech',
  'contact.info.phone': 'Phone',
  'contact.info.phoneValue': '+86 755 0000 0000',
  'contact.info.wechat': 'WeChat',
  'contact.info.wechatValue': 'ktech-official',
  'contact.info.social': 'Follow Us',
  'contact.demo.title': 'Request a Demo',
  'contact.demo.description': 'See our platform.',
  'contact.demo.consultant': 'Consultation',
  'contact.demo.solution': 'Solution',
  'contact.demo.consulting': 'Consulting',
  'contact.demo.button': 'Request Demo',
}

vi.mock('../../composables/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => dictionary[key] ?? key,
  }),
}))

const validFormData = {
  name: 'Alice Zhang',
  phone: '13800138000',
  company: 'KTech',
  email: 'alice@example.com',
  privacy: true,
}

describe('Contact.vue (FEAT-004 form validation)', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.useFakeTimers()
    wrapper = mount(Contact)
  })

  afterEach(() => {
    wrapper.unmount()
    vi.useRealTimers()
  })

  // ============================================
  // Structure
  // ============================================
  describe('Structure', () => {
    it('mounts and renders the form', () => {
      expect(wrapper.find('form.contact-form').exists()).toBe(true)
    })

    it('renders all required inputs with associated labels', () => {
      for (const id of ['name', 'phone', 'company', 'email', 'privacy']) {
        const input = wrapper.find(`#${id}`)
        expect(input.exists(), `input #${id} should exist`).toBe(true)
        const label = wrapper.find(`label[for="${id}"]`)
        expect(label.exists(), `label for ${id} should exist`).toBe(true)
      }
    })
  })

  // ============================================
  // Required-field validation
  // ============================================
  describe('Required fields', () => {
    it('flags empty name as required with an accessible error', async () => {
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      const nameInput = wrapper.find('#name')
      expect(nameInput.attributes('aria-invalid')).toBe('true')
      expect(nameInput.attributes('aria-describedby')).toBe('name-error')
      const error = wrapper.find('#name-error')
      expect(error.exists()).toBe(true)
      expect(error.attributes('role')).toBe('alert')
      expect(error.text()).toBe('Name is required.')
    })

    it('flags empty phone, company, email as required on submit', async () => {
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.find('#phone-error').text()).toBe('Phone is required.')
      expect(wrapper.find('#company-error').text()).toBe('Company is required.')
      expect(wrapper.find('#email-error').text()).toBe('Email is required.')
    })

    it('flags the privacy checkbox as required when unchecked', async () => {
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      const error = wrapper.find('#privacy-error')
      expect(error.exists()).toBe(true)
      expect(error.text()).toBe('You must agree to the privacy policy.')
    })
  })

  // ============================================
  // Field-specific rules
  // ============================================
  describe('Field-specific rules', () => {
    it('rejects a one-character name as too short', async () => {
      const vm = wrapper.vm as any
      vm.formData.name = 'A'
      vm.formData.phone = validFormData.phone
      vm.formData.company = validFormData.company
      vm.formData.email = validFormData.email
      vm.formData.privacy = true
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.find('#name-error').text()).toBe(
        'Name must be at least 2 characters.',
      )
    })

    it('rejects an invalid email format', async () => {
      const vm = wrapper.vm as any
      vm.formData.name = validFormData.name
      vm.formData.phone = validFormData.phone
      vm.formData.company = validFormData.company
      vm.formData.email = 'not-an-email'
      vm.formData.privacy = true
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.find('#email-error').text()).toBe(
        'Please enter a valid email address.',
      )
      const emailInput = wrapper.find('#email')
      expect(emailInput.attributes('aria-invalid')).toBe('true')
      expect(emailInput.attributes('aria-describedby')).toBe('email-error')
    })

    it('rejects a phone number with letters', async () => {
      const vm = wrapper.vm as any
      vm.formData.name = validFormData.name
      vm.formData.phone = '123abc'
      vm.formData.company = validFormData.company
      vm.formData.email = validFormData.email
      vm.formData.privacy = true
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.find('#phone-error').text()).toBe(
        'Phone must contain only digits.',
      )
    })
  })

  // ============================================
  // Submit blocking + success
  // ============================================
  describe('Submission', () => {
    it('does not show a success message when the form is invalid', async () => {
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      // Only the error banner is shown, not the success banner.
      const messages = wrapper.findAll('.submit-message')
      expect(messages.length).toBe(1)
      expect(messages[0].classes()).toContain('error')
      expect(wrapper.vm.submitStatus.type).toBe('error')
    })

    it('submits successfully when valid and resets the form', async () => {
      const vm = wrapper.vm as any
      Object.assign(vm.formData, validFormData)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      // Loading state engaged.
      expect(wrapper.vm.isSubmitting).toBe(true)
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()

      // Resolve the mock API timer.
      vi.advanceTimersByTime(2000)
      await flushPromises()

      expect(wrapper.vm.submitStatus.type).toBe('success')
      // Form reset.
      expect(vm.formData.name).toBe('')
      expect(vm.formData.email).toBe('')
      expect(vm.formData.privacy).toBe(false)
    })

    it('clears field errors before re-validating on each submit', async () => {
      // First submit: name required.
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()
      expect(wrapper.find('#name-error').exists()).toBe(true)

      // Fix the name and resubmit.
      const vm = wrapper.vm as any
      Object.assign(vm.formData, validFormData)
      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.find('#name-error').exists()).toBe(false)
    })
  })
})
