# Adversarial first-read review 3 — FAIL

Reviewed 2026-09-01 UTC against
<https://quote-decision-log.sociobot.in> and repository commit
`382f44f33d5c775491ba6786dc9e190977cedfaa`. This review changed no product
code or deployment resource.

## Verdict

**FAIL.** Five findings remain: two blocking, two medium, and one minor. PASS
requires zero findings and no untested claim.

## Cold first screen

Fresh Chromium contexts opened the live site at 390 × 844 and 1440 × 900.
Before scrolling, the screen answered all three first-visit questions:

- **What it does:** review a quote before it is sent and keep the client's
  answer.
- **For whom:** tiny agencies that need a checked quote before work starts.
- **What to select first:** **Try it with sample data**.

The exact supporting copy is “For tiny agencies that need one checked quote
and a clear client answer before work starts.” The primary action and “See two
sample quotes; no data is saved.” are visible at 390 px. There is no blocking
first-screen clarity finding.

## Findings

### Blocking

#### F-3-1 — Demo changes survive “Start for real” despite “nothing is saved”

- **Location and exact text:** persistent demo banner, “Demo — sample data,
  nothing is saved.”; `/demo` control, “Start for real”.
- **Verification:** in a fresh live browser context, reset the demo, add a
  third quote named “Persisted Demo Client”, select **Start for real**, then
  reopen `/demo`. The demo still showed three quotes and the added quote. The
  real database remained separate and untouched. Source confirms that “Start
  for real” is a plain link to `/`; only the separate **Reset demo** handler
  clears demo quotes and receipts (`src/main.ts:110`, `src/main.ts:504`,
  `src/main.ts:558`). `.factory/demo.md` also says demo data remains until a
  reset or browser-site-data cleanup.
- **Why this misleads:** “nothing is saved” tells a visitor that trial edits do
  not survive. The required demo contract also says leaving demo mode discards
  demo data or explicitly offers to keep it. The current exit silently keeps
  those edits.
- **Concrete fix:** make **Start for real** clear both
  `demo:quote-decision-log` and `demo:quote-decision-client-receipts` before
  opening the real log. Extend `@claim:demo-sample-data` to add a demo quote,
  exit, re-enter, and assert only the two seeds remain while a pre-existing
  real quote is unchanged.

#### F-3-2 — “Capture scope, value, and expiry” is an unlisted product claim

- **Location and exact text:** landing page, How it works step 01: “Capture
  scope, value, and expiry.”
- **Verification:** `.factory/claims.json` has 17 entries, but none registers
  quote creation or asserts that all three fields are saved and restored. The
  general browser suite exercises quote creation, but there is no independently
  runnable `@claim:` entry for this visitor-facing promise. The README sentence
  “Every visitor-facing product claim is listed with its exact browser test in
  `.factory/claims.json`.” is therefore not currently true.
- **Why this misleads:** a visitor can rely on this as the first workflow step,
  yet the required claim registry does not provide the promised proof.
- **Concrete fix:** add a `quote-fields` claim and a tagged clean-demo test that
  creates a quote with scope, amount, and expiry, reloads it, and asserts those
  exact values. Alternatively, remove this sentence from the landing page.

### Medium

#### F-3-3 — The landing page omits the required privacy and non-goals section

- **Location:** live `/`, between “How it works” and the footer. No section is
  present. The only landing privacy copy is the first-screen fact “Stored in
  this browser” and a Privacy navigation link.
- **Why this matters:** the product carries a quote inside a shareable link and
  records click consent, but a first-time visitor is not told on the landing
  page that anyone with the link can read it or that this is not a regulated
  signature service. The standard site skeleton requires this explanation.
- **Concrete fix:** add a plainly named **Privacy and limits** section after
  How it works. Reuse the accurate README facts: quote records stay in this
  browser; anyone with a client link can read it; the tool is not a payment,
  document-editing, or regulated electronic-signature service.

#### F-3-4 — The landing page does not explain the paid tier completely

- **Location and exact text:** first-screen fact, “$19 one-time unlimited
  option.” No paid-tier section follows How it works.
- **Why this matters:** the sentence does not say that the free edition allows
  five quotes or explicitly say what becomes unlimited. A visitor must open
  Data & license or read the README to understand the limit. The standard site
  skeleton requires the exact price and what payment unlocks on the landing
  page.
- **Concrete fix:** add a **Price** section stating, “Use five quotes free. Pay
  $19 once to remove the quote limit.” Link its result-naming action to Quote
  Decision's Sociobot checkout endpoint.

### Minor

#### F-3-5 — One README storage sentence uses unexplained browser jargon

- **Location and exact text:** README, Develop: “Data is specific to the
  browser origin.”
