<template>
  <div class="home">
    <!-- Hero Section -->
    <Hero />

    <!-- Services Section -->
    <Services />

    <!-- Honors Section -->
    <Honors />

    <!-- Culture Section -->
    <Culture />

    <!-- Contact Section -->
    <Contact />
  </div>
</template>

<script setup>
/**
 * @view Home
 * @description Main home page with all sections
 *
 * @example
 * <Home />
 */

import { onMounted, onUnmounted } from 'vue'
import Hero from '../components/Hero.vue'
import Services from '../components/Services.vue'
import Honors from '../components/Honors.vue'
import Culture from '../components/Culture.vue'
import Contact from '../components/Contact.vue'

// Initialize fade-in animations
let observer = null

onMounted(() => {
  // Setup IntersectionObserver for fade-in animations
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  )

  // Observe all fade-in elements
  document.querySelectorAll('.fade-in').forEach((el) => {
    observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
