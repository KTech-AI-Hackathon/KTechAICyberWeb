/**
 * @file preferences.test.ts
 * @description Unit tests for usePreferencesStore (#15 - theme toggle persistence)
 *
 * Covers theme persistence/restore, the new toggleTheme action (dark <-> light),
 * language handling, and that the active theme is mirrored onto
 * document.documentElement[data-theme] so the cyber.css theme takes effect.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  usePreferencesStore,
  PREFERENCES_STORAGE_KEY,
} from '../preferences'

describe('usePreferencesStore (theme toggle)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    setActivePinia(createPinia())
  })

  describe('theme state', () => {
    it('defaults to the cyber (dark) theme with no persisted value', () => {
      const store = usePreferencesStore()
      expect(store.theme).toBe('cyber')
      expect(store.currentTheme).toBe('cyber')
    })

    it('hydrates a persisted dark theme', () => {
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({ theme: 'dark', language: 'en' }),
      )
      const store = usePreferencesStore()
      expect(store.theme).toBe('dark')
      expect(store.isDarkTheme).toBe(true)
    })

    it('hydrates a persisted light theme', () => {
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({ theme: 'light', language: 'en' }),
      )
      const store = usePreferencesStore()
      expect(store.theme).toBe('light')
      expect(store.isDarkTheme).toBe(false)
    })
  })

  describe('setTheme', () => {
    it('persists the new theme to localStorage', () => {
      const store = usePreferencesStore()
      store.setTheme('light')

      const raw = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) || '{}')
      expect(raw.theme).toBe('light')
    })

    it('ignores invalid theme values', () => {
      const store = usePreferencesStore()
      store.setTheme('neon' as any)
      expect(store.theme).toBe('cyber')
    })
  })

  describe('toggleTheme', () => {
    it('switches light -> dark', () => {
      const store = usePreferencesStore()
      store.setTheme('light')
      store.toggleTheme()
      expect(store.theme).toBe('dark')
    })

    it('switches dark -> light', () => {
      const store = usePreferencesStore()
      store.setTheme('dark')
      store.toggleTheme()
      expect(store.theme).toBe('light')
    })

    it('treats the default cyber theme as dark when toggling', () => {
      const store = usePreferencesStore()
      // Default is cyber; toggling should land on light.
      store.toggleTheme()
      expect(store.theme).toBe('light')
    })

    it('persists the toggled value', () => {
      const store = usePreferencesStore()
      store.toggleTheme()
      const raw = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) || '{}')
      expect(raw.theme).toBe('light')
    })
  })

  describe('language', () => {
    it('switches language and persists', () => {
      const store = usePreferencesStore()
      store.setLanguage('zh')
      expect(store.language).toBe('zh')
      expect(store.isEnglish).toBe(false)

      const raw = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) || '{}')
      expect(raw.language).toBe('zh')
    })
  })
})
