# Adversarial first-read review 6 — FAIL

Reviewed 2026-09-02 UTC against
<https://quote-decision-log.sociobot.in> and a clean local clone at
`6fe83fae2d37408be77a31c7b06e2381388435df`. This was a read-only product
review: no product code, deployment resource, billing endpoint, DNS record, or
other service was changed or opened.

## Verdict

**FAIL.** One minor test-coverage finding remains. All user-facing claims and
observed flows passed, but PASS requires zero findings.

## Cold first screen

Fresh Chromium contexts opened the live home page before scrolling at 390 × 844
and 1440 × 768. The 390 px document width was exactly 390 px.

- **What it does:** review quotes before sending them and keep a client
  decision record.
- **For whom:** tiny agencies that need a checked quote and a clear client
  answer before work starts.
- **What to select first:** **Try it with sample data**.

The exact first-screen text is “Review quotes before you send them.”,
“For tiny agencies that need one checked quote and a clear client answer before
work starts.”, and “See two sample quotes; no data is saved.” The action and
all three facts are visible before scrolling at both sizes. At 1440 × 768 the
three fact items end above the viewport bottom; the former F-5-1 condition is
fixed. No first-read blocking finding applies.

## Findings

### Minor

#### F-6-1 — The service-worker update regression targets obsolete cache names

- **Location and exact code:** `tests/app.spec.ts:395-401` rewrites and waits
  for `qd-shell-v10` / `qd-assets-v10`, while `public/sw.js:1-2` ships
  `qd-shell-v13` / `qd-assets-v13`. The prior handoff also records this as a
  known gap.
- **Verification:** the full suite passes, but this test no longer changes the
  current worker's cache-version constants. It therefore cannot prove that a
  `v13` update produces the displayed “A fresh version is ready.” state and
  activates a new current cache namespace.
- **Why this matters:** offline update activation is a release-safety path.
  A passing regression test with stale version literals can conceal a break
  when the service-worker cache version changes.
- **Concrete fix:** derive the two source cache labels from the current worker
  fixture, or update the test to rewrite `v13` and assert the generated
  replacement cache names. Keep the assertions for the update notice,
  activation, and retirement of the prior current cache.

## Copy audit

Counts are whitespace-delimited. Headings, navigation labels, button labels,
commands, and URLs are checked separately. No landing or README sentence is
over 22 words, uses a banned marketing adjective, changes a product term, or
uses a non-informative heading. Landing actions name their outcomes.

### Landing page

| Words | Sentence or fact | Result |
| ---: | --- | --- |
| 1 | Online | Pass |
| 4 | Stored on this device | Pass |
| 6 | Review quotes before you send them. | Pass |
| 16 | For tiny agencies that need one checked quote and a clear client answer before work starts. | Pass |
| 8 | See two sample quotes; no data is saved. | Pass |
| 4 | Stored in this browser | Pass |
| 6 | Works offline after the first visit | Pass |
| 8 | Five quotes free · $19 once for unlimited | Pass |
| 3 | Review before sending. | Pass |
| 6 | Review, send, then record the answer. | Pass |
| 5 | Capture scope, value, and expiry. | Pass |
| 7 | A named teammate checks the exact version. | Pass |
| 8 | Share a link that carries the reviewed quote. | Pass |
| 5 | Import the client’s consent receipt. | Pass |
| 9 | Quote records stay in this browser on this device. | Pass |
| 9 | Anyone with a client link can read the quote. | Pass |
| 10 | This is not a payment, document-editing, or regulated electronic-signature service. | Pass |
| 4 | Use five quotes free. | Pass |
| 8 | Pay $19 once to remove the quote limit. | Pass |
| 8 | Quote review and client decisions for tiny agencies. | Pass |
| 6 | Built by Param Factory · v1.0.8 | Pass |

Headings are “Quote review and decision record”, “How it works”, “Review,
send, then record the answer”, “Privacy and limits”, and “Price”. They name a
job, section, or workflow. The actions **Try it with sample data**, **Create a
quote**, **Read Privacy**, **Read Terms**, and **Open $19 checkout** are
result-naming verbs.

### README

