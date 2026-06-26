<template>
  <main class="service-big-data" role="main">
    <!-- Skeleton State -->
    <div v-if="isLoading" class="skeleton-container">
      <div class="skeleton-hero"></div>
      <div class="skeleton-grid">
        <div v-for="i in 3" :key="i" class="skeleton-card"></div>
      </div>
      <div class="skeleton-content"></div>
    </div>

    <!-- Actual Content -->
    <Transition name="content-fade">
      <div v-if="!isLoading" class="content-wrapper">
        <!-- Hero Section -->
        <section class="hero-section" aria-labelledby="hero-title">
          <div class="hero-icon" aria-hidden="true">☁️</div>
          <h1 id="hero-title" class="hero-title">{{ t('bigData.hero.title') }}</h1>
          <p class="hero-subtitle">{{ t('bigData.hero.subtitle') }}</p>
          <div class="hero-description">
            <p>{{ t('bigData.hero.description') }}</p>
          </div>
        </section>

        <!-- Key Features Grid -->
        <section class="features-section" aria-labelledby="features-title">
          <h2 id="features-title" class="section-title">{{ t('bigData.features.title') }}</h2>
          <div class="features-grid">
            <article
              v-for="(feature, index) in features"
              :key="feature.title"
              class="feature-card fade-in stagger"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="feature-icon" :aria-hidden="true">{{ feature.icon }}</div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </article>
          </div>
        </section>

        <!-- Technical Capabilities -->
        <section class="capabilities-section" aria-labelledby="capabilities-title">
          <h2 id="capabilities-title" class="section-title">{{ t('bigData.capabilities.title') }}</h2>
          <div class="capabilities-list">
            <div
              v-for="(capability, index) in capabilities"
              :key="capability.name"
              class="capability-item"
            >
              <div class="capability-header">
                <div class="capability-icon" aria-hidden="true">◈</div>
                <h3 class="capability-name">{{ capability.name }}</h3>
              </div>
              <p class="capability-description">{{ capability.description }}</p>
              <div class="capability-tech">
                <span
                  v-for="tech in capability.technologies"
                  :key="tech"
                  class="tech-tag"
                >{{ tech }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Use Cases -->
        <section class="use-cases-section" aria-labelledby="use-cases-title">
          <h2 id="use-cases-title" class="section-title">{{ t('bigData.useCases.title') }}</h2>
          <div class="use-cases-grid">
            <article
              v-for="(useCase, index) in useCases"
              :key="useCase.title"
              class="use-case-card"
            >
              <div class="use-case-icon" aria-hidden="true">{{ useCase.icon }}</div>
              <h3 class="use-case-title">{{ useCase.title }}</h3>
              <p class="use-case-description">{{ useCase.description }}</p>
              <ul class="use-case-benefits">
                <li
                  v-for="benefit in useCase.benefits"
                  :key="benefit"
                  class="benefit-item"
                >
                  <span aria-hidden="true">✓</span> {{ benefit }}
                </li>
              </ul>
            </article>
          </div>
        </section>

        <!-- Statistics -->
        <section class="stats-section" aria-labelledby="stats-title">
          <h2 id="stats-title" class="visually-hidden">{{ t('bigData.stats.title') }}</h2>
          <div class="stats-grid">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="stat-item"
            >
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section" aria-labelledby="cta-title">
          <h2 id="cta-title" class="cta-title">{{ t('bigData.cta.title') }}</h2>
          <p class="cta-description">{{ t('bigData.cta.description') }}</p>
          <div class="cta-actions">
            <a href="/contact" class="cta-button primary">
              {{ t('bigData.cta.primary') }}
            </a>
            <a href="/about" class="cta-button secondary">
              {{ t('bigData.cta.secondary') }}
            </a>
          </div>
        </section>
      </div>
    </Transition>
  </main>
</template>

<script setup>
/**
 * @component ServiceBigData
 * @description Big Data & AI service detail page with cyberpunk theme
 *
 * @example
 * <ServiceBigData />
 */

import { ref, onMounted } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import { useSkeleton } from '../composables/useSkeleton'

// Composables
const { t } = useLanguage()
const { isLoading } = useSkeleton({ immediate: true })

// Features data
const features = ref([
  {
    icon: '🧠',
    title: t('bigData.features.aiLearning'),
    description: t('bigData.features.aiLearningDesc')
  },
  {
    icon: '📊',
    title: t('bigData.features.dataAnalytics'),
    description: t('bigData.features.dataAnalyticsDesc')
  },
  {
    icon: '🤖',
    title: t('bigData.features.machineLearning'),
    description: t('bigData.features.machineLearningDesc')
  },
  {
    icon: '☁️',
    title: t('bigData.features.cloudComputing'),
    description: t('bigData.features.cloudComputingDesc')
  },
  {
    icon: '🔮',
    title: t('bigData.features.predictiveAnalytics'),
    description: t('bigData.features.predictiveAnalyticsDesc')
  },
  {
    icon: '🛡️',
    title: t('bigData.features.dataSecurity'),
    description: t('bigData.features.dataSecurityDesc')
  }
])

// Technical capabilities
const capabilities = ref([
  {
    name: t('bigData.capabilities.dataProcessing'),
    description: t('bigData.capabilities.dataProcessingDesc'),
    technologies: ['Apache Spark', 'Hadoop', 'Kafka', 'Flink']
  },
  {
    name: t('bigData.capabilities.aiModels'),
    description: t('bigData.capabilities.aiModelsDesc'),
    technologies: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras']
  },
  {
    name: t('bigData.capabilities.naturalLanguage'),
    description: t('bigData.capabilities.naturalLanguageDesc'),
    technologies: ['BERT', 'GPT', 'Word2Vec', 'NLTK']
  },
  {
    name: t('bigData.capabilities.computerVision'),
    description: t('bigData.capabilities.computerVisionDesc'),
    technologies: ['OpenCV', 'YOLO', 'ResNet', 'CNN']
  }
])

// Use cases
const useCases = ref([
  {
    icon: '💰',
    title: t('bigData.useCases.fintech'),
    description: t('bigData.useCases.fintechDesc'),
    benefits: [
      t('bigData.useCases.fintechBenefit1'),
      t('bigData.useCases.fintechBenefit2'),
      t('bigData.useCases.fintechBenefit3')
    ]
  },
  {
    icon: '🏭',
    title: t('bigData.useCases.manufacturing'),
    description: t('bigData.useCases.manufacturingDesc'),
    benefits: [
      t('bigData.useCases.manufacturingBenefit1'),
      t('bigData.useCases.manufacturingBenefit2'),
      t('bigData.useCases.manufacturingBenefit3')
    ]
  },
  {
    icon: '🏥',
    title: t('bigData.useCases.healthcare'),
    description: t('bigData.useCases.healthcareDesc'),
    benefits: [
      t('bigData.useCases.healthcareBenefit1'),
      t('bigData.useCases.healthcareBenefit2'),
      t('bigData.useCases.healthcareBenefit3')
    ]
  }
])

// Statistics
const stats = ref([
  { value: '99.9%', label: t('bigData.stats.uptime') },
  { value: '10M+', label: t('bigData.stats.records') },
  { value: '<50ms', label: t('bigData.stats.latency') },
  { value: '50+', label: t('bigData.stats.models') }
])

// SEO metadata
onMounted(() => {
  document.title = t('bigData.seo.title')
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', t('bigData.seo.description'))
  }
})
</script>

