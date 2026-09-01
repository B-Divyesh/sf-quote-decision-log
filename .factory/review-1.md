# Adversarial first-read review 1 — FAIL

Reviewed 2026-09-01 UTC against <https://quote-decision-log.sociobot.in>. This was a read-only review; product code and deployment resources were not changed.

## Verdict

**FAIL.** PASS requires zero findings. Thirteen findings remain: five blocking, three medium, and five minor.

## Cold first screen

Separate fresh Chromium contexts at 390 × 844 and 1440 × 900 show the same answer before scrolling: this is for tiny agencies to review a quote before sending it, then record the client's answer. The first action is clearly “Try it with sample data”, with adjacent copy that two sample quotes open and no data is saved. The action is visible and usable at 390 px. No first-screen blocking finding applies.

The art-deco dispatch rail, brass checkpoint, stepped panels, and original dispatch illustration match `.factory/design.md` and are distinct from a generic SaaS template.

## Findings

### Blocking

#### F-1-1 — QD-017 remains partially fixed: the header is not consistent on every route

**Location:** live `/`, `/privacy/`, `/terms/`, and an unknown URL.

The app header has “Quote log”, “New quote”, “Data & license”, and “Try demo”. Privacy has only “Quote log”, “Try demo”, and “Terms”; Terms substitutes “Privacy”; the designed 404 omits both Data & license and Terms. This reopens the header-consistency portion of earlier QD-017. A visitor can leave the app for legal information and lose the primary route to data/export/license controls.

**Concrete fix:** use one shared header on app, legal, and 404 routes with the wordmark, Quote log, Data & license, Try demo, and Privacy; keep Terms in the shared footer.

#### F-1-2 — Explicit-consent receipt claim has no claims.json entry or tagged test

**Location:** README: “A decision receipt records explicit click consent and a typed name only.”

This decision-audit promise has no matching claim. `@claim:decision-receipt` checks only schema, product, and decision. The full suite exercises consent, but the mandatory claims manifest does not identify it.

**Concrete fix:** add `decision-consent-record` with a clean tagged browser test that records a decision and asserts exact consent text and the typed name. Or remove the sentence.

#### F-1-3 — Backup import is an unlisted README claim

**Location:** README: “Use **Data and license** to export JSON or CSV, import a backup, or delete local quotes.”

The JSON/CSV portions have registered tests. “Import a backup” has neither a claim entry nor a tagged sandbox assertion.

**Concrete fix:** add `backup-import` with a test that imports a valid clean demo export, reloads, and asserts the expected quote count and contents.

#### F-1-4 — Local quote deletion is an unlisted README claim

**Location:** the same README sentence: “...delete local quotes.”

Deletion is a separate user-reliant outcome and has no claim entry.

**Concrete fix:** add `delete-local-quotes` with a test that confirms deletion, reloads, and asserts normal IndexedDB is empty while demo storage is unchanged.

#### F-1-5 — Client-receipt deletion is an unlisted README claim

**Location:** README: “A client can download or delete the local receipt from its link.”

`client-decision-retention` proves download and retention; it does not prove the stated delete action.

**Concrete fix:** add `delete-client-receipt` with a separate clean client context that records a decision, deletes the receipt, reloads, and confirms the receipt state no longer remains. Or remove “or delete”.

### Medium

#### F-1-6 — The unlimited-price test only checks copy, not the promised result

**Location:** `.factory/claims.json` `unlimited-price`; `tests/claims.spec.ts`.

The claim says “Unlimited quotes cost $19 as a one-time purchase.” Its tagged test only asserts that “Buy unlimited — $19” and one-time-purchase text are visible. That is a button-presence check, not an observable checkout result.

**Concrete fix:** narrow the claim to “The app displays a $19 one-time unlimited option,” or add a no-charge fixture/integration test that verifies the hosted checkout handoff is for this product and price. Do not embed payment keys.

#### F-1-7 — Social metadata is incomplete on legal and 404 routes

**Location:** live `/privacy/`, `/terms/`, and a live 404.

Privacy and Terms expose `twitter:card` only; they omit `twitter:title`, `twitter:description`, and `twitter:image`. The 404 exposes no Open Graph or Twitter metadata. Root, demo, new, and data include all of these tags.

**Concrete fix:** add route-appropriate Open Graph title, description, and image plus complete Twitter card title, description, and image tags to both legal documents and `public/404.html`.

#### F-1-8 — “Private” overstates client-link protection

**Location:** landing How it works step 03: “Share a private, portable decision link.”

The README correctly says anyone with the link can read it. A URL fragment avoids server transmission, but it is not access-controlled. “Private” can mislead a visitor sharing commercially sensitive content.

**Concrete fix:** replace it with “Share a link that carries the reviewed quote.” Add “Anyone with the link can read it” beside the share action.

### Minor

#### F-1-9 — The README opening uses unexplained jargon

**Location:** README: “It is a local-first PWA.”

“Local-first PWA” does not tell a non-technical agency owner what changes for them.

