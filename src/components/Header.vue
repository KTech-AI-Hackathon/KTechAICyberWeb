<template>
  <nav class="nav" :class="{ 'scrolled': isScrolled }" id="navbar">
    <router-link to="/" class="nav-logo">
      KAI<span class="accent">TECH</span>
    </router-link>
    <ul class="nav-links">
      <li class="nav-dropdown" @mouseenter="handleDropdownEnter" @mouseleave="handleDropdownLeave">
        <button
          class="nav-dropdown-toggle"
          :aria-expanded="isDropdownOpen"
          :aria-haspopup="true"
          @click="toggleDropdown"
          @keydown.enter.prevent="toggleDropdown"
          @keydown.space.prevent="toggleDropdown"
          @keydown.escape="closeDropdown"
        >
          {{ t('nav.business') }}
          <span class="dropdown-arrow" :class="{ 'open': isDropdownOpen }">▼</span>
        </button>
        <transition name="dropdown">
          <ul
            v-if="isDropdownOpen"
            class="nav-dropdown-menu"
            role="menu"
            @keydown.up.prevent="focusPrevious($event)"
            @keydown.down.prevent="focusNext($event)"
            @keydown.escape="closeDropdown"
          >
            <li role="none">
              <router-link
                to="/services/project-management"
                class="dropdown-item"
                role="menuitem"
                @click="closeDropdown"
              >
                <span class="dropdown-icon">🏗️</span>
                {{ t('nav.projectManagement') }}
              </router-link>
            </li>
            <li role="none">
              <router-link
                to="/services/retail-credit"
                class="dropdown-item"
                role="menuitem"
                @click="closeDropdown"
              >
                <span class="dropdown-icon">💳</span>
                {{ t('nav.retailCredit') }}
              </router-link>
            </li>
            <li role="none">
              <router-link
                to="/services/supply-chain"
                class="dropdown-item"
                role="menuitem"
                @click="closeDropdown"
              >
                <span class="dropdown-icon">🔗</span>
                {{ t('nav.supplyChain') }}
              </router-link>
            </li>
            <li role="none">
              <router-link
                to="/services/blockchain"
                class="dropdown-item"
                role="menuitem"
                @click="closeDropdown"
              >
                <span class="dropdown-icon">⛓️</span>
                {{ t('nav.blockchain') }}
              </router-link>
            </li>
            <li role="none">
              <router-link
                to="/services/mobile-app"
                class="dropdown-item"
                role="menuitem"
                @click="closeDropdown"
              >
                <span class="dropdown-icon">📱</span>
                {{ t('nav.mobileApp') }}
              </router-link>
            </li>
            <li role="none">
              <router-link
                to="/services/big-data-ai"
                class="dropdown-item"
                role="menuitem"
                @click="closeDropdown"
              >
                <span class="dropdown-icon">☁️</span>
                {{ t('nav.bigData') }}
              </router-link>
            </li>
          </ul>
        </transition>
      </li>
      <li><router-link to="/news">{{ t('nav.news') }}</router-link></li>
      <li><router-link to="/about">{{ t('nav.about') }}</router-link></li>
      <li><router-link to="/join-us">{{ t('nav.joinUs') }}</router-link></li>
    </ul>
  </nav>
</template>

<script setup>
/**
 * @component Header
 * @description Main navigation header with scroll-aware styling and dropdown menu
 *
 * @example
 * <Header />
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const isScrolled = ref(false)
const isDropdownOpen = ref(false)

// Translations
const t = (key) => {
  const translations = {
    'nav.business': 'Our Business',
    'nav.projectManagement': 'Project Management',
    'nav.retailCredit': 'Retail Credit',
    'nav.supplyChain': 'Supply Chain',
    'nav.blockchain': 'Blockchain',
    'nav.mobileApp': 'Mobile App',
    'nav.bigData': 'Big Data & AI',
    'nav.news': 'News',
    'nav.about': 'About',
    'nav.joinUs': 'Join Us'
  }
  return translations[key] || key
}

// Dropdown methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleDropdownEnter = () => {
  isDropdownOpen.value = true
}

const handleDropdownLeave = () => {
  isDropdownOpen.value = false
}

const focusPrevious = (event) => {
  const items = event.currentTarget.querySelectorAll('.dropdown-item')
  const currentIndex = Array.from(items).indexOf(document.activeElement)
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
  items[prevIndex].focus()
}

const focusNext = (event) => {
  const items = event.currentTarget.querySelectorAll('.dropdown-item')
  const currentIndex = Array.from(items).indexOf(document.activeElement)
  const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
  items[nextIndex].focus()
}

// Handle scroll event
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

// Close dropdown on route change
router.afterEach(() => {
  closeDropdown()
})

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.nav {
  position: fixed;
  inset: 0 auto auto 0;
  right: 0;
  top: 0;
  z-index: var(--z-nav);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 4rem;
  background: rgba(10, 15, 28, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 255, 204, 0.2);
  transition: all 0.3s ease;
}

.nav.scrolled {
  padding: 1rem 4rem;
  box-shadow: 0 4px 20px rgba(0, 255, 204, 0.1);
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.1em;
  text-decoration: none;
  transition: color 0.3s ease;
  text-shadow: 0 0 10px transparent;
}

.nav-logo:hover {
  color: var(--cyan);
  text-shadow: 0 0 20px var(--cyan);
}

.nav-logo .accent {
  color: var(--cyan);
  text-shadow: 0 0 20px var(--cyan);
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  position: relative;
  padding: 0.25rem 0;
}

.nav-links a:hover,
.nav-links a:focus {
  color: var(--cyan);
  outline: none;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--cyan);
  transition: width 0.3s ease;
}

.nav-links a:hover::after,
.nav-links a:focus::after {
  width: 100%;
}

.nav-dropdown {
  position: relative;
}

.nav-dropdown-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  transition: color 0.3s ease;
}

.nav-dropdown-toggle:hover,
.nav-dropdown-toggle:focus {
  color: var(--cyan);
  outline: none;
}

.dropdown-arrow {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.nav-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 250px;
  background: rgba(10, 15, 28, 0.98);
  border: 1px solid rgba(0, 255, 204, 0.3);
  border-radius: 4px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  list-style: none;
  box-shadow: 0 4px 20px rgba(0, 255, 204, 0.2);
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.dropdown-item:hover,
.dropdown-item:focus {
  color: var(--cyan);
  background: rgba(0, 255, 204, 0.1);
  outline: none;
}

.dropdown-icon {
  font-size: 1.2rem;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .nav {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .nav-links {
    display: none;
  }
}
</style>
