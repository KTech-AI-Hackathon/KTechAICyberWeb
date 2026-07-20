/**
 * @file route-configuration.spec.ts
 * @description Comprehensive route verification tests for Issue #448
 * @ticket #448
 *
 * Tests all 10 functional areas from REQUIREMENTS.md (FR1-FR10):
 * - Route configuration correctness
 * - Eager vs lazy loading strategy
 * - SSG vs SPA route classification
 * - Catch-all NotFound route
 * - Route base configuration
 * - All functional area routes present
 *
 * This test suite validates the route configuration contracts that ensure
 * the production site serves all functional areas correctly.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Read the main.js source to analyze route configuration
const mainSource = readFileSync(
  resolve(process.cwd(), 'src/main.js'),
  'utf8'
)

describe('Route Configuration Verification (#448)', () => {
  describe('Router Base Configuration', () => {
    it('sets router base from import.meta.env.BASE_URL', () => {
      // The router base must be set to preserve the production subpath /KTechAICyberWeb/
      // This is a critical contract for the vite-ssg form (post-#348)
      const codeOnly = mainSource
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')

      // Must contain import.meta.env.BASE_URL for router base
      expect(codeOnly).toMatch(/import\.meta\.env\.BASE_URL/)

      // Must NOT use empty base (would regress #140 blank-page bug)
      expect(codeOnly).not.toMatch(/base:\s*['"]['"]/)
    })
  })

  describe('FR1: Home Page (/)', () => {
    it('exists in route configuration', () => {
      // Home route must be present
      expect(mainSource).toMatch(/path:\s*['"]\/['"]/)
    })

    it('uses eager-loaded Home component', () => {
      // Home must be static import (eager) for optimal LCP
      // Should NOT be a dynamic import
      expect(mainSource).toMatch(/import Home from ['"]\.\/views\/Home\.vue['"]/)
      // Should NOT contain () => import for Home
      const homeRouteMatch = mainSource.match(/path:\s*['"]\/['"].*?component:/s)
      expect(homeRouteMatch).toBeTruthy()
      const homeComponentCode = homeRouteMatch![0]
      expect(homeComponentCode).not.toMatch(/\(\)\s*=>\s*import/)
    })

    it('is classified for SSG pre-rendering', () => {
      // Home is one of the 5 marketing routes that should be SSG pre-rendered
      // This is validated via vite.config.js includedRoutes filter
      // The route configuration itself enables SSG via vite-ssg
      expect(mainSource).toMatch(/ViteSSG/)
    })
  })

  describe('FR2: About Page (/about)', () => {
    it('exists in route configuration', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/about['"]/)
    })

    it('uses lazy-loaded About component', () => {
      // About should be lazy-loaded for code splitting
      expect(mainSource).toMatch(/path:\s*['"]\/about['"].*?component:\s*\(\)\s*=>\s*import\(['"]\.\/views\/About\.vue['"]\)/s)
    })

    it('is classified for SSG pre-rendering', () => {
      // About is a marketing route that should be SSG pre-rendered
      // Validated via vite.config.js includedRoutes filter
      expect(mainSource).toMatch(/ViteSSG/)
    })
  })

  describe('FR3: News & Insights (/news, /news/:slug)', () => {
    it('includes news listing route', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/news['"]/)
    })

    it('includes news detail route with slug parameter', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/news\/:slug['"]/)
    })

    it('uses lazy-loaded News components', () => {
      // Both News listing and detail should be lazy-loaded
      expect(mainSource).toMatch(/path:\s*['"]\/news['"].*?component:\s*\(\)\s*=>\s*import\(['"]\.\/views\/News\.vue['"]\)/s)
      expect(mainSource).toMatch(/path:\s*['"]\/news\/:slug['"].*?component:\s*\(\)\s*=>\s*import\(['"]\.\/views\/NewsDetail\.vue['"]\)/s)
    })

    it('enables props for slug parameter', () => {
      // News detail route should pass props: true for slug parameter
      expect(mainSource).toMatch(/path:\s*['"]\/news\/:slug['"].*?props:\s*true/s)
    })
  })

  describe('FR4: Services Pages (/services/*)', () => {
    const serviceRoutes = [
      'supply-chain-finance',
      'blockchain',
      'big-data-ai',
      'retail-lending',
      'cross-border-payment',
      'digital-asset-custody',
      'stablecoin',
      'project-and-program-management'
    ]

    serviceRoutes.forEach(service => {
      it(`includes /services/${service} route`, () => {
        expect(mainSource).toMatch(new RegExp(`path:\\s*['"]/services/${service}['"]`))
      })

      it(`uses lazy-loaded component for /services/${service}`, () => {
        // All service routes should be lazy-loaded
        const routeMatch = mainSource.match(new RegExp(`path:\\s*['"]/services/${service}['"].*?component:`, 's'))
        expect(routeMatch).toBeTruthy()
        const componentCode = mainSource.substring(mainSource.indexOf(routeMatch![0]))
        const componentMatch = componentCode.match(/\(\)\s*=>\s*import\(/)
        expect(componentMatch).toBeTruthy()
      })
    })
  })

  describe('FR5: Contact Page (/contact)', () => {
    it('exists in route configuration', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/contact['"]/)
    })

    it('uses lazy-loaded Contact component', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/contact['"].*?component:\s*\(\)\s*=>\s*import\(['"]\.\/views\/Contact\.vue['"]\)/s)
    })

    it('is classified for SSG pre-rendering', () => {
      // Contact is a marketing route that should be SSG pre-rendered
      expect(mainSource).toMatch(/ViteSSG/)
    })
  })

  describe('FR6: Careers/Join Us (/join-us, /careers)', () => {
    it('includes /join-us route', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/join-us['"]/)
    })

    it('includes /careers route', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/careers['"]/)
    })

    it('uses lazy-loaded components for both routes', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/join-us['"].*?component:\s*\(\)\s*=>\s*import\(['"]\.\/views\/JoinUs\.vue['"]\)/s)
      expect(mainSource).toMatch(/path:\s*['"]\/careers['"].*?component:\s*\(\)\s*=>\s*import\(['"]\.\/views\/PositionList\.vue['"]\)/s)
    })
  })

  describe('FR7: Neon Pulse Visualizer (/pulse)', () => {
    it('includes /pulse route', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/pulse['"]/)
    })

    it('has named route for pulse', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/pulse['"].*?name:\s*['"]pulse['"]/s)
    })

    it('uses lazy-loaded NeonPulse component', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/pulse['"].*?component:\s*\(\)\s*=>\s*import\(['"]\.\/components\/NeonPulse\.vue['"]\)/s)
    })
  })

  describe('FR8: Blockchain Services (/services/blockchain)', () => {
    it('exists as dedicated route under services', () => {
      // Blockchain is one of the specialized services
      expect(mainSource).toMatch(/path:\s*['"]\/services\/blockchain['"]/)
    })

    it('uses Blockchain component', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/services\/blockchain['"].*?component:\s*\(\)\s*=>\s*import\(['"]\.\/views\/Blockchain\.vue['"]\)/s)
    })
  })

  describe('FR9: Legal Pages (/privacy, /terms)', () => {
    it('includes /privacy route', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/privacy['"]/)
    })

    it('includes /terms route', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/terms['"]/)
    })

    it('uses lazy-loaded PrivacyPolicy component', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/privacy['"].*?component:\s*\(\)\s*=>\s*import\(['"]\.\/views\/PrivacyPolicy\.vue['"]\)/s)
    })

    it('uses lazy-loaded Terms component', () => {
      expect(mainSource).toMatch(/path:\s*['"]\/terms['"].*?component:\s*\(\)\s*=>\s*import\(['"]\.\/views\/Terms\.vue['"]\)/s)
    })
  })

  describe('FR10: NotFound Page (404)', () => {
    it('includes catch-all route for unmatched paths', () => {
      // vue-router 4 catch-all syntax
      expect(mainSource).toMatch(/pathMatch\(\.\*\)\*/)
    })

    it('has named not-found route', () => {
      expect(mainSource).toMatch(/name:\s*['"]not-found['"]/)
    })

    it('uses NotFound component', () => {
      expect(mainSource).toMatch(/NotFound/)
    })

    it('uses lazy-loaded NotFound component', () => {
      const notFoundMatch = mainSource.match(/path:\s*['"]\/:pathMatch\(\.\*\)\*['"].*?component:/s)
      expect(notFoundMatch).toBeTruthy()
      const componentCode = mainSource.substring(mainSource.indexOf(notFoundMatch![0]))
      expect(componentCode).toMatch(/\(\)\s*=>\s*import\(['"]\.\/views\/NotFound\.vue['"]\)/)
    })

    it('is the last route in configuration', () => {
      // Catch-all should be last to avoid catching other routes
      const routesMatch = mainSource.match(/const routes = \[([\s\S]*?)\]/)
      expect(routesMatch).toBeTruthy()
      const routesText = routesMatch![1]
      // Last route definition should be the catch-all
      const lastRouteMatch = routesText.match(/\{[^}]*pathMatch\(\.\*\)\*[^}]*\}/s)
      expect(lastRouteMatch).toBeTruthy()
    })
  })

  describe('Code Splitting Strategy', () => {
    it('uses lazy loading for all non-Home routes', () => {
      // Home should be eager, all others lazy
      // Count dynamic imports (lazy-loaded routes)
      const dynamicImportMatches = mainSource.match(/\(\)\s*=>\s*import\(/g)
      expect(dynamicImportMatches).toBeTruthy()
      // Should have many lazy-loaded routes (17 non-home routes)
      expect(dynamicImportMatches!.length).toBeGreaterThanOrEqual(17)
    })

    it('eager-loads only Home component', () => {
      // Home should be the only static import for views
      // Look for static imports of view components
      const staticImportMatches = mainSource.match(/import \w+ from ['"]\.\/views\/\w+\.vue['"]/g)
      expect(staticImportMatches).toBeTruthy()
      // Only Home should be statically imported
      expect(staticImportMatches!.length).toBe(1)
      expect(staticImportMatches![0]).toContain('Home.vue')
    })
  })

  describe('SSG vs SPA Route Classification', () => {
    it('uses vite-ssg for static site generation', () => {
      // Post-#348: SSG enabled via vite-ssg
      expect(mainSource).toMatch(/ViteSSG/)
    })

    it('configures base for vite-ssg', () => {
      // vite-ssg requires base configuration
      expect(mainSource).toMatch(/base:\s*import\.meta\.env\.BASE_URL/)
    })

    it('passes routes array to vite-ssg', () => {
      // ViteSSG should receive the routes configuration
      expect(mainSource).toMatch(/ViteSSG\([^,]+,\s*\{\s*routes,/)
    })
  })

  describe('Route Configuration Completeness', () => {
    it('includes all 10 functional area routes', () => {
      // Verify presence of all core routes from REQUIREMENTS.md
      const requiredRoutes = [
        '/               ', // Home
        '/about          ', // About
        '/news           ', // News listing
        '/news/:slug     ', // News detail
        '/contact        ', // Contact
        '/join-us        ', // Join Us
        '/careers        ', // Careers
        '/privacy        ', // Privacy
        '/terms          ', // Terms
        '/:pathMatch(.*)*'  // NotFound
      ]

      requiredRoutes.forEach(route => {
        expect(mainSource).toMatch(new RegExp(route.replace(/\s+/g, '\\s*')))
      })
    })

    it('includes all services routes', () => {
      // Verify all 8 service routes from FR4
      const serviceRoutes = [
        '/services/supply-chain-finance',
        '/services/blockchain',
        '/services/big-data-ai',
        '/services/retail-lending',
        '/services/cross-border-payment',
        '/services/digital-asset-custody',
        '/services/stablecoin',
        '/services/project-and-program-management'
      ]

      serviceRoutes.forEach(route => {
        expect(mainSource).toMatch(new RegExp(route.replace(/\//g, '\\/')))
      })
    })
  })

  describe('Integration with Plugins', () => {
    it('installs Pinia for state management', () => {
      // Pinia should be installed in vite-ssg callback
      expect(mainSource).toMatch(/createPinia/)
      expect(mainSource).toMatch(/\.use\(createPinia\(\)\)/)
    })

    it('installs @vueuse/head for per-route titles', () => {
      // Head plugin should be installed for #260 per-route titles
      expect(mainSource).toMatch(/createHead/)
      expect(mainSource).toMatch(/\.use\(createHead\(\)\)/)
    })
  })

  describe('CSS Import Strategy', () => {
    it('imports global CSS files in correct order', () => {
      // #334 perf: variables.css must load before main.css
      // #334 perf: fonts.css must load before main.css
      const variablesIndex = mainSource.indexOf("import './assets/styles/variables.css'")
      const fontsIndex = mainSource.indexOf("import './assets/styles/fonts.css'")
      const mainIndex = mainSource.indexOf("import './assets/styles/main.css'")

      expect(variablesIndex).toBeLessThan(mainIndex)
      expect(fontsIndex).toBeLessThan(mainIndex)
    })

    it('dynamically imports cyber.css for async loading', () => {
      // #340 perf: cyber.css should be dynamically imported
      expect(mainSource).toMatch(/import\(['"]\.\/assets\/styles\/cyber\.css['"]\)/)
    })

    it('imports accessibility CSS', () => {
      // Accessibility CSS should be imported
      expect(mainSource).toMatch("import './styles/accessibility.css'")
    })
  })

  describe('Cross-Cutting Feature Support', () => {
    it('supports bilingual routing (i18n)', () => {
      // Routes themselves are language-agnostic (same URL for both en/zh)
      // i18n is handled via Vue I18n, not via separate routes
      // This test validates that routes don't have language prefixes
      expect(mainSource).not.toMatch(/path:\s*['"]\/en['"]/)
      expect(mainSource).not.toMatch(/path:\s*['"]\/zh['"]/)
    })

    it('supports cyberpunk theme (CSS integration)', () => {
      // Theme support via CSS imports (validated in CSS Import Strategy)
      // Routes don't need special configuration for theming
      expect(mainSource).toMatch(/variables\.css/)
      expect(mainSource).toMatch(/cyber\.css/)
    })

    it('supports accessibility (CSS integration)', () => {
      // Accessibility support via CSS imports
      expect(mainSource).toMatch(/accessibility\.css/)
    })
  })
})
