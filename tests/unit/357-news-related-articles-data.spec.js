import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import enLocale from '../../src/locales/en.json'
import zhLocale from '../../src/locales/zh.json'
import newsData from '../../src/data/news.json'

/**
 * #357 — News related-articles data-integrity gate.
 *
 * Background: the related-articles section built in #305 was dead code because
 * src/data/news.json had only 1 article per category, so `relatedArticles`
 * (same-category, excluding the current article) always returned an empty
 * array and no related card ever reached the live DOM.
 *
 * This data-integrity gate reads the REAL news.json from disk (NOT mocked) and
 * asserts the dataset is dense enough for the related-articles renderer to
 * produce at least one card for every article. It also enforces:
 *  - AC #1: each of the 4 categories has >= 2 articles
 *  - AC #3: every article has all 10 required fields non-empty
 *  - AC (related): for every article there is >= 1 same-category sibling
 *    (no article renders zero related cards)
 *  - AC #5: every article.image resolves to a real file under public/
 *  - AC (i18n): every article.altKey exists as a dotted path in BOTH
 *    en.json and zh.json
 */

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'public')

const REQUIRED_FIELDS = [
  'id',
  'slug',
  'title',
  'excerpt',
  'content',
  'category',
  'date',
  'image',
  'altKey',
  'author',
]

const EXPECTED_CATEGORIES = [
  'Company News',
  'Industry Insights',
  'Events',
  'Technology Updates',
]

/**
 * Resolve a dotted.key path against a nested object; returns undefined if any
 * segment is missing. `news.articleAlts.iso27001` → obj.news.articleAlts.iso27001.
 */
function resolveDotted(obj, dotted) {
  return String(dotted)
    .split('.')
    .reduce((acc, seg) => (acc == null ? undefined : acc[seg]), obj)
}

describe('#357 — News related-articles data integrity', () => {
  describe('category density (AC #1: each category has >= 2 articles)', () => {
    for (const cat of EXPECTED_CATEGORIES) {
      it(`category "${cat}" has at least 2 articles`, () => {
        const count = newsData.filter((a) => a.category === cat).length
        expect(
          count,
          `category "${cat}" must have >= 2 articles so related-articles can render; got ${count}`,
        ).toBeGreaterThanOrEqual(2)
      })
    }
  })

  describe('required fields (AC #3: all 10 fields present + non-empty)', () => {
    for (const article of newsData) {
      it(`article id=${article.id} (${article.slug}) has all required fields non-empty`, () => {
        for (const field of REQUIRED_FIELDS) {
          const v = article[field]
          expect(
            v !== undefined && v !== null && String(v).trim() !== '',
            `article id=${article.id} field "${field}" is missing or empty`,
          ).toBe(true)
        }
      })
    }
  })

  describe('related-articles feasibility (every article has >= 1 same-category sibling)', () => {
    for (const article of newsData) {
      it(`article id=${article.id} (${article.category}) has at least 1 same-category sibling`, () => {
        const siblings = newsData.filter(
          (x) => x.category === article.category && x.id !== article.id,
        )
        expect(
          siblings.length,
          `article id=${article.id} (${article.slug}) has no same-category sibling → related-articles renders 0 cards`,
        ).toBeGreaterThanOrEqual(1)
      })
    }
  })

  describe('image files resolve (AC #5)', () => {
    for (const article of newsData) {
      it(`article id=${article.id} image "${article.image}" exists under public/`, () => {
        const rel = String(article.image).replace(/^\//, '')
        const abs = path.join(PUBLIC, rel)
        expect(
          fs.existsSync(abs),
          `article id=${article.id} image "${article.image}" not found at ${abs}`,
        ).toBe(true)
      })
    }
  })

  describe('altKey i18n resolution (both en + zh)', () => {
    for (const article of newsData) {
      it(`article id=${article.id} altKey "${article.altKey}" resolves in en.json and zh.json`, () => {
        const en = resolveDotted(enLocale, article.altKey)
        const zh = resolveDotted(zhLocale, article.altKey)
        expect(
          en,
          `en.json missing altKey "${article.altKey}" for article id=${article.id}`,
        ).toBeTruthy()
        expect(
          zh,
          `zh.json missing altKey "${article.altKey}" for article id=${article.id}`,
        ).toBeTruthy()
      })
    }
  })
})
