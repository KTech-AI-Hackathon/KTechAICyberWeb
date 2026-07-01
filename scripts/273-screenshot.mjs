// One-off screenshot harvester for AC #273 evidence (AFTER state).
// Captures the /about page (full page + achievements / vmc / culture regions)
// to demonstrate the 8 emoji replaced with original cyber AboutIcon SVGs.
//
// Usage:  node scripts/273-screenshot.mjs [outDir]
// Default outDir: /Users/jinbo/Documents/AIProject/AutoDevAgent/DevAgent/projects/273/evidence/
//
// Self-contained: builds the site, starts `vite preview` on a free port
// (4173 by default, overridden to avoid the shared-repo port-3000 lane
// contention), captures the screenshots, then kills the server.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

const outDir =
  process.argv[2] ||
  '/Users/jinbo/Documents/AIProject/AutoDevAgent/DevAgent/projects/273/evidence/'
mkdirSync(outDir, { recursive: true })

const PORT = process.env.PORT || '4174'
// vite base subpath is /KTechAICyberWeb/ (vite.config.js), so /about is served
// under that prefix.
const BASE = `http://localhost:${PORT}/KTechAICyberWeb/`

// Start `vite preview` (serves the dist/ produced by `vite build`). Preview
// honours the configured base, so the subpath prefix applies.
const server = spawn(
  'node_modules/.bin/vite',
  ['preview', '--port', PORT, '--strictPort'],
  { stdio: ['ignore', 'pipe', 'pipe'] },
)

let stdout = ''
let stderr = ''
server.stdout.on('data', (d) => (stdout += d))
server.stderr.on('data', (d) => (stderr += d))

// Wait for the preview server to be ready (it prints the local URL).
const timeoutMs = 30000
const startedAt = Date.now()
const ready = /Local:\s+http:\/\/localhost:/
await new Promise((res, rej) => {
  const onStderr = (d) => {
    stderr += d.toString()
    if (ready.test(stderr) || ready.test(stdout)) return res()
    if (Date.now() - startedAt > timeoutMs) {
      rej(new Error(`vite preview did not start within ${timeoutMs}ms\n${stderr}`))
    }
  }
  // vite prints its banner on stderr historically; cover both streams.
  server.stdout.on('data', onStderr)
  server.stderr.on('data', onStderr)
  setTimeout(
    () =>
      ready.test(stdout) || ready.test(stderr)
        ? res()
        : rej(new Error(`timeout\nstdout=${stdout}\nstderr=${stderr}`)),
    timeoutMs,
  )
}).catch((e) => {
  // Fallback: give it a short grace window then probe the port.
  console.warn(`[273-screenshot] readiness probe warning: ${e.message}`)
})

// Final grace: ensure the port actually answers.
const browser = await chromium.launch()
try {
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  })
  const page = await desktop.newPage()

  await page.goto(`${BASE}about`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  await page.screenshot({
    path: resolve(outDir, 'about-fullpage.png'),
    fullPage: true,
  })

  // Achievements strip
  const achievements = await page.$('.achievements')
  if (achievements) {
    await achievements.screenshot({
      path: resolve(outDir, 'about-achievements.png'),
    })
  }

  // Vision / Mission grid
  const vmc = await page.$('.vmc-grid')
  if (vmc) {
    await vmc.screenshot({ path: resolve(outDir, 'about-vmc.png') })
  }

  // Culture grid
  const culture = await page.$('.culture-grid')
  if (culture) {
    await culture.screenshot({ path: resolve(outDir, 'about-culture.png') })
  }

  console.log(`Screenshots written to ${outDir}`)
} finally {
  await browser.close()
  server.kill('SIGTERM')
}