<style scoped>
.service-big-data {
  min-height: 100vh;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

/* Skeleton Container */
.skeleton-container {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.skeleton-hero {
  height: 300px;
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.skeleton-card {
  height: 200px;
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-content {
  height: 400px;
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  position: relative;
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.1) 0%, rgba(255, 0, 255, 0.05) 100%);
  border-radius: 16px;
  margin-bottom: 3rem;
  border: 1px solid rgba(0, 255, 204, 0.3);
}

.hero-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.hero-title {
  font-family: var(--font-display);
  font-size: 3rem;
  color: var(--cyan);
  text-shadow: 0 0 30px var(--cyan), 0 0 60px rgba(0, 255, 204, 0.5);
  margin-bottom: 1rem;
  letter-spacing: 2px;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--magenta);
  margin-bottom: 1.5rem;
  text-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
}

.hero-description {
  max-width: 800px;
  margin: 0 auto;
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 1.1rem;
}

/* Section Styling */
.section-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--cyan);
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px var(--cyan);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), transparent);
}

/* Features Section */
.features-section {
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(13, 26, 45, 0.6);
  border: 1px solid rgba(0, 255, 204, 0.2);
  padding: 2rem;
  border-radius: 12px;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 204, 0.1), transparent);
  transition: left 0.6s ease;
}

