# #226 — REVIEW (process, findings, residual gaps)

## Process

1. **Branch:** created `autodev-226-desktop-a11y` from `origin/main` (the pre-supplied branch
   name did not exist locally; created it from the latest `origin/main` tip `15a08770`).
2. **Build + preview:** `node_modules/.bin/vite build` (passed, 1.27s) →
   `node_modules/.bin/vite preview --port 4173 --strictPort` (background). Verified
   `curl -sI http://localhost:4173/KTechAICyberWeb/about` returns `200 OK`.
3. **Slug check:** confirmed `ktech-achieves-iso27001-certification` exists in
   `src/data/news.json` (the first listed slug) before using it for the news-detail route.
4. **Capture:** ran `node_modules/.bin/lighthouse <url> --preset=desktop --only-categories=accessibility
   --output=json --output-path=tickets/226/evidence/lighthouse-desktop-<slug>.report.json
   --max-wait-for-load=45000 --chrome-flags="--headless --no-sandbox --disable-gpu"` for each
   of the 6 routes. `--preset=desktop` (NOT raw `--form-factor=desktop`) was used so the saved
   JSON carries `configSettings.formFactor === "desktop"` (iter-16 honesty gate).
5. **Honesty assertion + score table:** a Python script re-derived `configSettings.formFactor`
   and `categories.accessibility.score` from each saved JSON. All 6 = desktop; scores
   98 / 93 / 100 / 100 / 100 / 96.
6. **Quick-fix loop:** SKIPPED. All 6 ≥ 90 (min 93). The pre-flagged Contact.vue gray literals
   were left untouched because `/contact` already scores 100.
7. **No-regression:** vitest run + build verified (see IMPLEMENTATION_SUMMARY).
8. **Docs:** this REVIEW.md + IMPLEMENTATION_SUMMARY.md.

## Findings

- All 6 routes pass the ≥90 a11y gate on desktop; 3 of 6 score a perfect 100.
- No source edits were required or made.
- The `/about` route has the lowest score (93) due to a weighted `aria-required-children`
  finding (w=10). This is a real a11y defect but is out of scope for this lean capture ticket
  (the plan's quick-fix budget is for sub-90 routes only; `/about` is at 93).

## Residual gaps

1. **`/about` (93) — `aria-required-children` (w=10).** An ARIA role on the about page is
   missing required child roles. Highest-impact unfixed finding across the 6 routes. Recommend
   a dedicated ticket to triage the about-page ARIA structure.
2. **`/about` (93) + `/home` (98) — `heading-order` (w=3).** Heading elements are not in
   sequentially-descending order on both routes. Cosmetic-ish but flagged by Lighthouse.
3. **`/news-detail` (96) — `list` (w=7).** A list element contains non-`<li>` children
   (likely the news-detail article body or related-items list). Worth a follow-up.
4. **Services sub-routes (7 of 8 un-audited).** See `[~] partial` note in IMPLEMENTATION_SUMMARY.
   Follow-up issue filed (number recorded below once created).

## Pre-existing test failure (NOT caused by this ticket)

`src/views/__tests__/PositionList.test.ts > renders one position card per loaded position`
fails because `currentLanguage.value` is referenced directly in the PositionList `<template>`
(refs do not auto-unwrap in template expressions → throws → no `.position-card` elements render).
This is **pre-existing baseline state**: at the vitest run, HEAD was byte-identical to
`origin/main` (SHA `15a08770`), and this ticket made zero source edits. Filed separately as
#287 per the PositionList render-bug memory note. Unrelated to a11y capture.

## Model-cap honesty

All scores are within the plan's HARD-CAP scope (≥90). No route was chased to 100. The
residual findings above are documented for future tickets, not addressed here.