- **Why this slows comprehension:** “browser origin” is a web-platform term,
  not plain language, and the sentence does not explain its practical effect.
- **Concrete fix:** replace it with “Each site address keeps its own browser
  data.” Keep the exact IndexedDB database names in the following technical
  sentences.

## Copy audit

Counts are whitespace-delimited. The tables include every sentence or
sentence-like fact on the landing page and in the README. Headings and action
labels are checked separately below.

### Landing page

| Words | Copy | Result |
| ---: | --- | --- |
| 6 | Review quotes before you send them. | Pass; `review-checkpoint` |
| 16 | For tiny agencies that need one checked quote and a clear client answer before work starts. | Pass |
| 8 | See two sample quotes; no data is saved. | F-3-1 for exit persistence |
| 4 | Stored in this browser | Pass; `local-device-privacy` |
| 6 | Works offline after the first visit | Pass; `offline-reload` |
| 4 | $19 one-time unlimited option | F-3-4 for incomplete tier explanation |
| 3 | Review before sending. | Pass; `review-checkpoint` |
| 6 | Review, send, then record the answer. | Pass; workflow claims are registered |
| 5 | Capture scope, value, and expiry. | F-3-2; unlisted claim |
| 7 | A named teammate checks the exact version. | Pass; `review-checkpoint` |
| 8 | Share a link that carries the reviewed quote. | Pass; `client-link` |
| 5 | Import the client’s consent receipt. | Pass; `receipt-import` |
| 8 | Quote review and client decisions for tiny agencies. | Pass |

No sentence exceeds 22 words and no banned marketing adjective appears.

### README

| Words | Copy | Result |
| ---: | --- | --- |
| 18 | Quote Decision helps tiny agencies review a quote before sending it and keep a clear client decision trail. | Pass |
| 15 | It keeps quote records in this browser and can work offline after the first visit. | Pass; local/offline claims |
| 7 | Try the shipped sample workspace at `<https://quote-decision-log.sociobot.in/demo>`. | Pass |
| 11 | It starts with two realistic quotes in a separate demo database. | Pass; `demo-sample-data` |
| 17 | Use Reset demo to restore them or Start for real to open your own empty quote log. | F-3-1 for retained demo edits |
| 10 | keeps quote data in this browser on this device; | Pass; `local-device-privacy` |
| 9 | shows a named review before a quote is send-ready; | Pass; `review-checkpoint` |
| 13 | puts the reviewed quote in a link you can send to the client; | Pass; `client-link` |
| 5 | exports portable JSON decision receipts; | Pass; `decision-receipt` |
| 11 | retains a client’s own receipt on that device for later download; | Pass; `client-decision-retention` |
| 11 | exports the whole log as JSON and a summary as CSV; | Pass; export claims |
| 9 | shows an unchangeable ID for each saved quote version; | Pass; `quote-fingerprint` |
| 6 | works offline after the first visit; | Pass; `offline-reload` |
| 11 | supports five free quotes and displays a $19 one-time unlimited option. | Pass; allowance/price claims |
| 14 | Quote Decision is not a payment tool, document editor, or regulated electronic signature service. | Pass; clear non-goal |
| 12 | A decision receipt records explicit click consent and a typed name only. | Pass; `decision-consent-record` |
| 13 | Every visitor-facing product claim is listed with its exact browser test in `.factory/claims.json`. | F-3-2; currently false |
| 7 | The sample sandbox is described in `.factory/demo.md`. | Pass |
| 5 | Requires Node.js 20 or later. | Pass |
| 7 | Data is specific to the browser origin. | F-3-5; jargon |
| 7 | The normal quote log uses `quote-decision-log` IndexedDB. | Pass; technical identifier |
| 13 | The demo uses `demo:quote-decision-log` and does not read or write the normal database. | Pass; isolation verified manually |
| 12 | Client receipts use the separate `quote-decision-client-receipts` database, with a separate demo namespace. | Pass; technical identifiers |
| 10 | `npm run build` creates `dist/` with `dist/index.html` at its root. | Pass |
| 10 | The browser suite checks desktop and 390 px mobile layouts. | Pass |
| 15 | It also checks keyboard use, privacy, demo, offline, updates, recovery, and the main quote flow. | Pass |
| 10 | Quotes and client receipts remain in separate browser IndexedDB databases. | Pass; technical privacy detail |
| 10 | License tokens and their cached daily verification result use localStorage. | Pass; technical privacy detail |
| 11 | There are no analytics, advertising trackers, remote fonts, or runtime CDNs. | Pass; request log and source check |
| 18 | Client links contain the quote in the URL fragment, so the app server does not receive the fragment. | Pass; `client-link` and request checks |
| 9 | Anyone who has the link can read its contents. | Pass; share warning |
| 16 | Use Data and license to export JSON or CSV, import a backup, or delete local quotes. | Pass; data-action claims |
| 12 | A client can download or delete the local receipt from its link. | Pass; receipt claims |
| 9 | Read the complete privacy policy and terms before purchase. | Pass |
| 6 | Publish `dist/` to the static host. | Pass |
| 8 | `public/staticwebapp.config.json` configures application routes and the 404 page. | Pass; technical identifier |
| 7 | It also sets security and cache headers. | Pass |
| 7 | The service worker requires HTTPS in production. | Pass; technical deployment note |
| 11 | The product-specific visual system and generated-art provenance are documented in `.factory/design.md`. | Pass |
| 11 | The social preview is derived from the same original dispatch-gate artwork. | Pass |
| 6 | Source art is retained in `assets/src/`. | Pass |
| 1 | MIT. | Pass |
| 2 | See LICENSE. | Pass |

