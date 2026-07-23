<template>
  <section
    ref="ambientRef"
    class="blockchain-ambient"
    :class="{ 'ambient-static': isStatic }"
    role="img"
    :aria-label="t('ambient.blockchainAriaLabel')"
  >
    <canvas
      v-if="!isStatic"
      ref="canvasRef"
      class="ambient-canvas"
      :width="canvasSize.width"
      :height="canvasSize.height"
    />
    <div v-else class="ambient-static blockchain-grid">
      <!-- Static fallback blockchain visualization -->
      <div
        v-for="(node, i) in staticNodes"
        :key="`node-${i}`"
        class="static-node"
        :style="{ left: `${node.x}%`, top: `${node.y}%` }"
      />
      <div
        v-for="(block, i) in staticBlocks"
        :key="`block-${i}`"
        class="static-block"
        :style="{ left: `${block.x}%`, top: `${block.y}%` }"
      >
        <div class="static-hash">{{ block.hash }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { useAmbientAnimation } from '@/composables/useAmbientAnimation'

const { t } = useLanguage()

// Props
const props = defineProps({
  nodeCount: {
    type: Number,
    default: 12
  },
  mobileNodeCount: {
    type: Number,
    default: 6
  },
  blockCount: {
    type: Number,
    default: 8
  },
  mobileBlockCount: {
    type: Number,
    default: 4
  }
})

// Ambient animation state
const ambientRef = ref(null)
const canvasRef = ref(null)
const canvasSize = ref({ width: 1920, height: 600 })

// Blockchain visualization state
const nodes = ref([])
const blocks = ref([])
const consensusActive = ref(false)
const connections = ref([])

const {
  target,
  isPaused,
  isStatic,
  isPlaying,
  progress,
  startLoop,
  stopLoop,
  isMobile,
  adaptiveParticles,
  adaptiveUpdateInterval
} = useAmbientAnimation({
  particles: props.nodeCount,
  mobileParticles: props.mobileNodeCount,
  enableThrottling: true
})

target.value = ambientRef

// Adaptive node and block counts
const adaptiveNodes = computed(() =>
  isMobile.value ? props.mobileNodeCount : props.nodeCount
)

const adaptiveBlocks = computed(() =>
  isMobile.value ? props.mobileBlockCount : props.blockCount
)

// Expose values for tests
defineExpose({
  nodeCount: computed(() => adaptiveNodes.value),
  blockCount: computed(() => adaptiveBlocks.value),
  nodes,
  blocks,
  consensusActive,
  isPaused,
  updateInterval: computed(() => adaptiveUpdateInterval.value),
  triggerConsensus
})

// Cyberpunk neon colors
const NEON_CYAN = '#00ffcc'
const NEON_MAGENTA = '#ff00ff'
const NEON_BLUE = '#00ffff'
const NEON_GREEN = '#00ff00'

// Initialize distributed nodes in mesh topology
function initNodes() {
  const count = adaptiveNodes.value
  nodes.value = []
  connections.value = []

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const radius = 35 + Math.random() * 10 // 35-45% from center
    const x = 50 + Math.cos(angle) * radius
    const y = 50 + Math.sin(angle) * radius

    nodes.value.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
      isGlowing: false,
      color: [NEON_CYAN, NEON_MAGENTA, NEON_BLUE, NEON_GREEN][Math.floor(Math.random() * 4)],
      connections: []
    })
  }

  // Create mesh connections (each node connects to 2-3 nearest neighbors)
  nodes.value.forEach((node, i) => {
    const distances = nodes.value
      .map((other, j) => ({
        index: j,
        distance: Math.sqrt(Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2))
      }))
      .filter(d => d.index !== i)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)

    node.connections = distances.map(d => d.index)
    connections.value.push(...distances.map(d => ({ from: i, to: d.index })))
  })
}

