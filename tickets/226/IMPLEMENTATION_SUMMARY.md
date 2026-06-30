# #226 — Desktop Lighthouse a11y capture for key routes

## Scope

Capture **desktop** (not mobile) Lighthouse accessibility JSON for 6 key routes,
assert each ≥90 (target 100), and apply a quick route-specific fix only if a route
scored below threshold.

- Form factor: **desktop** (`--preset=desktop`, which sets `configSettings.formFactor === "desktop"`).
- Build: production `vite build` served via `vite preview --port 4173 --strictPort`
  at the `/KTechAICyberWeb/` subpath (vite.config `base`).
- Lighthouse binary: project-local `node_modules/.bin/lighthouse`.

> **Scope reconciliation (title vs deliverable):** Issue #226's *title* reads "…
> on mobile" (the form factor #190 used for Home). This ticket captures **desktop**,
> per the dispatcher's explicit scope instruction for this iteration. The form factor
> is never misrepresented — every artifact, file name, and JSON `formFactor` field is
> honestly labeled `desktop`. The per-route **mobile** capture for the non-Home routes
> is owed for completeness and is tracked in follow-up **#291**. (#190 already shipped
> mobile Home = 100 via component-level fixes that apply viewport-agnostically, so
> mobile scores on the other routes are expected to hold — but were not measured here.)

## Route → score table

Every score below is **re-derived from the saved JSON** (`categories.accessibility.score` × 100, rounded).
The form factor is read from `configSettings.formFactor` in each JSON.

| Route | URL | Slug | a11y score | formFactor | Evidence file |
|---|---|---|---:|---|---|
| `/` | `/KTechAICyberWeb/` | home | **98** | desktop | `tickets/226/evidence/lighthouse-desktop-home.report.json` |
| `/about` | `/KTechAICyberWeb/about` | about | **93** | desktop | `tickets/226/evidence/lighthouse-desktop-about.report.json` |
| `/services/blockchain` | `/KTechAICyberWeb/services/blockchain` | services-blockchain | **100** | desktop | `tickets/226/evidence/lighthouse-desktop-services-blockchain.report.json` |
| `/contact` | `/KTechAICyberWeb/contact` | contact | **100** | desktop | `tickets/226/evidence/lighthouse-desktop-contact.report.json` |
| `/news` | `/KTechAICyberWeb/news` | news | **100** | desktop | `tickets/226/evidence/lighthouse-desktop-news.report.json` |
| `/news/ktech-achieves-iso27001-certification` | `…/news/ktech-achieves-iso27001-certification` | news-detail | **96** | desktop | `tickets/226/evidence/lighthouse-desktop-news-detail.report.json` |

**formFactor honesty assertion:** all 6 reports have `configSettings.formFactor === "desktop"`
(verified programmatically; `ALL_FORMFACTOR_DESKTOP = True`).

**Threshold gate:** all 6 routes ≥ 90. Minimum observed: 93 (`/about`). Five of six are ≥ 96;
three are perfect 100s.

## Fix log

**No route-specific a11y fix was applied.** All six routes were already ≥ 90 on the baseline
build, so the Step 4 quick-fix loop was skipped entirely per the plan's "do not over-iterate"
directive.

The plan pre-flagged `src/views/Contact.vue` as a likely fix candidate (hardcoded low-contrast
grays at lines 485/493/567/743: `#888`, `#666`). The captured `/contact` desktop score is
**100** — the contrast audit already passes on desktop. Touching those literals would have
been unjustified churn against a passing audit, so they were left untouched.

Conclusion: **no route-specific a11y failures; the component-level #190 fixes (Header ARIA
role wrapper, `useLanguage.t()` params contract, focus-trap wiring) held across all 6 routes.**

For completeness, the residual (sub-100) a11y audit findings — documented for future triage,
NOT fixed under this ticket's lean scope:

- **home (98):** `heading-order` (w=3, heading elements not in sequentially-descending order);
  `aria-allowed-role` (w=1, ARIA role on incompatible element).
- **about (93):** `aria-required-children` (w=10, ARIA role missing required child roles);
  `heading-order` (w=3); `aria-allowed-role` (w=1).
- **news-detail (96):** `list` (w=7, list does not contain only `<li>` + script-supporting elements).

## Coverage scope — `[~] partial`

The issue names "Services (and sub-services)". This ticket audited **1 of 8** service routes
(`/services/blockchain`); the remaining 7 sub-service routes share the same `Service*.vue`
layout shell + the global components fixed in #190, so they are expected to hold — but
per-route captures were not saved.

- Services audited: `/services/blockchain` ✅ (score 100)
- Services deferred (7): `/services/supply-chain-finance`,
  `/services/project-and-program-management`, `/services/big-data-ai`, `/services/retail-lending`,
  `/services/cross-border-payment`, `/services/digital-asset-custody`, `/services/stablecoin`.

**Deferred: #289** — [a11y] Capture desktop Lighthouse a11y for remaining 7 services sub-routes
(https://github.com/jasonhou007/KTechAICyberWeb/issues/289).

**Deferred: #291** — [a11y] Capture **mobile** Lighthouse a11y for key routes
(About/Services/Contact/News) (https://github.com/jasonhou007/KTechAICyberWeb/issues/291).
(Issue #226's title scopes the work to mobile; this iteration delivered desktop per the
dispatcher's instruction. Mobile per-route measurement is owed and tracked in #291.)

## No-regression verification

- `node_modules/.bin/vite build` — passes (1.27s; output verified).
- `node_modules/.bin/vitest run` — 99/100 files pass, 2506/2507 tests pass. The single
  failure (`PositionList.test.ts > renders one position card per loaded position`) is
  **pre-existing baseline state**: at the time of this run, HEAD was byte-identical to
  `origin/main` (SHA `15a08770f...`), and this ticket made **zero source edits** (only
  untracked evidence + docs under `tickets/226/`). The PositionList render bug is a known
  pre-existing defect (filed separately) and is unrelated to a11y capture work.
- Working tree: only `tickets/226/` untracked; no `src/` modifications.

## Commits

- `#226 chore(a11y): capture desktop Lighthouse a11y evidence for key routes`
  (single commit; no separate code commit because no source was edited.)
