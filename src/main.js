import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import About from './views/About.vue'
import News from './views/News.vue'
import NewsDetail from './views/NewsDetail.vue'

const routes = [
  { path: '/', component: Home, meta: { title: 'KTech AI - Home' } },
  { path: '/about', component: About, meta: { title: 'About KTech AI' } },
  { path: '/news', component: News, meta: { title: 'KTech AI News' } },
  { path: '/news/:slug', component: NewsDetail, props: true, meta: { title: 'News Detail' } },
  {
    path: '/services/project-management',
    component: () => import('./views/ServiceProjectManagement.vue'),
    meta: { title: 'Project Management Services - KTech AI' }
  },
  {
    path: '/services/retail-credit',
    component: () => import('./views/ServiceRetailLending.vue'),
    meta: { title: 'Retail Lending Solutions - KTech AI' }
  },
  {
    path: '/services/supply-chain',
    component: () => import('./views/SupplyChainFinance.vue'),
    meta: { title: 'Supply Chain Finance - KTech AI' }
  },
  {
    path: '/services/blockchain',
    component: () => import('./views/Blockchain.vue'),
    meta: { title: 'Blockchain Solutions - KTech AI' }
  },
  {
    path: '/services/mobile-app',
    component: () => import('./views/MobileApp.vue'),
    meta: { title: 'Mobile App Development - KTech AI' }
  },
  {
    path: '/services/big-data-ai',
    component: () => import('./views/ServiceBigData.vue'),
    meta: { title: 'Big Data & AI Solutions - KTech AI' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// SEO: Update page title on route change
router.beforeEach((to, from, next) => {
  const pageTitle = to.meta.title || 'KTech AI'
  document.title = pageTitle
  next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')
