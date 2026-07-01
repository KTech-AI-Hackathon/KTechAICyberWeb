import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

/**
 * #263 — SEO/OG asset integrity gate.
 *
 * Three groups:
 *  A) Reference integrity — every favicon/og/twitter/json-ld/manifest URL in
 *     index.html + manifest.json points at a file that actually exists under
 *     public/. This is the regression that caused the 404s.
 *  B) Dimensions — og/twitter images are 1200×630, the PNG icons match their
 *     declared sizes, favicon.ico is a valid ICO container. Asserts the
 *     generator produced correctly-sized assets, not just any bytes.
 *  C) IP gate — the generator source contains no KASIKORN / KBank / 开泰银行
 *     wordmark (trademark risk), and DOES contain our original "KTech"
 *     wordmark + the cyber cyan #00ffcc motif. Mirrors the #198 AboutIcon
 *     IP-clean attestation.
 *
 * These are file-integration tests (read the real public/ + index.html +
 * scripts/), NOT mocked — a unit test that mocks `t()` or `fs` cannot catch
 * a missing file. They would FAIL today (assets absent) and pass once the
 * generator runs (Step 2) + the base-path bugs are fixed (Step 3).
 */

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'public')

// --- helpers --------------------------------------------------------------

/**
 * Reduce a URL referenced in index.html / manifest.json to the bare filename
 * under public/. Supports three forms:
 *   - absolute: https://jasonhou007.github.io/KTechAICyberWeb/og-image.jpg
 *       (the host is stripped; the deploy subpath '/KTechAICyberWeb/' is also
 *        stripped so we land at og-image.jpg — these are correct for OG
 *        scrapers and must NOT change per the plan)
 *   - root-absolute: /favicon.ico (BUG form — should be relative)
 *   - relative: favicon.ico (correct form under base '/KTechAICyberWeb/')
 * Returns the last path segment (the filename), query/hash stripped.
 */
function basenameFromUrl(url) {
  let u = String(url).trim()
  u = u.replace(/^https?:\/\/[^/]+/, '')   // strip protocol + host
  u = u.replace(/^\/+/, '')                // strip leading slash(es)
  u = u.split(/[?#]/)[0]                   // strip query/hash
  // strip the deploy subpath if present (absolute URLs include it)
  const SUB = 'KTechAICyberWeb/'
  if (u.startsWith(SUB)) u = u.slice(SUB.length)
  // last path segment is the filename under public/
  const segs = u.split('/').filter(Boolean)
  return segs[segs.length - 1] || u
}

/** Read a file under public/ as a Buffer (throws if missing — caller handles). */
function readPublic(rel) {
  return fs.readFileSync(path.join(PUBLIC, rel))
}

/** Parse JPEG SOF0/SOF2 marker to extract {width, height}. No dep. */
function jpegDimensions(buf) {
  // JPEG starts with SOI 0xFFD8 then a sequence of markers. Each marker is
  // 0xFF + marker byte; most carry a 2-byte big-endian length payload. The
  // SOFn (0xFFC0..0xFFCF, excluding 0xFFC4/C8/CC which are DHT/JPGA/DAC) hold
  // the dimensions: precision(1) + height(2) + width(2).
  if (buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error('not a JPEG (missing SOI)')
  }
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error('expected marker prefix 0xFF')
    const marker = buf[i + 1]
    i += 2
    // markers without payload (RSTn, SOI, EOI, TEM) — shouldn't appear mid-stream
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue
    }
    const segLen = (buf[i] << 8) | buf[i + 1]
    // SOF markers: dimensions live here
    if (marker >= 0xc0 && marker <= 0xcf &&
        marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      // precision(1) at i+2, height(2) at i+3, width(2) at i+5
      const height = (buf[i + 3] << 8) | buf[i + 4]
      const width = (buf[i + 5] << 8) | buf[i + 6]
      return { width, height }
    }
    i += segLen
  }
  throw new Error('SOF marker not found')
}

