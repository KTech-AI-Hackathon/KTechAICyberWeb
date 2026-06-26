<template>
  <main class="service-retail-lending" role="main">
    <!-- Skeleton State -->
    <div v-if="isLoading" class="skeleton-container">
      <div class="skeleton-hero"></div>
      <div class="skeleton-grid">
        <div v-for="i in 4" :key="i" class="skeleton-card"></div>
      </div>
    </div>

    <!-- Actual Content -->
    <Transition name="content-fade">
      <div v-if="!isLoading" class="content-wrapper">
        <!-- Hero Section -->
        <section class="hero-section" aria-labelledby="hero-title">
          <div class="hero-icon" aria-hidden="true">💳</div>
          <h1 id="hero-title" class="hero-title">{{ t('services.retailLending.title') }}</h1>
          <p class="hero-subtitle">{{ t('services.retailLending.subtitle') }}</p>
        </section>

        <!-- Overview Section -->
        <section class="overview-section" aria-labelledby="overview-title">
          <h2 id="overview-title" class="section-title">{{ t('services.retailLending.overview.title') }}</h2>
          <p class="overview-text">{{ t('services.retailLending.overview.text') }}</p>
        </section>

        <!-- Metrics Section -->
        <section class="metrics-section" aria-labelledby="metrics-title">
          <h2 id="metrics-title" class="section-title">{{ t('services.retailLending.metrics.title') }}</h2>
          <div class="metrics-grid">
            <div
              v-for="metric in metrics"
              :key="metric.label"
              class="metric-card"
            >
              <div class="circular-progress" :style="{'--progress': metric.value / 100}">
                <svg viewBox="0 0 36 36" class="progress-ring">
                  <path
                    class="progress-ring-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="progress-ring-progress"
                    :stroke-dasharray="`${metric.value}, 100`"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div class="metric-value">
                  <span class="metric-number">{{ metric.value }}%</span>
                </div>
              </div>
              <p class="metric-label">{{ metric.label }}</p>
            </div>
          </div>
        </section>

        <!-- Core Features Grid -->
        <section class="features-section" aria-labelledby="features-title">
          <h2 id="features-title" class="section-title">{{ t('services.retailLending.features.title') }}</h2>
          <div class="features-grid">
            <article
              v-for="(feature, index) in features"
              :key="feature.title"
              class="feature-card fade-in stagger"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="feature-icon" aria-hidden="true">{{ feature.icon }}</div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </article>
          </div>
        </section>

        <!-- Loan Types Section -->
        <section class="loan-types-section" aria-labelledby="loan-types-title">
          <h2 id="loan-types-title" class="section-title">{{ t('services.retailLending.loanTypes.title') }}</h2>
          <div class="loan-types-grid">
            <article
              v-for="loanType in loanTypes"
              :key="loanType.title"
              class="loan-type-card"
            >
              <div class="loan-type-icon" aria-hidden="true">{{ loanType.icon }}</div>
              <h3 class="loan-type-title">{{ loanType.title }}</h3>
              <p class="loan-type-description">{{ loanType.description }}</p>
            </article>
          </div>
        </section>

        <!-- Technical Features -->
        <section class="technical-section" aria-labelledby="technical-title">
          <h2 id="technical-title" class="section-title">{{ t('services.retailLending.technical.title') }}</h2>
          <div class="technical-list">
            <div
              v-for="(tech, index) in technicalFeatures"
              :key="tech.name"
              class="technical-item"
            >
              <div class="technical-number">{{ index + 1 }}</div>
              <div class="technical-content">
                <h3 class="technical-name">{{ tech.name }}</h3>
                <p class="technical-description">{{ tech.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section" aria-labelledby="cta-title">
          <h2 id="cta-title" class="visually-hidden">{{ t('services.retailLending.cta.title') }}</h2>
          <p class="cta-text">{{ t('services.retailLending.cta.text') }}</p>
          <router-link to="/contact" class="cta-button">
            {{ t('services.retailLending.cta.button') }}
          </router-link>
        </section>
      </div>
    </Transition>
  </main>
</template>

<script setup>
/**
 * @component ServiceRetailLending
 * @description Service detail page for Retail Lending Solution (数字零售贷款平台)
 *
 * @example
 * <ServiceRetailLending />
 */

import { useSkeleton } from '../composables/useSkeleton'

// Skeleton loading state
const { isLoading } = useSkeleton({ immediate: false })

// Metrics data
const metrics = [
  { value: 80, label: t('services.retailLending.metrics.approval') },
  { value: 70, label: t('services.retailLending.metrics.automation') }
]

// Core features data
const features = [
  {
    icon: '🤖',
    title: t('services.retailLending.features.aiRisk.title'),
    description: t('services.retailLending.features.aiRisk.desc')
  },
  {
    icon: '⚡',
    title: t('services.retailLending.features.automation.title'),
    description: t('services.retailLending.features.automation.desc')
  },
  {
    icon: '🔧',
    title: t('services.retailLending.features.baas.title'),
    description: t('services.retailLending.features.baas.desc')
  },
  {
    icon: '🛡️',
    title: t('services.retailLending.features.antifraud.title'),
    description: t('services.retailLending.features.antifraud.desc')
  }
]

// Loan types data
const loanTypes = [
  {
    icon: '👤',
    title: t('services.retailLending.loanTypes.personal.title'),
    description: t('services.retailLending.loanTypes.personal.desc')
  },
  {
    icon: '🏢',
    title: t('services.retailLending.loanTypes.sme.title'),
    description: t('services.retailLending.loanTypes.sme.desc')
  },
  {
    icon: '🤝',
    title: t('services.retailLending.loanTypes.joint.title'),
    description: t('services.retailLending.loanTypes.joint.desc')
  }
]

// Technical features data
const technicalFeatures = [
  {
    name: t('services.retailLending.technical.onboarding.title'),
    description: t('services.retailLending.technical.onboarding.desc')
  },
  {
    name: t('services.retailLending.technical.decisioning.title'),
    description: t('services.retailLending.technical.decisioning.desc')
  },
  {
    name: t('services.retailLending.technical.lifecycle.title'),
    description: t('services.retailLending.technical.lifecycle.desc')
  },
  {
    name: t('services.retailLending.technical.api.title'),
    description: t('services.retailLending.technical.api.desc')
  },
  {
    name: t('services.retailLending.technical.security.title'),
    description: t('services.retailLending.technical.security.desc')
  }
]

// Translation helper
const t = (key) => {
  const translations = {
    'services.retailLending.title': 'Retail Lending Solution',
    'services.retailLending.subtitle': 'Digital Retail Lending Platform',
    'services.retailLending.overview.title': 'Our Platform',
    'services.retailLending.overview.text': 'End-to-end retail lending system with AI-powered credit risk assessment and automated decisioning.',
    'services.retailLending.metrics.title': 'Performance Metrics',
    'services.retailLending.metrics.approval': 'Auto Approval Rate',
    'services.retailLending.metrics.automation': 'Process Automation',
    'services.retailLending.features.title': 'Core Features',
    'services.retailLending.features.aiRisk.title': 'AI Risk Engine',
    'services.retailLending.features.aiRisk.desc': 'Machine learning models for accurate risk assessment',
    'services.retailLending.features.automation.title': 'End-to-End Automation',
    'services.retailLending.features.automation.desc': 'Streamlined loan application and approval process',
    'services.retailLending.features.baas.title': 'Banking-as-a-Service',
    'services.retailLending.features.baas.desc': 'Flexible integration for partners and platforms',
    'services.retailLending.features.antifraud.title': 'Anti-Fraud Detection',
    'services.retailLending.features.antifraud.desc': 'Real-time fraud prevention and security',
    'services.retailLending.loanTypes.title': 'Loan Products',
    'services.retailLending.loanTypes.personal.title': 'Personal Loans',
    'services.retailLending.loanTypes.personal.desc': 'Flexible personal lending solutions',
    'services.retailLending.loanTypes.sme.title': 'SME Loans',
    'services.retailLending.loanTypes.sme.desc': 'Business financing for growth',
    'services.retailLending.loanTypes.joint.title': 'Joint Lending',
    'services.retailLending.loanTypes.joint.desc': 'Co-branded lending partnerships',
    'services.retailLending.technical.title': 'Technical Capabilities',
    'services.retailLending.technical.onboarding.title': 'Digital Onboarding',
    'services.retailLending.technical.onboarding.desc': 'Paperless KYC and instant account setup',
    'services.retailLending.technical.decisioning.title': 'Real-time Decisioning',
    'services.retailLending.technical.decisioning.desc': 'AI-powered credit decisions in seconds',
    'services.retailLending.technical.lifecycle.title': 'Loan Lifecycle Management',
    'services.retailLending.technical.lifecycle.desc': 'From application to repayment tracking',
    'services.retailLending.technical.api.title': 'Open API Integration',
    'services.retailLending.technical.api.desc': 'RESTful APIs for seamless integration',
    'services.retailLending.technical.security.title': 'Enterprise Security',
    'services.retailLending.technical.security.desc': 'Bank-grade encryption and compliance',
    'services.retailLending.cta.title': 'Contact Us',
    'services.retailLending.cta.text': 'Ready to transform your retail lending operations? Let\'s talk.',
    'services.retailLending.cta.button': 'Get in Touch'
  }
  return translations[key] || key
}
</script>

<style scoped>
.service-retail-lending {
  min-height: 100vh;
  background: rgba(10, 15, 28, 0.95);
  position: relative;
  overflow-x: hidden;
}

.service-retail-lending::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(0, 255, 204, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 6rem 2rem 4rem;
  position: relative;
  z-index: 1;
}

.hero-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 20px rgba(0, 255, 204, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-title {
  font-family: var(--font-display);
  font-size: 3rem;
  color: var(--cyan);
  margin-bottom: 1rem;
  text-shadow: 0 0 30px rgba(0, 255, 204, 0.5);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--magenta);
  margin-bottom: 2rem;
  text-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
}

/* Overview Section */
.overview-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
}

.overview-text {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 1.1rem;
}

/* Section Titles */
.section-title {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--cyan);
  text-align: center;
  margin-bottom: 3rem;
  text-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
  position: relative;
  z-index: 1;
}

