<template>
  <div id="app">
    <!-- JSON-LD Structured Data -->
    <component
      v-for="(schema, index) in structuredData"
      :key="index"
      :is="'script'"
      type="application/ld+json"
      v-text="JSON.stringify(schema)"
    />

    <!-- Loading Screen -->
    <LoadingScreen />

    <!-- Scanlines Effect -->
    <Scanlines />

    <!-- Main Navigation -->
    <Header />

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
/**
 * @component App
 * @description Root application component with SEO and structured layout
 *
 * @example
 * <App />
 */

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { getRouteMeta, getStructuredData } from './utils/seo'

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import Scanlines from './components/Scanlines.vue'

const route = useRoute()

const currentMeta = computed(() => getRouteMeta(route))
const structuredData = computed(() => getStructuredData(route))

// Update head meta tags reactively
useHead(() => ({
  title: currentMeta.value.title,
  meta: currentMeta.value.meta,
  link: currentMeta.value.link
}))
</script>

<style>
@import './assets/styles/main.css';
</style>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
