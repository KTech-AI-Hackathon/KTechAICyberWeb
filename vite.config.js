import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const SITE_URL = 'https://jasonhou007.github.io/KTechAICyberWeb'

export default defineConfig({
  plugins: [vue()],
  base: '/KTechAICyberWeb/',
  server: {
    port: 3000
  },
  build: {
    // SEO optimization: generate source maps for better debugging
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Group the framework + shared-app deps into one long-lived,
          // strongly-cacheable vendor chunk so they are not re-fetched on
          // every route change. pinia/@vueuse are app-wide (used by App shell
          // + many routes), so pulling them out of the per-route chunks keeps
          // the route chunks small and the vendor chunk stable across deploys.
          vendor: ['vue', 'vue-router', 'pinia', '@vueuse/core', '@vueuse/head']
        }
      }
    }
  }
})