No README sentence exceeds 22 words and no banned marketing adjective appears.
Necessary API and file names are confined to developer or implementation
sections. F-3-5 is the remaining unexplained term.

### Headings and actions

Landing headings are “Quote review and decision record” (5), “Review quotes
before you send them” (6), “How it works” (3), “Review, send, then record the
answer” (6), and the four stage labels Draft, Review, Send, and Record (1 each).
They name the product or workflow; none is a mood heading or slogan.

The landing action labels are “Try it with sample data” (5) and “Create a
quote” (3). Both are verbs that name their result. The header labels are route
names rather than action buttons. No unclear landing button was found.

## Demo and sandbox evidence

- The landing action opens `/demo` in one click.
- Its first 390 px screen shows the demo banner, a two-quote dashboard, one
  accepted quote, one quote before send, and the beginning of the realistic
  Product photography record. Desktop shows both full sample rows.
- The samples are Cedar & Kite's accepted $2,100 Product photography quote and
  Harrow & Vale's $4,800 send-ready Website launch quote.
- Adding a demo quote raised the list from two to three. **Reset demo** restored
  exactly two after its completion message.
- A normal quote created outside demo survived a later demo reset. IndexedDB
  exposed separate `demo:quote-decision-log` and `quote-decision-log`
  databases.
- All observed demo requests used
  `https://quote-decision-log.sociobot.in`; no page error occurred.
- F-3-1 records the separate failure when leaving without reset.

## Claim results

Fresh clone: `/tmp/quote-review-3-clean.LqzgMG/app` at
`382f44f33d5c775491ba6786dc9e190977cedfaa`. Each exact command from
`.factory/claims.json` was run separately.

| Claim ID | Result |
| --- | --- |
| `demo-sample-data` | Pass |
| `local-device-privacy` | Pass |
| `json-export` | Pass |
| `csv-export` | Pass |
| `quote-fingerprint` | Pass |
| `review-checkpoint` | Pass |
| `client-link` | Pass |
| `decision-receipt` | Pass |
| `decision-consent-record` | Pass |
| `receipt-import` | Pass |
| `client-decision-retention` | Pass |
| `backup-import` | Pass |
| `delete-local-quotes` | Pass |
| `delete-client-receipt` | Pass |
| `unlimited-price` | Pass |
| `free-five-quotes` | Pass |
| `offline-reload` | Pass |

F-3-2 is the remaining unlisted claim. F-3-1 also shows that the passing
`demo-sample-data` test does not cover discard-on-exit behavior.

## Earlier finding recheck

Every earlier review, polish record, and the prior handoff was read. Checks
below use the live site and current source, not the prior status labels.

