import { ref, computed, onUnmounted, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useLanguage } from './useLanguage'

// Service-specific animation configurations
const serviceConfigs = {
  'supply-chain-finance': {
    type: 'supply-chain-finance',
    nodes: [
      { x: 0.1, y: 0.5, type: 'supplier', label: 'Supplier' },
      { x: 0.3, y: 0.3, type: 'manufacturer', label: 'Manufacturer' },
      { x: 0.5, y: 0.5, type: 'distributor', label: 'Distributor' },
      { x: 0.7, y: 0.7, type: 'retailer', label: 'Retailer' },
      { x: 0.9, y: 0.5, type: 'customer', label: 'Customer' }
    ],
    edges: [
      { from: 0, to: 1, type: 'goods' },
      { from: 1, to: 2, type: 'goods' },
      { from: 2, to: 3, type: 'goods' },
      { from: 3, to: 4, type: 'goods' },
      { from: 1, to: 2, type: 'financing' },
      { from: 2, to: 3, type: 'financing' }
    ],
    particles: [
      { type: 'goods', speed: 0.3, size: 4 },
      { type: 'financing', speed: 0.5, size: 3 }
    ],
    flashRate: 2
  },
  'big-data-ai': {
    type: 'big-data-ai',
    nodes: [
      { x: 0.1, y: 0.5, type: 'raw', label: 'Raw Data' },
      { x: 0.3, y: 0.3, type: 'clean', label: 'Clean Data' },
      { x: 0.5, y: 0.5, type: 'insights', label: 'Insights' },
      { x: 0.7, y: 0.7, type: 'predictions', label: 'Predictions' },
      { x: 0.9, y: 0.5, type: 'action', label: 'Action' }
    ],
    edges: [
      { from: 0, to: 1, type: 'pipeline' },
      { from: 1, to: 2, type: 'pipeline' },
      { from: 2, to: 3, type: 'pipeline' },
      { from: 3, to: 4, type: 'pipeline' },
      { from: 2, to: 3, type: 'feedback' }
    ],
    particles: [
      { type: 'data', speed: 0.4, size: 3 },
      { type: 'insight', speed: 0.6, size: 4 }
    ],
    flashRate: 2.5
  },
  'retail-lending': {
    type: 'retail-lending',
    nodes: [
      { x: 0.1, y: 0.5, type: 'application', label: 'Application' },
      { x: 0.3, y: 0.3, type: 'verification', label: 'Verification' },
      { x: 0.5, y: 0.5, type: 'assessment', label: 'Assessment' },
      { x: 0.7, y: 0.7, type: 'decision', label: 'Decision' },
      { x: 0.9, y: 0.5, type: 'disbursement', label: 'Disbursement' }
    ],
    edges: [
      { from: 0, to: 1, type: 'process' },
      { from: 1, to: 2, type: 'process' },
      { from: 2, to: 3, type: 'process' },
      { from: 3, to: 4, type: 'approved' }
    ],
    particles: [
      { type: 'application', speed: 0.35, size: 4 },
      { type: 'approved', speed: 0.45, size: 5 }
    ],
    flashRate: 2
  },
  'project-management': {
    type: 'project-management',
    columns: [
      { x: 0.15, label: 'Backlog' },
      { x: 0.38, label: 'In Progress' },
      { x: 0.62, label: 'Review' },
      { x: 0.85, label: 'Done' }
    ],
    cards: [
      { startColumn: 0, endColumn: 1, speed: 0.3 },
      { startColumn: 0, endColumn: 2, speed: 0.4 },
      { startColumn: 1, endColumn: 2, speed: 0.35 },
      { startColumn: 2, endColumn: 3, speed: 0.45 }
    ],
    flashRate: 1.5
  },
  'digital-asset-custody': {
    type: 'digital-asset-custody',
    vaults: [
      { x: 0.3, y: 0.3, type: 'hot', label: 'Hot Wallet' },
      { x: 0.5, y: 0.5, type: 'cold', label: 'Cold Storage' },
      { x: 0.7, y: 0.7, type: 'vault', label: 'Vault' }
    ],
    assets: [
      { type: 'btc', speed: 0.25, size: 4 },
      { type: 'eth', speed: 0.3, size: 3 }
    ],
    flashRate: 1.8
  },
  'stablecoin': {
    type: 'stablecoin',
    nodes: [
      { x: 0.1, y: 0.5, type: 'fiat', label: 'Fiat' },
      { x: 0.3, y: 0.3, type: 'mint', label: 'Mint' },
      { x: 0.5, y: 0.5, type: 'stablecoin', label: 'Stablecoin' },
      { x: 0.7, y: 0.7, type: 'reserve', label: 'Reserves' },
      { x: 0.9, y: 0.5, type: 'redeem', label: 'Redeem' }
    ],
    edges: [
      { from: 0, to: 1, type: 'deposit' },
      { from: 1, to: 2, type: 'mint' },
      { from: 2, to: 3, type: 'backing' },
      { from: 2, to: 4, type: 'redeem' },
      { from: 3, to: 4, type: 'release' }
    ],
    particles: [
      { type: 'fiat', speed: 0.3, size: 4 },
      { type: 'stablecoin', speed: 0.4, size: 3 }
    ],
    flashRate: 2
  },
  'cross-border-payment': {
    type: 'cross-border-payment',
    countries: [
      { x: 0.15, y: 0.5, code: 'CN', label: 'China' },
      { x: 0.4, y: 0.3, code: 'SG', label: 'Singapore' },
      { x: 0.6, y: 0.7, code: 'UK', label: 'UK' },
      { x: 0.85, y: 0.5, code: 'US', label: 'USA' }
    ],
    arcs: [
      { from: 0, to: 1, speed: 0.3 },
      { from: 1, to: 2, speed: 0.35 },
      { from: 2, to: 3, speed: 0.4 },
      { from: 0, to: 3, speed: 0.25 }
    ],
    flashRate: 2.2
  }
}