/** Read PNG IHDR (bytes 16-24): width(4) at offset 16, height(4) at offset 20. */
function pngDimensions(buf) {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A (8 bytes)
  for (let k = 0; k < 8; k++) {
    if (buf[k] !== [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][k]) {
      throw new Error('not a PNG (bad signature)')
    }
  }
  // IHDR chunk: length(4)=0x0D, type(4)="IHDR", then width(4)+height(4)
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  return { width, height }
}

/** Parse the ICO ICONDIR header + count + first ICONDIRENTRY. */
function icoHeader(buf) {
  // ICONDIR: reserved(2)=0x0000, type(2)=0x0001 (icon), count(2)
  if (buf[0] !== 0x00 || buf[1] !== 0x00) throw new Error('ICO reserved != 0')
  if (buf[2] !== 0x01 || buf[3] !== 0x00) throw new Error('ICO type != 1 (icon)')
  const count = (buf[4] << 8) | buf[5]
  return { count }
}

// --- Group A: reference integrity -----------------------------------------

describe('#263 Group A — index.html + manifest.json reference integrity', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

  function extractAll() {
    const urls = []
    // <link rel="icon|apple-touch-icon" href="...">
    const linkRe = /<link\b[^>]*\brel\s*=\s*"(?:icon|apple-touch-icon)"[^>]*>/gi
    for (const m of indexHtml.matchAll(linkRe)) {
      const href = m[0].match(/\bhref\s*=\s*"([^"]+)"/i)
      if (href) urls.push({ kind: 'link', raw: href[1] })
    }
    // <meta property="og:image" content="...">
    const ogRe = /<meta\b[^>]*\bproperty\s*=\s*"og:image"[^>]*>/gi
    for (const m of indexHtml.matchAll(ogRe)) {
      const c = m[0].match(/\bcontent\s*=\s*"([^"]+)"/i)
      if (c) urls.push({ kind: 'og:image', raw: c[1] })
    }
    // <meta name="twitter:image" content="...">
    const twRe = /<meta\b[^>]*\bname\s*=\s*"twitter:image"[^>]*>/gi
    for (const m of indexHtml.matchAll(twRe)) {
      const c = m[0].match(/\bcontent\s*=\s*"([^"]+)"/i)
      if (c) urls.push({ kind: 'twitter:image', raw: c[1] })
    }
    // JSON-LD "logo": "..."
    const logoRe = /"logo"\s*:\s*"([^"]+)"/g
    for (const m of indexHtml.matchAll(logoRe)) {
      urls.push({ kind: 'jsonld:logo', raw: m[1] })
    }
    return urls
  }

  it('every referenced favicon/og/twitter/json-ld URL resolves to an existing public/ file', () => {
    const urls = extractAll()
    // sanity: we parsed at least the expected references
    expect(urls.length).toBeGreaterThanOrEqual(4)
    const missing = []
    for (const { kind, raw } of urls) {
      const rel = basenameFromUrl(raw)
      const abs = path.join(PUBLIC, rel)
      if (!fs.existsSync(abs)) missing.push(`${kind}: ${raw} -> public/${rel}`)
    }
    expect(missing).toEqual([])
  })

  it('favicon <link> hrefs do NOT have a leading slash (base-path subpath fix)', () => {
    // Under base '/KTechAICyberWeb/', a leading-slash href resolves against
    // the origin root (origin/favicon.ico) — 404. The href must be relative
    // (favicon.ico) so it resolves against the document URL.
    const linkTags = indexHtml.match(/<link\b[^>]*\brel\s*=\s*"(?:icon|apple-touch-icon)"[^>]*>/gi) || []
    for (const tag of linkTags) {
      const href = tag.match(/\bhref\s*=\s*"([^"]+)"/i)
      if (!href) continue
      // strip query/hash, then assert NOT starting with '/'
      const cleaned = href[1].split(/[?#]/)[0]
      expect(cleaned.startsWith('/')).toBe(false)
    }
  })

  it('manifest.json icons[].src resolve (relative, no leading slash) and exist under public/', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'manifest.json'), 'utf8'))
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThan(0)
    for (const icon of manifest.icons) {
      const src = String(icon.src)
      // manifest src resolves against the manifest's own URL, so leading-slash
      // is wrong under the subpath base — must be relative.
      expect(src.startsWith('/')).toBe(false)
      const abs = path.join(PUBLIC, basenameFromUrl(src))
      expect(fs.existsSync(abs)).toBe(true)
    }
  })
})

