/**
 * #434 DEMO: Smooth scroll utility for KTech AI Cyber Web
 * Quick implementation for demo presentation
 */

/**
 * Initialize smooth scroll for all anchor links
 */
export function initSmoothScroll() {
  // Add click handlers to all anchor links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]')
    if (!link) return

    const targetId = link.getAttribute('href').slice(1)
    if (!targetId) return

    // Check if target exists on current page
    const targetElement = document.getElementById(targetId)
    if (!targetElement) return

    e.preventDefault()
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })

    // Update URL
    if (window.history.pushState) {
      window.history.pushState(null, null, `#${targetId}`)
    }
  })

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const hash = location.hash.slice(1)
    if (hash) {
      const target = document.getElementById(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  })

  // Scroll to hash on page load
  if (location.hash) {
    setTimeout(() => {
      const hash = location.hash.slice(1)
      const target = document.getElementById(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}