// Initialize blockchain with genesis block
function initBlocks() {
  const count = adaptiveBlocks.value
  blocks.value = []

  // Genesis block
  blocks.value.push({
    x: 10,
    y: 50,
    hash: '0000' + generateRandomHash(),
    isGenesis: true,
    colorState: 'validated',
    opacity: 1,
    validationProgress: 1
  })

  // Subsequent blocks
  for (let i = 1; i < count; i++) {
    blocks.value.push({
      x: 15 + i * 10,
      y: 50 + (Math.random() - 0.5) * 15,
      hash: generateRandomHash(),
      isGenesis: false,
      colorState: 'forming',
      opacity: 0.3 + (i / count) * 0.7,
      validationProgress: Math.random()
    })
  }
}

// Generate random hex hash
function generateRandomHash() {
  return Math.random().toString(16).substr(2, 8).toUpperCase()
}

// Trigger consensus mechanism
function triggerConsensus() {
  consensusActive.value = true

  // Make all nodes glow simultaneously
  nodes.value.forEach(node => {
    node.isGlowing = true
  })

  // Reset after animation
  setTimeout(() => {
    consensusActive.value = false
    nodes.value.forEach(node => {
      node.isGlowing = false
    })
  }, 1000)
}

// Update nodes animation
function updateNodes(deltaTime) {
  nodes.value.forEach(node => {
    // Subtle floating motion
    node.phase += deltaTime * 0.001
    node.x += node.vx + Math.sin(node.phase) * 0.01
    node.y += node.vy + Math.cos(node.phase) * 0.01

    // Keep within bounds
    node.x = Math.max(5, Math.min(95, node.x))
    node.y = Math.max(5, Math.min(95, node.y))
  })
}

// Update blocks animation
function updateBlocks(deltaTime) {
  blocks.value.forEach(block => {
    if (!block.isGenesis) {
      // Animate validation progress
      block.validationProgress = (block.validationProgress + deltaTime * 0.0005) % 1

      // Update color state based on validation
      if (block.validationProgress > 0.9) {
        block.colorState = 'validated'
      } else if (block.validationProgress > 0.5) {
        block.colorState = 'validating'
      } else {
        block.colorState = 'forming'
      }

      // Fade hash characters
      if (Math.random() < 0.02) {
        block.hash = generateRandomHash()
      }
    }
  })

  // Grow chain: add new block periodically (slower on mobile)
  const growthChance = isMobile.value ? 0.0003 : 0.0005
  if (Math.random() < growthChance && blocks.value.length < adaptiveBlocks.value + 2) {
    const lastBlock = blocks.value[blocks.value.length - 1]
    blocks.value.push({
      x: Math.min(90, lastBlock.x + 10),
      y: 50 + (Math.random() - 0.5) * 15,
      hash: generateRandomHash(),
      isGenesis: false,
      colorState: 'forming',
      opacity: 0.3,
      validationProgress: 0
    })

    // Fade out oldest blocks
    if (blocks.value.length > adaptiveBlocks.value) {
      blocks.value.shift()
      // Add new genesis block at start
      blocks.value.unshift({
        x: 10,
        y: 50,
        hash: '0000' + generateRandomHash(),
        isGenesis: true,
        colorState: 'validated',
        opacity: 1,
        validationProgress: 1
      })
    }
  }
}