// --- Group B: dimensions --------------------------------------------------

describe('#263 Group B — generated asset dimensions + sizes', () => {
  it('og-image.jpg is exactly 1200×630 JPEG and >20KB', () => {
    const buf = readPublic('og-image.jpg')
    expect(buf.length).toBeGreaterThan(20 * 1024)
    const { width, height } = jpegDimensions(buf)
    expect(width).toBe(1200)
    expect(height).toBe(630)
  })

  it('twitter-image.jpg is exactly 1200×630 JPEG and >20KB', () => {
    const buf = readPublic('twitter-image.jpg')
    expect(buf.length).toBeGreaterThan(20 * 1024)
    const { width, height } = jpegDimensions(buf)
    expect(width).toBe(1200)
    expect(height).toBe(630)
  })

  it('apple-touch-icon.png is exactly 180×180 and >2KB', () => {
    const buf = readPublic('apple-touch-icon.png')
    expect(buf.length).toBeGreaterThan(2 * 1024)
    const { width, height } = pngDimensions(buf)
    expect(width).toBe(180)
    expect(height).toBe(180)
  })

  it('icon-192.png is exactly 192×192 and >2KB', () => {
    const buf = readPublic('icon-192.png')
    expect(buf.length).toBeGreaterThan(2 * 1024)
    const { width, height } = pngDimensions(buf)
    expect(width).toBe(192)
    expect(height).toBe(192)
  })

  it('icon-512.png is exactly 512×512 and >2KB', () => {
    const buf = readPublic('icon-512.png')
    expect(buf.length).toBeGreaterThan(2 * 1024)
    const { width, height } = pngDimensions(buf)
    expect(width).toBe(512)
    expect(height).toBe(512)
  })

  it('logo.png is exactly 512×512 and >2KB', () => {
    const buf = readPublic('logo.png')
    expect(buf.length).toBeGreaterThan(2 * 1024)
    const { width, height } = pngDimensions(buf)
    expect(width).toBe(512)
    expect(height).toBe(512)
  })

  it('favicon.ico is a valid ICO container (signature + count>=1 + >1000 bytes)', () => {
    const buf = readPublic('favicon.ico')
    expect(buf.length).toBeGreaterThan(1000)
    const { count } = icoHeader(buf)
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

// --- Group C: IP gate -----------------------------------------------------

describe('#263 Group C — generator IP gate (no trademarked wordmark)', () => {
  const scriptPath = path.join(ROOT, 'scripts', 'generate-seo-assets.mjs')

  it('scripts/generate-seo-assets.mjs exists', () => {
    expect(fs.existsSync(scriptPath)).toBe(true)
  })

  it('does NOT contain KASIKORN / KBank / 开泰银行 wordmarks', () => {
    const src = fs.readFileSync(scriptPath, 'utf8')
    expect(src).not.toContain('KASIKORN')
    expect(src).not.toContain('KBank')
    expect(src).not.toContain('开泰银行')
  })

  it('DOES contain the original "KTech" wordmark + #00ffcc cyber motif', () => {
    const src = fs.readFileSync(scriptPath, 'utf8')
    expect(src).toContain('KTech')
    expect(src).toContain('#00ffcc')
  })
})