export function useServiceFlow(serviceType, canvasElement) {
  const { t } = useLanguage()

  // State
  const isAnimating = ref(false)
  const animationConfig = ref(serviceConfigs[serviceType] || { type: serviceType, flashRate: 2 })
  const reducedMotion = ref(false)
  const animationFrameId = ref(null)

  // Intersection Observer for performance
  const target = ref(canvasElement)
  const isIntersecting = ref(false)
  let observer = null

  // Animation state
  const particles = ref([])
  const time = ref(0)

  // Computed
  const ariaLabel = computed(() => {
    return t('services.animation.ariaLabel', {
      service: t(`services.${serviceType}.title`)
    })
  })

  const animationStatus = computed(() => {
    if (reducedMotion.value) return 'static'
    if (!isAnimating.value) return 'paused'
    return 'playing'
  })

  // Check for reduced motion preference
  function checkReducedMotion() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      reducedMotion.value = mediaQuery.matches

      const handler = (e) => {
        reducedMotion.value = e.matches
        if (reducedMotion.value) {
          stopAnimation()
        }
      }

      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
    return () => {}
  }

  // Initialize particles based on service type
  function initParticles() {
    const config = animationConfig.value
    const newParticles = []

    if (config.particles) {
      config.particles.forEach((p, i) => {
        newParticles.push({
          id: i,
          type: p.type,
          speed: p.speed,
          size: p.size,
          progress: Math.random(),
          edgeIndex: 0
        })
      })
    } else if (config.cards) {
      config.cards.forEach((card, i) => {
        newParticles.push({
          id: i,
          columnProgress: 0,
          targetColumn: card.endColumn,
          speed: card.speed
        })
      })
    } else if (config.assets) {
      config.assets.forEach((asset, i) => {
        newParticles.push({
          id: i,
          type: asset.type,
          speed: asset.speed,
          size: asset.size,
          vaultProgress: 0
        })
      })
    } else if (config.arcs) {
      config.arcs.forEach((arc, i) => {
        newParticles.push({
          id: i,
          arcIndex: i,
          speed: arc.speed,
          progress: Math.random()
        })
      })
    }

    particles.value = newParticles
  }

  // Animation loop
  function animate() {
    if (!isAnimating.value || reducedMotion.value) return

    const canvas = typeof canvasElement?.value === 'object' ? canvasElement.value : canvasElement
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Update time
    time.value += 0.016

    // Render based on service type
    renderServiceAnimation(ctx, width, height)

    animationFrameId.value = requestAnimationFrame(animate)
  }

  // Render service-specific animation
  function renderServiceAnimation(ctx, width, height) {
    const config = animationConfig.value

    // Set cyber styling
    ctx.strokeStyle = '#00ff00'
    ctx.fillStyle = '#00ff00'
    ctx.lineWidth = 1
    ctx.shadowBlur = 10
    ctx.shadowColor = '#00ff00'

    if (config.type === 'project-management') {
      renderProjectManagement(ctx, width, height, config)
    } else if (config.type === 'digital-asset-custody') {
      renderDigitalAssetCustody(ctx, width, height, config)
    } else if (config.type === 'cross-border-payment') {
      renderCrossBorderPayment(ctx, width, height, config)
    } else {
      renderNodeBasedAnimation(ctx, width, height, config)
    }
  }

  // Render node-based animations (most services)
  function renderNodeBasedAnimation(ctx, width, height, config) {
    if (!config.nodes) return

    // Draw edges
    config.edges?.forEach(edge => {
      const fromNode = config.nodes[edge.from]
      const toNode = config.nodes[edge.to]

      ctx.beginPath()
      ctx.moveTo(fromNode.x * width, fromNode.y * height)
      ctx.lineTo(toNode.x * width, toNode.y * height)
      ctx.globalAlpha = 0.3
      ctx.stroke()
    })

    // Draw nodes
    config.nodes.forEach(node => {
      ctx.beginPath()
      ctx.arc(node.x * width, node.y * height, 5, 0, Math.PI * 2)
      ctx.globalAlpha = 0.8
      ctx.fill()
    })

    // Update and draw particles
    particles.value.forEach(particle => {
      particle.progress = (particle.progress + particle.speed * 0.01) % 1

      // Find current edge
      const edgeIndex = Math.floor(particle.progress * (config.edges?.length || 1))
      const edge = config.edges?.[edgeIndex]

      if (edge) {
        const fromNode = config.nodes[edge.from]
        const toNode = config.nodes[edge.to]

        const t = (particle.progress * (config.edges?.length || 1)) % 1
        const x = fromNode.x * width + (toNode.x * width - fromNode.x * width) * t
        const y = fromNode.y * height + (toNode.y * height - fromNode.y * height) * t

        ctx.beginPath()
        ctx.arc(x, y, particle.size, 0, Math.PI * 2)
        ctx.globalAlpha = 1
        ctx.fill()
      }
    })
  }

  // Render project management Kanban
  function renderProjectManagement(ctx, width, height, config) {
    // Draw columns
    config.columns.forEach(column => {
      ctx.beginPath()
      ctx.moveTo(column.x * width, 0)
      ctx.lineTo(column.x * width, height)
      ctx.globalAlpha = 0.2
      ctx.stroke()
    })

    // Draw cards moving between columns
    particles.value.forEach(card => {
      card.columnProgress = (card.columnProgress + card.speed * 0.01) % 1

      const startCol = config.columns[0]
      const endCol = config.columns[card.targetColumn]
      const x = startCol.x * width + (endCol.x * width - startCol.x * width) * card.columnProgress
      const y = height * 0.3 + Math.sin(time.value + card.id) * 50

      ctx.beginPath()
      ctx.rect(x - 15, y - 10, 30, 20)
      ctx.globalAlpha = 0.8
      ctx.fill()
    })
  }

  // Render digital asset custody
  function renderDigitalAssetCustody(ctx, width, height, config) {
    // Draw vaults
    config.vaults.forEach(vault => {
      ctx.beginPath()
      ctx.arc(vault.x * width, vault.y * height, 30, 0, Math.PI * 2)
      ctx.globalAlpha = 0.3
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(vault.x * width, vault.y * height, 5, 0, Math.PI * 2)
      ctx.globalAlpha = 0.8
      ctx.fill()
    })

    // Draw assets moving to vaults
    particles.value.forEach(asset => {
      asset.vaultProgress = (asset.vaultProgress + asset.speed * 0.01) % 1

      const vaultIndex = Math.floor(asset.vaultProgress * config.vaults.length)
      const vault = config.vaults[vaultIndex]

      if (vault) {
        const angle = asset.vaultProgress * Math.PI * 2
        const radius = 50 * (1 - (asset.vaultProgress % 1))
        const x = vault.x * width + Math.cos(angle) * radius
        const y = vault.y * height + Math.sin(angle) * radius

        ctx.beginPath()
        ctx.arc(x, y, asset.size, 0, Math.PI * 2)
        ctx.globalAlpha = 1
        ctx.fill()
      }
    })
  }

  // Render cross-border payment
  function renderCrossBorderPayment(ctx, width, height, config) {
    // Draw countries
    config.countries.forEach(country => {
      ctx.beginPath()
      ctx.arc(country.x * width, country.y * height, 20, 0, Math.PI * 2)
      ctx.globalAlpha = 0.3
      ctx.stroke()

      // Country code
      ctx.font = '12px Orbitron'
      ctx.fillStyle = '#00ff00'
      ctx.globalAlpha = 0.8
      ctx.fillText(country.code, country.x * width - 10, country.y * height + 5)
    })

    // Draw payment arcs
    particles.value.forEach(particle => {
      particle.progress = (particle.progress + particle.speed * 0.01) % 1

      const arc = config.arcs[particle.arcIndex]
      if (arc) {
        const fromCountry = config.countries[arc.from]
        const toCountry = config.countries[arc.to]

        const t = particle.progress
        const x = fromCountry.x * width + (toCountry.x * width - fromCountry.x * width) * t
        const y = fromCountry.y * height + (toCountry.y * height - fromCountry.y * height) * t

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.globalAlpha = 1
        ctx.fill()
      }
    })
  }

  // Start animation
  function startAnimation() {
    if (reducedMotion.value) return

    if (!isAnimating.value) {
      isAnimating.value = true
      initParticles()
      animationFrameId.value = requestAnimationFrame(animate)
    }
  }

  // Stop animation
  function stopAnimation() {
    isAnimating.value = false
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }

  // Setup Intersection Observer
  function setupIntersectionObserver() {
    if (typeof window !== 'undefined' && window.IntersectionObserver) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            isIntersecting.value = entry.isIntersecting
            if (entry.isIntersecting && !reducedMotion.value) {
              startAnimation()
            } else {
              stopAnimation()
            }
          })
        },
        { threshold: 0.1 }
      )

      if (target.value) {
        observer.observe(target.value)
      }
    }
  }

  // Cleanup
  function cleanup() {
    stopAnimation()
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  // Setup visibility change listener
  function setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      const handler = () => {
        if (document.hidden) {
          stopAnimation()
        } else if (isIntersecting.value && !reducedMotion.value) {
          startAnimation()
        }
      }

      document.addEventListener('visibilitychange', handler)
      return () => document.removeEventListener('visibilitychange', handler)
    }
    return () => {}
  }

  // Initialize
  const removeReducedMotionListener = checkReducedMotion()
  const removeVisibilityListener = setupVisibilityListener()
  setupIntersectionObserver()

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
    removeReducedMotionListener?.()
    removeVisibilityListener?.()
  })

  return {
    animationConfig,
    isAnimating,
    ariaLabel,
    animationStatus,
    startAnimation,
    stopAnimation,
    cleanup
  }
}