| Words | Sentence | Result |
| ---: | --- | --- |
| 18 | Quote Decision helps tiny agencies review a quote before sending it and keep a clear client decision trail. | Pass |
| 15 | It keeps quote records in this browser and can work offline after the first visit. | Pass |
| 7 | Try the shipped sample workspace at <https://quote-decision-log.sociobot.in/demo>. | Pass |
| 11 | It starts with two realistic quotes in a separate demo database. | Pass |
| 20 | Use Reset demo to restore them or Start for real to discard demo changes and open your own quote log. | Pass |
| 10 | keeps quote data in this browser on this device; | Pass |
| 9 | shows a named review before a quote is send-ready; | Pass |
| 13 | puts the reviewed quote in a link you can send to the client; | Pass |
| 5 | exports portable JSON decision receipts; | Pass |
| 11 | retains a client's own receipt on that device for later download; | Pass |
| 11 | exports the whole log as JSON and a summary as CSV; | Pass |
| 9 | shows an unchangeable ID for each saved quote version; | Pass |
| 6 | works offline after the first visit; | Pass |
| 11 | supports five free quotes and displays a $19 one-time unlimited option. | Pass |
| 14 | Quote Decision is not a payment tool, document editor, or regulated electronic signature service. | Pass |
| 12 | A decision receipt records explicit click consent and a typed name only. | Pass |
| 13 | Every visitor-facing product claim is listed with its exact browser test in `.factory/claims.json`. | Pass |
| 7 | The sample sandbox is described in `.factory/demo.md`. | Pass |
| 5 | Requires Node.js 20 or later. | Pass |
| 8 | Each site address keeps its own browser data. | Pass |
| 7 | The normal quote log uses `quote-decision-log` IndexedDB. | Pass; technical setup |
| 13 | The demo uses `demo:quote-decision-log` and does not read or write the normal database. | Pass |
| 12 | Client receipts use the separate `quote-decision-client-receipts` database, with a separate demo namespace. | Pass; technical setup |
| 10 | `npm run build` creates `dist/` with `dist/index.html` at its root. | Pass |
| 10 | The browser suite checks desktop and 390 px mobile layouts. | Pass |
| 15 | It also checks keyboard use, privacy, demo, offline, updates, recovery, and the main quote flow. | Pass |
| 10 | Quotes and client receipts remain in separate browser IndexedDB databases. | Pass; technical privacy detail |
| 10 | License tokens and their cached daily verification result use localStorage. | Pass; technical privacy detail |
| 11 | There are no analytics, advertising trackers, remote fonts, or runtime CDNs. | Pass |
| 18 | Client links contain the quote in the URL fragment, so the app server does not receive the fragment. | Pass |
| 9 | Anyone who has the link can read its contents. | Pass |
| 16 | Use Data and license to export JSON or CSV, import a backup, or delete local quotes. | Pass |
| 12 | A client can download or delete the local receipt from its link. | Pass |
| 9 | Read the complete privacy policy and terms before purchase. | Pass |
| 6 | Publish `dist/` to the static host. | Pass |
| 8 | `public/staticwebapp.config.json` configures application routes and the 404 page. | Pass; technical setup |
| 7 | It also sets security and cache headers. | Pass |
| 7 | The service worker requires HTTPS in production. | Pass; technical setup |
| 11 | The product-specific visual system and generated-art provenance are documented in `.factory/design.md`. | Pass |
| 11 | The social preview is derived from the same original dispatch-gate artwork. | Pass |
| 6 | Source art is retained in `assets/src/`. | Pass |
| 1 | MIT. | Pass |
| 2 | See LICENSE. | Pass |

README headings are informative: “What it does”, “Develop”, “Verify”,
“Privacy and data”, “Deploy”, and “Design and license”. All claim-like landing
and README text maps to an entry in `.factory/claims.json`; no unlisted claim
was found.

## Demo, privacy, and claims

- The landing action opens `/demo` in one click. Its first screen already
  shows Cedar & Kite's accepted `$2,100.00` Product photography quote and
  Harrow & Vale's `$4,800.00` send-ready Website launch quote.
- The persistent banner is exactly “Demo — sample data, nothing is saved.”
  **Reset demo** restores the seeds. **Start for real** clears the two demo
  databases, returns to normal mode, and leaves normal records unchanged.
- Fresh `/demo` and `/?demo=1` checks created demo storage only. The demo
  request log contained same-origin GETs only. The registered offline test
  passed in its own fresh 390 px context after first load.
- Every command in the claims manifest passed separately from
  `/tmp/quote-decision-review6`:

| Claim ID | Result |
| --- | --- |
| demo-sample-data | Pass |
| quote-fields | Pass |
| local-device-privacy | Pass |
| no-tracking-remote-resources | Pass |
| json-export | Pass |
| csv-export | Pass |
| quote-fingerprint | Pass |
| review-checkpoint | Pass |
| client-link | Pass |
| decision-receipt | Pass |
| decision-consent-record | Pass |
| receipt-import | Pass |
| client-decision-retention | Pass |
| backup-import | Pass |
| delete-local-quotes | Pass |
| delete-client-receipt | Pass |
| unlimited-price | Pass |
| free-five-quotes | Pass |
| offline-reload | Pass |

