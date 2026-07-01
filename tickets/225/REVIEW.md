# #225 — REVIEW (process, findings, residual gaps)

## Process

1. **Issue read:** `gh issue view 225` — desktop Lighthouse a11y on Home (the
   dispatcher's "mobile" framing was a mix-up; #190 already shipped mobile
   Home = 100). Trusted the issue body + the supplied baseline.
2. **Baseline inspected:** re-derived from
   `tickets/226/evidence/lighthouse-desktop-home.report.json` via python3 —
   `formFactor=desktop`, score `0.98`, exactly two failing audits
   (`aria-allowed-role` w=1, `heading-order` w=3). Confirmed the plan's
   diagnosis matches the artifact.
3. **TDD (Red first):**
   - Wrote **new** `src/components/__tests__/PipelineCard.test.ts` — asserts
     root tagName `li`, `role="listitem"`, `pipeline-card` class. Ran it: it
     FAILED on the current `<article>` (`expected 'article' to be 'li'`) — RED.
   - Edited `src/components/__tests__/SelfDrivingDemo.test.ts` — added
     `tagName === 'p'` assertion on `.self-driving-heading`. Ran it: FAILED on
     the current `<h3>` (`expected 'h3' to be 'p'`) — RED.
4. **Source edits (Green):**
   - `PipelineCard.vue`: `<article role="listitem">` → `<li role="listitem">`
     (bindings/class/role kept); updated comment.
   - `SelfDrivingDemo.vue`: `<h3 class="self-driving-heading neon-text">` →
     `<p …>` (classes/binding kept); updated comment (the old comment
     incorrectly claimed the h3 kept heading order valid).
   - Re-ran the two tests + the visual-css test → all GREEN (35/35).
5. **No-regression:** full `vitest run` (2521/2527 pass, 0 fail) + `vite build`
   (1.20s, green).
6. **Recapture:** `vite preview --port 4173` → curl confirmed HTTP 200 at
   `/KTechAICyberWeb/` → `lighthouse --preset=desktop --only-categories=accessibility`
   → saved to `tickets/225/evidence/lighthouse-desktop-home.report.json`.
7. **Honesty verify:** python3 re-derive from the fresh JSON —
   `formFactor=desktop`, score `1.00` (100), `aria-allowed-role=1`,
   `heading-order=1`, zero remaining failing audits. Output pasted into
   IMPLEMENTATION_SUMMARY (not retyped).
8. **Watch-item (native `<li>` bullet):** confirmed structurally neutralized —
   `.pipeline-card { display: flex }` (scoped, line 65) overrides `<li>`'s
   default `display: list-item`, and the parent `.pipeline-track` is a
   `<div role="list">` (no UA list styling on the container). No
   `list-style: none` edit warranted.
9. **Docs:** this REVIEW.md + IMPLEMENTATION_SUMMARY.md.

## Findings

- Desktop Home a11y **98 → 100**. Both failing audits resolved with two
  minimal, semantics-first edits (no ARIA hacks, no `tabindex` surgery).
- Fix 1 is a host-tag swap that *preserves* the explicit `role="listitem"` —
  the role was correct, the *host element* was wrong.
- Fix 2 demotes a heading to a styled `<p>` — the label was correctly named
  via `aria-label` on the section already, so the heading was redundant AND
  mis-ordered; removing it from the outline is strictly better.
- Zero new failing audits introduced. The recapture reports a clean 100.

## Residual gaps (NOT in this ticket's scope)

1. **`/about` (93) — `aria-required-children` (w=10)** (from #226). Highest-
   impact unfixed desktop a11y finding across audited routes. Out of scope for
   #225 (Home-only); needs its own ticket.
2. **`/news-detail` (96) — `list` (w=7)** (from #226). A list element contains
   non-`<li>` children. Out of scope (Home-only).
3. **Mobile capture for non-Home routes** — tracked in #291.
4. **7 of 8 service sub-routes unaudited on desktop** — tracked in #289.

## Notes for the reviewer

- The SelfDrivingDemo.vue comment block was *factually wrong* before this
  ticket (it claimed the h3 kept heading order valid; it did the opposite).
  The new comment explains the real DOM-order constraint (section mounts before
  the page's first h2) and the #225 fix. Future readers should trust the new
  comment, not git-blame the old one.
- `PipelineCard.vue` keeps `role="listitem"` explicitly even though `<li>`'s
  implicit role makes it redundant. This is intentional: it documents the
  parent-`role="list"` SR contract at the call site and is allowed by the ARIA
  spec (explicit role == implicit role). Lighthouse agrees (audit passes).