| Earlier ID | Current verification |
| --- | --- |
| F-1-1 | Fixed: app, legal, and 404 headers expose the same four links; footers include Privacy and Terms. |
| F-1-2 | Fixed: `decision-consent-record` exists and passed. |
| F-1-3 | Fixed: `backup-import` exists and passed. |
| F-1-4 | Fixed: `delete-local-quotes` exists and passed. |
| F-1-5 | Fixed: `delete-client-receipt` exists and passed. |
| F-1-6 | Fixed: the price claim is narrowed to displayed copy and the product checkout target; its test passed without following billing. |
| F-1-7 | Fixed: Privacy, Terms, and 404 have complete route-specific social metadata. |
| F-1-8 | Fixed: the link is no longer called private; the access warning is present. |
| F-1-9 | Fixed: the README opening explains browser storage and offline use. |
| F-1-10 | Fixed: feature copy says “a link you can send to the client.” |
| F-1-11 | Fixed: feature copy says “unchangeable ID”; the fingerprint test passed. |
| F-1-12 | Fixed: the suite description is split into 10- and 15-word sentences. |
| F-1-13 | Fixed: deployment copy is split into short sentences. |
| F-2-1 | Fixed: `receipt-import` exists and passed its valid/invalid receipt checks. |
| F-2-2 | Fixed: the feature list now says “this browser on this device.” |
| QD-001 | Fixed: source targets Quote Decision's Sociobot checkout; the tagged target test passed without opening billing. |
| QD-002 | Fixed: receipt validation requires the exact consent text; tagged tests passed. |
| QD-003 | Fixed: backup validation occurs before replacement; recovery tests passed. |
| QD-004 | Fixed: a valid receipt immediately rerenders the named decision; `receipt-import` passed. |
| QD-005 | Fixed: required fields trim and reject whitespace-only input; full browser tests passed. |
| QD-006 | Fixed: live legal links meet the 44 px mobile target test. |
| QD-007 | Fixed: the live hashed JavaScript response uses one-year immutable caching. |
| QD-008 | Fixed: deployment tests and live responses confirm CSP, Permissions-Policy, no-referrer, and nosniff headers. |
| QD-009 | Fixed: input lengths and safe-money bounds are present; boundary tests passed. |
| QD-010 | Fixed: receipt validation ties consent to the matching version and fingerprint; tagged tests passed. |
| QD-011 | Fixed: Playwright has one retry and the full clean suite passed without a failed test. |
| QD-012 | Fixed: 17 registered claims have tagged sandbox tests; all passed separately. F-3-2 is a new unlisted landing claim. |
| QD-013 | Fixed for one-click entry, seed data, banner, reset, namespace, and docs. F-3-1 is a new exit-persistence finding. |
| QD-014 | Fixed: first Tab reaches the skip link and route changes focus the h1. |
| QD-015 | Fixed: mobile controls and legal links pass the 44 px checks. |
| QD-016 | Fixed: invalid verification rerenders the paid state; full browser test passed. |
| QD-017 | Fixed: real routes, shared navigation, metadata, and designed 404 all passed live. |
| QD-018 | Fixed: service-worker registration is guarded; resilience test passed. |
| QD-019 | Fixed: client receipt retention and deletion tests passed in separate contexts. |
| QD-020 | Fixed: share copy and anyone-with-link warning are accurate. |
| QD-021 | Fixed: the 390 px skip link passes its 44 px size check. |

No earlier finding regressed under its original condition.

## Structure, accessibility, and quality evidence

- Live same-origin links on `/`, `/demo`, `/new`, `/data`, `/demo/new`,
  `/demo/data`, `/privacy/`, `/terms/`, `/404.html`, and both seeded quote
  routes returned 200. An unknown route returned the designed page with HTTP
  404 and a link back. The two external destinations were identified but not
  opened because this work order forbids connecting to other products or
  shared services.
- Every sampled route has `lang=en`, one h1, one main landmark, a descriptive
  title, description, canonical, Open Graph/Twitter metadata, and favicons.
  Home is “Quote Decision — review quotes before sending”; demo is “Demo —
  Quote Decision.” `robots.txt` and `sitemap.xml` return 200.
- History navigation, back-button behavior, route focus, keyboard workflow,
  visible skip link, and mobile touch-target checks passed against production.
- Live axe scans found no serious or critical issue. The 390 px pages had no
  horizontal overflow. Reduced motion was used during the independent crawl.
- The worker URL verifier found no console error, missing image alt text, or
  unlabeled button.
- The art-deco dispatch rail, stepped controls, brass checkpoint, and original
  route illustration match `.factory/design.md` and are visibly distinct from
  a generic SaaS template.
- Clean-clone gates passed: 11 unit/contract tests, typecheck, lint, build, 42
  browser tests with 28 intended project skips, and the mobile performance
  test. `dist/` was produced; initial JavaScript is 16.70 kB gzip.

F-3-3 and F-3-4 are the remaining standard-skeleton failures.

## Missed leverage

The brief's expected adjacent capabilities are present: JSON/CSV export,
backup import, decision-receipt export/import, expiry, review, and client
accept/decline. Sync would conflict with the stated local-only model unless the
product added accounts and a clear privacy model. AI would not remove a step
from this narrow approval-and-record workflow and would weaken offline use.
No missing AI or sync feature is recorded.

## What would make this perfect

Discard demo changes on **Start for real** and prove that behavior in the
registered demo claim. Register the scope/value/expiry claim. Add the missing
Privacy and limits and Price landing sections, including the five-quote free
allowance. Replace “browser origin” with the proposed plain sentence. Then run
all 18 claim commands and the full clean/live suites again; only a zero-finding
repeat review can pass.