## Earlier findings recheck

Every earlier review, polish record, and handoff was read. Each prior finding
was rechecked on the live site and in the current source.

| Earlier IDs | Current result |
| --- | --- |
| QD-001 | Fixed: product-specific Sociobot checkout handoff, with no embedded payment provider. |
| QD-002 | Fixed: receipts require the exact consent text. |
| QD-003 | Fixed: invalid backups are validated before replacement. |
| QD-004 | Fixed: valid receipt import immediately shows the decision. |
| QD-005 | Fixed: required fields reject whitespace-only values. |
| QD-006 | Fixed: legal links retain 44 px mobile targets. |
| QD-007 | Fixed: hashed assets have immutable caching. |
| QD-008 | Fixed: CSP, permissions, referrer, HSTS, MIME, and nosniff policy remain present. |
| QD-009 | Fixed: text and safe-money bounds are enforced before persistence. |
| QD-010 | Fixed: imported consent is bound to its quote version and fingerprint. |
| QD-011 | Fixed: the suite retains one retry and completes cleanly. |
| QD-012 | Fixed: all 19 claims map to one tagged test and passed separately. |
| QD-013 | Fixed: both demo entries use seeds, isolated namespaces, reset, and destructive exit. |
| QD-014 | Fixed: the skip link is first and route changes focus the h1. |
| QD-015 | Fixed: mobile controls and legal links retain 44 px targets. |
| QD-016 | Fixed: invalid license verification redraws the free state. |
| QD-017 | Fixed: routes, titles, metadata, shared navigation, and designed 404 remain intact. |
| QD-018 | Fixed: blocked service-worker registration fails softly. |
| QD-019 | Fixed: client receipt retention and deletion remain isolated. |
| QD-020 | Fixed: client-link copy warns that anyone with the link can read the quote. |
| QD-021 | Fixed: the focused 390 px skip link is at least 44 px high. |
| F-1-1 through F-1-13 | Fixed: shared chrome, consent/data claims, metadata, accurate link wording, and plain README copy remain present. |
| F-2-1 through F-2-2 | Fixed: receipt import is registered and user-facing storage wording is plain. |
| F-3-1 through F-3-5 | Fixed: demo exit discards demo data; quote fields are claimed; Privacy/Price landing sections and plain README storage wording remain. |
| F-4-1 | Fixed: sitemap contains all stable app routes and deployment tests protect that inventory. |
| F-5-1 | Fixed: all three desktop first-screen facts fit above the 1440 × 768 fold. |

The handoff's remaining service-worker test-maintenance gap is reopened as
F-6-1. No other earlier finding regressed.

## Structure, accessibility, and visual identity

- `/`, `/demo`, `/new`, `/data`, `/demo/new`, `/demo/data`, `/privacy/`,
  `/terms/`, `/offline.html`, `/404.html`, `robots.txt`, `sitemap.xml`,
  manifest, icon, and social image all returned 200. An unknown route returned
  the designed 404 with HTTP 404 and routes back to the product.
- The sitemap lists every stable route. Headers and footers are consistent.
  Back navigation restores the address and focuses the h1. Route metadata,
  canonical URLs, Open Graph/Twitter tags, favicon, title pattern, `lang`, one
  h1, and a main landmark were checked.
- `verify-url.sh` reported HTTPS 200, no console errors, one h1, `lang=en`, a
  main landmark, complete image alternatives, and labelled buttons. Targeted
  live Playwright checks passed 7 tests with 5 expected project skips,
  including axe scans with no serious or critical finding.
- The dark art-deco dispatch rail, brass checkpoint, stepped shapes, original
  gate art, condensed type, visible focus states, and reduced-motion policy
  match `.factory/design.md`. The result is not a generic SaaS template.

## Quality gates and missed leverage

- Clean clone: `npm ci`, `npm test` (12 passed), typecheck, lint, build,
  `npm run test:e2e` (passed), and `npm run test:performance` (1 passed).
  Build output is 17.04 kB gzip JavaScript and 6.29 kB gzip CSS.
- The brief-implied exports, backup import, receipt export/import, expiry,
  review checkpoint, and client accept/decline are present. Hosted sync would
  contradict the local-device model. An AI step would not remove an obvious
  task from this deterministic approval and record workflow. No decorative AI
  or embedded provider key is present.

## What would make this perfect

Resolve F-6-1 and rerun the service-worker update regression against the
current cache version. With that test proving the shipped worker's update
rollover, no finding remains.