**Concrete fix:** “It keeps quote records in this browser and can work offline after the first visit.”

#### F-1-10 — Client-link-fragment wording uses jargon

**Location:** README What it does: “puts the reviewed quote in a private client-link fragment”.

“Client-link fragment” is browser terminology and repeats F-1-8’s misleading wording.

**Concrete fix:** “puts the reviewed quote in a link you can send to the client.”

#### F-1-11 — SHA-256 is unexplained technical language in a user feature list

**Location:** README What it does: “shows each saved version’s SHA-256 fingerprint”.

**Concrete fix:** “shows an unchangeable ID for each saved quote version.” Put the SHA-256 detail in a later technical section if needed.

#### F-1-12 — The README test-suite sentence exceeds 22 words

**Location:** README Verify, 26 words: “The pinned Playwright suite covers desktop, 390 px mobile, keyboard flow, accessibility, privacy requests, sample-demo claims, offline reload, service-worker update, data recovery, and the quote-to-decision workflow.”

**Concrete fix:** “The browser suite checks desktop and 390 px mobile layouts. It also checks keyboard use, privacy, demo, offline, updates, recovery, and the main quote flow.”

#### F-1-13 — The README deployment sentence exceeds the cap and is technical

**Location:** README Deploy, 23 words: “`public/staticwebapp.config.json` rewrites the product’s real application URLs, serves the designed 404 page for unknown paths, sets security headers, and keeps hashed assets immutable.”

**Concrete fix:** “`public/staticwebapp.config.json` configures application routes and the 404 page. It also sets security and cache headers.”

## Copy audit

Counts use whitespace-delimited words. Headings, nav labels, buttons, code commands, and link URLs are not sentences.

### Landing page

| Words | Copy | Result |
| ---: | --- | --- |
| 6 | Review quotes before tiny agencies send. | Pass |
| 16 | For tiny agencies that need one checked quote and a clear client answer before work starts. | Pass |
| 8 | See two sample quotes; no data is saved. | Pass |
| 4 | Stored in this browser | Pass |
| 6 | Works offline after the first visit | Pass |
| 4 | $19 one-time unlimited license | Pass |
| 3 | Review before sending. | Pass |
| 5 | Capture scope, value, and expiry. | Pass |
| 7 | A named teammate checks the exact version. | Pass |
| 6 | Share a private, portable decision link. | F-1-8 |
| 5 | Import the client’s consent receipt. | Pass; README import claim is F-1-3 |
| 8 | Quote review and client decisions for tiny agencies. | Pass |

Heading check: “Quote review and decision record”, “How it works”, and “Review, send, then record the answer” name the product and process; no mood/metaphor heading was found. The visible action labels name outcomes: “Try it with sample data”, “Create a quote”, “Reset demo”, and “Start for real”.

### README

| Words | Copy | Result |
| ---: | --- | --- |
| 18 | Quote Decision helps tiny agencies review a quote before sending it and keep a clear client decision trail. | Pass |
| 5 | It is a local-first PWA. | F-1-9 |
| 7 | Try the shipped sample workspace at <https://quote-decision-log.sociobot.in/demo>. | Pass |
| 11 | It starts with two realistic quotes in a separate demo database. | Pass |
| 17 | Use Reset demo to restore them or Start for real to open your own empty quote log. | Pass |
| 9 | keeps quote data in browser IndexedDB on the device; | Pass |
| 9 | shows a named review before a quote is send-ready; | Pass |
| 9 | puts the reviewed quote in a private client-link fragment; | F-1-10 |
| 5 | exports portable JSON decision receipts; | Pass |
| 11 | retains a client’s own receipt on that device for later download; | Pass |
| 11 | exports the whole log as JSON and a summary as CSV; | Pass |
| 6 | shows each saved version’s SHA-256 fingerprint; | F-1-11 |
| 6 | works offline after the first visit; | Pass |
| 11 | supports five free quotes; a $19 one-time purchase unlocks unlimited quotes. | F-1-6 coverage |
| 14 | Quote Decision is not a payment tool, document editor, or regulated electronic signature service. | Pass |
| 12 | A decision receipt records explicit click consent and a typed name only. | F-1-2 |
| 13 | Every visitor-facing product claim is listed with its exact browser test in `.factory/claims.json`. | Pass |
| 7 | The sample sandbox is described in `.factory/demo.md`. | Pass |
| 5 | Requires Node.js 20 or later. | Pass |
| 7 | Data is specific to the browser origin. | Pass |
| 7 | The normal quote log uses `quote-decision-log` IndexedDB. | Pass |
| 13 | The demo uses `demo:quote-decision-log` and does not read or write the normal database. | Pass |
| 12 | Client receipts use the separate `quote-decision-client-receipts` database, with a separate demo namespace. | Pass |
| 10 | `npm run build` creates `dist/` with `dist/index.html` at its root. | Pass |
| 26 | The pinned Playwright suite covers desktop, 390 px mobile, keyboard flow, accessibility, privacy requests, sample-demo claims, offline reload, service-worker update, data recovery, and the quote-to-decision workflow. | F-1-12 |
| 10 | Quotes and client receipts remain in separate browser IndexedDB databases. | Pass |
| 10 | License tokens and their cached daily verification result use localStorage. | Pass |
| 11 | There are no analytics, advertising trackers, remote fonts, or runtime CDNs. | Pass; request logging supports no external resource load |
| 18 | Client links contain the quote in the URL fragment, so the app server does not receive the fragment. | Pass |
| 9 | Anyone who has the link can read its contents. | Pass; add the landing warning in F-1-8 |
| 16 | Use Data and license to export JSON or CSV, import a backup, or delete local quotes. | F-1-3, F-1-4 |
| 12 | A client can download or delete the local receipt from its link. | F-1-5 |
| 9 | Read the complete privacy policy and terms before purchase. | Pass |
| 6 | Publish `dist/` to the static host. | Pass |
| 23 | `public/staticwebapp.config.json` rewrites the product’s real application URLs, serves the designed 404 page for unknown paths, sets security headers, and keeps hashed assets immutable. | F-1-13 |
| 7 | The service worker requires HTTPS in production. | Pass |
| 11 | The product-specific visual system and generated-art provenance are documented in `.factory/design.md`. | Pass |
| 11 | The social preview is derived from the same original dispatch-gate artwork. | Pass |
| 1 | MIT. | Pass |
| 2 | See LICENSE. | Pass |

