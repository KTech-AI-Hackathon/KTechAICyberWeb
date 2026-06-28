import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Global theme (CSS variables + reset) — required by all components.
// Without this the SPA renders unstyled because component styles reference
// var(--cyan), var(--font-display), etc. defined in assets/styles/variables.css.
import './assets/styles/main.css'

import App from './App.vue'

// Home is the LCP route AND the entry view users hit on '/'. It MUST be eager:
// its JS and CSS land in the synchronous initial bundle so the footer's layout
// is stable from first paint. Lazy-loading Home (#18) split its CSS into a
// separate async chunk that arrived after initial paint and re-flowed
// footer.cyber-footer, spiking CLS from 0.054 (passing) to 0.196 (failing >
// 0.1). Keeping Home eager fixes the CLS regression while preserving the
// LCP/FCP wins (LCP 2539->1861ms, FCP 2539->1684ms) — those gains come from
// the OTHER 17 routes below being lazy, not from Home.
import Home from './views/Home.vue'

// Route-level code splitting: every non-Home view is a lazy dynamic import so
// Vite emits it as its own small chunk, fetched on demand when the route is
// hit. This replaces the previous single ~243 kB index bundle: the entry now
// only carries App + router + Home, and the heavy views (Services, News,
// PositionList, ...) no longer bloat the initial download. The catch-all keeps
// the 'not-found' name and NotFound view (#140 blank-page fix) — the lazy
// import path './views/NotFound.vue' still contains the literal 'NotFound', so
// the router-base.spec.js text contract still matches.
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: () => import('./views/About.vue') },
  { path: '/news', component: () => import('./views/News.vue') },
  { path: '/news/:slug', component: () => import('./views/NewsDetail.vue'), props: true },
  { path: '/services/supply-chain-finance', component: () => import('./views/SupplyChainFinance.vue') },
  { path: '/services/project-and-program-management', component: () => import('./views/ServiceProjectManagement.vue') },
  { path: '/services/blockchain', component: () => import('./views/Blockchain.vue') },
  { path: '/services/big-data-ai', component: () => import('./views/ServiceBigData.vue') },
  { path: '/services/retail-lending', component: () => import('./views/ServiceRetailLending.vue') },
  { path: '/services/cross-border-payment', component: () => import('./views/ServiceCrossBorderPayment.vue') },
  { path: '/services/digital-asset-custody', component: () => import('./views/ServiceDigitalAssetCustody.vue') },
  { path: '/services/stablecoin', component: () => import('./views/ServiceStablecoin.vue') },
  { path: '/join-us', component: () => import('./views/JoinUs.vue') },
  { path: '/contact', component: () => import('./views/Contact.vue') },
  { path: '/careers', component: () => import('./views/PositionList.vue') },
  { path: '/privacy', component: () => import('./views/PrivacyPolicy.vue') },
  { path: '/terms', component: () => import('./views/Terms.vue') },
  // Catch-all: render NotFound for any unmatched path so deep links / typos
  // no longer render a blank page. (:pathMatch(.*)* is the vue-router 4 form.)
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFound.vue') }
]

// The app is deployed at the GitHub Pages subpath /KTechAICyberWeb/ (see the
// `base` in vite.config.js). createWebHistory() with no argument strips that
// prefix, so the router matched no route in production and the site rendered
// blank. import.meta.env.BASE_URL is the Vite base ('/KTechAICyberWeb/'), so
// the router now matches paths under the subpath. #140.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