/* Metrics Section */
.metrics-section {
  padding: 4rem 2rem;
  position: relative;
  z-index: 1;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.metric-card {
  background: rgba(13, 26, 45, 0.6);
  border: 1px solid rgba(0, 255, 204, 0.2);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: rgba(0, 255, 204, 0.5);
  box-shadow: 0 0 30px rgba(0, 255, 204, 0.2);
}

.circular-progress {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: rgba(0, 255, 204, 0.1);
  stroke-width: 2;
}

.progress-ring-progress {
  fill: none;
  stroke: var(--cyan);
  stroke-width: 2;
  stroke-linecap: round;
  filter: drop-shadow(0 0 8px var(--cyan));
  animation: progressAnimation 1.5s ease-out;
}

@keyframes progressAnimation {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}

.metric-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.metric-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--cyan);
  text-shadow: 0 0 10px var(--cyan);
}

.metric-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Features Section */
.features-section {
  padding: 4rem 2rem;
  position: relative;
  z-index: 1;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(13, 26, 45, 0.6);
  border: 1px solid rgba(0, 255, 204, 0.2);
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 255, 204, 0.5);
  box-shadow: 0 10px 30px rgba(0, 255, 204, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Loan Types Section */
.loan-types-section {
  padding: 4rem 2rem;
  position: relative;
  z-index: 1;
}

.loan-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loan-type-card {
  background: rgba(13, 26, 45, 0.6);
  border: 1px solid rgba(255, 0, 255, 0.2);
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.loan-type-card:hover {
  border-color: rgba(255, 0, 255, 0.5);
  box-shadow: 0 10px 30px rgba(255, 0, 255, 0.15);
}

.loan-type-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.loan-type-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.loan-type-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Technical Section */
.technical-section {
  padding: 4rem 2rem;
  position: relative;
  z-index: 1;
}

.technical-list {
  max-width: 900px;
  margin: 0 auto;
}

.technical-item {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.technical-number {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--magenta);
  min-width: 50px;
  text-align: center;
  text-shadow: 0 0 15px rgba(255, 0, 255, 0.4);
}

.technical-content {
  flex: 1;
}

.technical-name {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.technical-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  text-align: center;
  padding: 4rem 2rem;
  position: relative;
  z-index: 1;
}

.cta-text {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, var(--cyan), var(--magenta));
  color: var(--bg-primary);
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 255, 204, 0.5);
}

/* Content Fade Transition */
.content-fade-enter-active {
  transition: opacity 0.5s ease;
}

.content-fade-enter-from {
  opacity: 0;
}

.content-fade-enter-to {
  opacity: 1;
}

.content-wrapper {
  min-height: 100vh;
  position: relative;
}

/* Fade In Animation */
.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.stagger {
  animation-delay: var(--stagger-delay, 0s);
}

/* Skeleton Styles */
.skeleton-container {
  padding: 2rem;
}

.skeleton-hero {
  height: 200px;
  background: linear-gradient(90deg, rgba(0, 255, 204, 0.1) 25%, rgba(0, 255, 204, 0.2) 50%, rgba(0, 255, 204, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.skeleton-card {
  height: 200px;
  background: linear-gradient(90deg, rgba(0, 255, 204, 0.1) 25%, rgba(0, 255, 204, 0.2) 50%, rgba(0, 255, 204, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-content {
  height: 300px;
  background: linear-gradient(90deg, rgba(0, 255, 204, 0.1) 25%, rgba(0, 255, 204, 0.2) 50%, rgba(0, 255, 204, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .features-grid,
  .loan-types-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>