## Demo, privacy, and claims checks

- Clicking “Try it with sample data” opens `/demo` in one click. The first view shows Cedar & Kite’s accepted $2,100 Product photography quote and Harrow & Vale’s $4,800 send-ready Website launch quote.
- The persistent banner is exactly “Demo — sample data, nothing is saved”, with Reset demo and Start for real.
- Reset demo restored two samples. In a separate test context, a normal quote was created first; entering/resetting demo then returning to normal retained that normal quote. Separate normal and `demo:` IndexedDB namespaces appeared.
- Cold home, demo, and the exercised client flow made same-origin product requests only. No console/page error was observed.
- All 12 commands in `.factory/claims.json` were run separately from clean clone `/tmp/quote-decision-log-review-1.oSJbGt`; each passed with one desktop pass and one expected mobile-project skip. The complete clean browser suite then reported `status: passed` (35 passed, 21 expected skips).
- `npm test` passed 10 tests; typecheck, lint, and build passed. Build emitted `dist/`; initial JavaScript is 16.63 kB gzip.

The hosted billing URL was not followed because the work order prohibits connecting to resources outside `sf-quote-decision-log`. F-1-6 records the claims-test coverage issue without accessing the billing service.

## Structure and routing checks

- Same-origin app links returned 200 for `/`, `/demo`, `/new`, `/data`, `/privacy/`, `/terms/`, `/demo/new`, `/demo/data`, both seeded demo quote routes, and both seeded edit routes. An unknown route returned the designed 404 with HTTP 404 and a way back.
- Direct routes update title, canonical URL, Open Graph title/description, and focus. The back-button check returned from `/new` to `/` and moved focus to the home h1. A cold first Tab focused the 44 px-high skip link.
- Root, demo, new, and data have one h1, description, canonical, favicon, and complete Open Graph/Twitter metadata. `robots.txt` and `sitemap.xml` return 200. F-1-1 and F-1-7 remain for legal/404 routes.

## Earlier history recheck

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. The prior handoff and the additional `verification-*.md` records were read.

| Earlier ID | Current check |
| --- | --- |
| QD-001 | Source points to the documented hosted checkout URL. It was not followed because it is outside the permitted resource scope. |
| QD-002–QD-003 | Clean full browser suite passes receipt and corrupt-backup paths; current source validates before storage. |
| QD-004–QD-006 | Full suite passes current client-retention, trimmed-field, and mobile-target checks. |
| QD-007–QD-008 | Live app responses expose immutable assets, manifest MIME, CSP, Permissions-Policy, no-referrer, and nosniff. |
| QD-009–QD-011 | Clean full browser suite passes stored-record boundary and complete keyboard cases. |
| QD-012–QD-013 | Claims manifest, tagged tests, demo, samples, banner, reset, namespace, and demo documentation are present. |
| QD-014–QD-015 | Initial focus stays on body; first Tab reaches the 202.6 × 44 px skip link. |
| QD-016 | `checkLicense` rerenders the data screen before showing invalid-license copy. |
| QD-017 | Reopened as F-1-1: legal/404 headers still do not match the primary header. |
| QD-018 | Service-worker registration is guarded with `try/catch`. |
| QD-019 | `@claim:client-decision-retention` passes in a separate 390 px context after reload. |
| QD-020 | The inaccurate no-network statement is absent; current share wording directs email/message sharing. |
| QD-021 | The focused skip link is now 44 px high at 390 px. |

## What would make this perfect

Register and test every stated data/receipt action, make the checkout claim test prove a result or narrow its wording, use one route shell, complete social metadata, and apply the listed plain-language rewrites. A repeat review can PASS only when all thirteen findings are absent.