// Draw canvas
function drawCanvas() {
  if (!canvasRef.value || isStatic.value) return

  const ctx = canvasRef.value.getContext('2d')
  const { width, height } = canvasSize.value

  ctx.clearRect(0, 0, width, height)

  // Draw grid background
  ctx.strokeStyle = 'rgba(0, 255, 204, 0.1)'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Draw connection lines between nodes
  ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)'
  ctx.lineWidth = 1
  connections.value.forEach(conn => {
    const fromNode = nodes.value[conn.from]
    const toNode = nodes.value[conn.to]
    if (fromNode && toNode) {
      ctx.beginPath()
      ctx.moveTo((fromNode.x / 100) * width, (fromNode.y / 100) * height)
      ctx.lineTo((toNode.x / 100) * width, (toNode.y / 100) * height)
      ctx.stroke()
    }
  })

  // Draw nodes
  nodes.value.forEach(node => {
    const x = (node.x / 100) * width
    const y = (node.y / 100) * height

    // Node glow
    if (node.isGlowing || !isMobile.value) {
      ctx.shadowColor = node.color
      ctx.shadowBlur = node.isGlowing ? 20 : 10
    }

    // Node circle
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fillStyle = node.color
    ctx.fill()

    // Reset shadow
    ctx.shadowBlur = 0
  })

  // Draw blocks
  blocks.value.forEach(block => {
    const x = (block.x / 100) * width
    const y = (block.y / 100) * height

    // Block color based on state
    let blockColor
    switch (block.colorState) {
      case 'validated':
        blockColor = NEON_GREEN
        break
      case 'validating':
        blockColor = NEON_CYAN
        break
      default:
        blockColor = NEON_MAGENTA
    }

    // Block glow
    if (!isMobile.value) {
      ctx.shadowColor = blockColor
      ctx.shadowBlur = 15
    }

    // Block rectangle
    ctx.fillStyle = `rgba(${block === blocks.value[0] ? '0, 255, 0' : '255, 0, 255'}, ${block.opacity * 0.3})`
    ctx.fillRect(x - 20, y - 15, 40, 30)

    // Block border
    ctx.strokeStyle = blockColor
    ctx.lineWidth = 2
    ctx.strokeRect(x - 20, y - 15, 40, 30)

    // Hash text
    ctx.fillStyle = blockColor
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(block.hash, x, y + 4)

    // Reset shadow
    ctx.shadowBlur = 0
  })
}

// Static fallback nodes and blocks
const staticNodes = computed(() => {
  const count = adaptiveNodes.value
  const result = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    result.push({
      x: 50 + Math.cos(angle) * 40,
      y: 50 + Math.sin(angle) * 40
    })
  }
  return result
})

const staticBlocks = computed(() => {
  const count = adaptiveBlocks.value
  const result = []
  for (let i = 0; i < count; i++) {
    result.push({
      x: 15 + i * 10,
      y: 50,
      hash: generateRandomHash()
    })
  }
  return result
})

let lastFrameTime = null

function animationLoop(now) {
  if (!isPlaying.value) return

  const deltaTime = lastFrameTime ? now - lastFrameTime : 0
  lastFrameTime = now

  updateNodes(deltaTime)
  updateBlocks(deltaTime)
  drawCanvas()

  requestAnimationFrame(animationLoop)
}

onMounted(() => {
  initNodes()
  initBlocks()
  startLoop()
  requestAnimationFrame(animationLoop)

  // Trigger consensus periodically
  const consensusInterval = setInterval(() => {
    if (isPlaying.value) {
      triggerConsensus()
    }
  }, 8000)

  // Store interval for cleanup
  onUnmounted(() => {
    clearInterval(consensusInterval)
  })
})

onUnmounted(() => {
  stopLoop()
})

// Responsive canvas size
function resizeCanvas() {
  if (canvasRef.value) {
    canvasSize.value = {
      width: canvasRef.value.offsetWidth,
      height: canvasRef.value.offsetHeight
    }
  }
}

// Watch for resize
window.addEventListener('resize', resizeCanvas)
onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.blockchain-ambient {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
  /* CSS containment for performance optimization */
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
  background: linear-gradient(135deg,
    rgba(0, 255, 204, 0.02) 0%,
    rgba(255, 0, 255, 0.02) 50%,
    rgba(0, 255, 204, 0.02) 100%);
}

.ambient-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.7;
  pointer-events: none;
}

.ambient-static.blockchain-grid {
  position: relative;
  width: 100%;
  height: 100%;
}

.static-node {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--color-cyber-secondary, #00ffcc);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--color-cyber-secondary, #00ffcc);
  opacity: 0.6;
}

.static-block {
  position: absolute;
  width: 80px;
  height: 60px;
  background: rgba(255, 0, 255, 0.2);
  border: 2px solid var(--color-cyber-primary, #ff00ff);
  border-radius: 4px;
  transform: translate(-50%, -50%);
}

.static-hash {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: var(--color-cyber-primary, #ff00ff);
  text-align: center;
  padding: 20px 5px;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .blockchain-ambient {
    height: 400px;
    contain-intrinsic-size: auto 400px;
  }

  .static-node {
    width: 10px;
    height: 10px;
  }

  .static-block {
    width: 60px;
    height: 45px;
  }

  .static-hash {
    font-size: 8px;
    padding: 15px 3px;
  }
}
</style>