.feature-card:hover::before {
  left: 100%;
}

.feature-card:hover {
  border-color: rgba(0, 255, 204, 0.5);
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 255, 204, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: inline-block;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Capabilities Section */
.capabilities-section {
  margin-bottom: 4rem;
  padding: 3rem;
  background: rgba(255, 0, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 0, 255, 0.2);
}

.capabilities-list {
  display: grid;
  gap: 2rem;
}

.capability-item {
  background: rgba(13, 26, 45, 0.6);
  border-left: 3px solid var(--magenta);
  padding: 1.5rem;
  border-radius: 0 8px 8px 0;
  transition: all 0.3s ease;
}

.capability-item:hover {
  border-left-color: var(--cyan);
  transform: translateX(5px);
}

.capability-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.capability-icon {
  font-size: 1.5rem;
  color: var(--magenta);
}

.capability-name {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--text-primary);
  margin: 0;
}

.capability-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.capability-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  background: rgba(0, 255, 204, 0.1);
  border: 1px solid rgba(0, 255, 204, 0.3);
  color: var(--cyan);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: monospace;
}

/* Use Cases Section */
.use-cases-section {
  margin-bottom: 4rem;
}

.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.use-case-card {
  background: linear-gradient(135deg, rgba(13, 26, 45, 0.8) 0%, rgba(26, 13, 45, 0.8) 100%);
  border: 1px solid rgba(0, 255, 204, 0.2);
  padding: 2rem;
  border-radius: 12px;
  transition: all 0.4s ease;
}

.use-case-card:hover {
  border-color: rgba(255, 0, 255, 0.5);
  transform: scale(1.02);
  box-shadow: 0 15px 35px rgba(255, 0, 255, 0.15);
}

.use-case-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.use-case-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--cyan);
  margin-bottom: 0.75rem;
}

.use-case-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.use-case-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefit-item {
  color: var(--text-secondary);
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 255, 204, 0.1);
}

.benefit-item:last-child {
  border-bottom: none;
}

.benefit-item span {
  color: var(--cyan);
  margin-right: 0.5rem;
  font-weight: bold;
}

/* Stats Section */
.stats-section {
  margin-bottom: 4rem;
  padding: 3rem;
  background: linear-gradient(135deg, rgba(0, 255, 204, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%);
  border-radius: 16px;
  border: 1px solid rgba(0, 255, 204, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--cyan);
  text-shadow: 0 0 20px var(--cyan);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* CTA Section */
.cta-section {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(255, 0, 255, 0.1) 0%, rgba(0, 255, 204, 0.1) 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 0, 255, 0.3);
  margin-bottom: 3rem;
}

.cta-title {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.cta-description {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
  border: 2px solid;
}

.cta-button.primary {
  background: var(--cyan);
  color: var(--bg-primary);
  border-color: var(--cyan);
}

.cta-button.primary:hover {
  background: transparent;
  color: var(--cyan);
  box-shadow: 0 0 20px rgba(0, 255, 204, 0.5);
}

.cta-button.secondary {
  background: transparent;
  color: var(--magenta);
  border-color: var(--magenta);
}

.cta-button.secondary:hover {
  background: var(--magenta);
  color: var(--bg-primary);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
}

/* Animations */
.fade-in {
  animation: fadeIn 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stagger:nth-child(1) { animation-delay: 0.1s; }
.stagger:nth-child(2) { animation-delay: 0.2s; }
.stagger:nth-child(3) { animation-delay: 0.3s; }
.stagger:nth-child(4) { animation-delay: 0.4s; }
.stagger:nth-child(5) { animation-delay: 0.5s; }
.stagger:nth-child(6) { animation-delay: 0.6s; }

/* Content Fade Transition */
.content-fade-enter-active {
  transition: opacity 0.4s ease;
}

.content-fade-enter-from {
  opacity: 0;
}

.content-fade-enter-to {
  opacity: 1;
}

/* Accessibility */
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

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .hero-section {
    padding: 2rem 1rem;
  }

  .hero-icon {
    font-size: 3rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .features-grid,
  .use-cases-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .capabilities-section {
    padding: 1.5rem;
  }

  .cta-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .cta-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .feature-card,
  .use-case-card {
    padding: 1.5rem;
  }
}
</style>
