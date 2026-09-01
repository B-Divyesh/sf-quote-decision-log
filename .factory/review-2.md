# Product QA review 2 — FAIL

Date: 2026-09-01 UTC  
Scope: live `https://quote-decision-log.sociobot.in` and clean checkout at
`9f71c7d82eab27b1317ce8d3a933611ae364b035`.

## Verdict

**FAIL.** Two findings remain: one blocking claim-registration gap and one
minor plain-language issue. A PASS requires zero findings.

## First screen and demo check

Fresh Chromium contexts (1440 × 900 and 390 × 844) opened the live home page
with service workers blocked. Before scrolling, the page answered all three
first-visit questions.

- **What it does:** “Review quotes before you send them.”
- **For whom:** “For tiny agencies that need one checked quote and a clear
  client answer before work starts.”
- **What to select first:** “Try it with sample data,” followed by “See two
  sample quotes; no data is saved.”

The 390 px view had a 390 px document width with no horizontal overflow. The
primary action was visible before scrolling and opened `/demo` in one click.
The first demo screen showed the Cedar & Kite `$2,100.00` accepted Product
photography quote and the Harrow & Vale `$4,800.00` send-ready Website launch
quote. Its banner read “Demo — sample data, nothing is saved.” and included
working **Reset demo** and **Start for real** controls. Reset restored exactly
two sample quotes.

I also opened `?demo=1` in a fresh context. It created only
`demo:quote-decision-log`; no normal quote database was opened. The demo flow
made same-origin requests only and produced no page or console errors. The
clean-checkout claim tests separately confirm that demo actions do not change
normal quote data.

## Findings

### Blocking

#### F-2-1 — The landing-page receipt-import promise has no registered claim test

- **Location and exact text:** landing “How it works,” step 4: “Import the
  client’s consent receipt.”
- **Check result:** the receipt-import path exists in the live UI and has a
  general browser test (`shows a valid imported receipt immediately...`), but
  `.factory/claims.json` has no receipt-import entry and no
  `@claim:receipt-import` test. The 16 registered claims cover receipt export,
  consent, retention, and deletion, but not importing a receipt into the quote
  log.
- **Why this matters:** a first-time visitor can rely on this as a workflow
  outcome. It is not covered by the required claim registry, so the displayed
  promise has no independently runnable proof command.
- **Concrete fix:** add a `receipt-import` claim to `.factory/claims.json` and
  one tagged clean-demo browser test. The test should import a valid client
  receipt, confirm that the matching quote immediately displays the recorded
  decision and client name, and confirm that an invalid receipt is rejected
  without changing the quote. Alternatively, remove the step from the landing
  page.

### Minor

#### F-2-2 — The README uses implementation jargon in its user-facing feature list

- **Location and exact text:** README, “What it does”: “keeps quote data in
  browser IndexedDB on the device;”
- **Check result:** “IndexedDB” names a browser implementation rather than a
  storage outcome a tiny-agency visitor needs to understand. The later
  development section can retain database identifiers for maintainers.
- **Why this matters:** the feature list is product copy, not a technical
  reference. The visitor needs to know where data stays, not the browser API
  name.
- **Concrete fix:** replace it with “keeps quote data in this browser on this
  device;”. Move the `IndexedDB` identifier to a clearly labelled technical
  storage note if it remains useful for development.

## Copy audit

The following is the complete sentence inventory for the current landing page
and README. Counts are whitespace-delimited. Headings, navigation labels,
button labels, commands, URLs, and database identifiers alone are not counted
as sentences. No listed sentence exceeds 22 words. The two flagged items map
to the findings above.

### Landing page

| Words | Sentence | Result |
| ---: | --- | --- |
| 6 | Review quotes before you send them. | Pass |
| 16 | For tiny agencies that need one checked quote and a clear client answer before work starts. | Pass |
| 8 | See two sample quotes; no data is saved. | Pass |
| 4 | Stored in this browser | Pass — local-storage claim |
| 6 | Works offline after the first visit | Pass — offline claim |
| 5 | $19 one-time unlimited option | Pass — price claim |
| 3 | Review before sending. | Pass |
| 6 | Review, send, then record the answer. | Pass — process heading |
| 5 | Capture scope, value, and expiry. | Pass |
| 8 | A named teammate checks the exact version. | Pass — review claim |
| 8 | Share a link that carries the reviewed quote. | Pass — client-link claim |
| 5 | Import the client’s consent receipt. | **F-2-1** — unlisted claim |
| 8 | Quote review and client decisions for tiny agencies. | Pass |

### README

| Words | Sentence | Result |
| ---: | --- | --- |
| 18 | Quote Decision helps tiny agencies review a quote before sending it and keep a clear client decision trail. | Pass |
| 15 | It keeps quote records in this browser and can work offline after the first visit. | Pass — registered local/offline claims |
| 7 | Try the shipped sample workspace at `<https://quote-decision-log.sociobot.in/demo>`. | Pass |
| 11 | It starts with two realistic quotes in a separate demo database. | Pass — demo claim |
| 17 | Use Reset demo to restore them or Start for real to open your own empty quote log. | Pass |
| 9 | keeps quote data in browser IndexedDB on the device; | **F-2-2** — implementation jargon |
| 9 | shows a named review before a quote is send-ready; | Pass — review claim |
| 13 | puts the reviewed quote in a link you can send to the client; | Pass — client-link claim |
| 5 | exports portable JSON decision receipts; | Pass — receipt-export claim |
| 11 | retains a client’s own receipt on that device for later download; | Pass — retention claim |
| 11 | exports the whole log as JSON and a summary as CSV; | Pass — export claims |
| 9 | shows an unchangeable ID for each saved quote version; | Pass — fingerprint claim |
| 6 | works offline after the first visit; | Pass — offline claim |
| 11 | supports five free quotes and displays a $19 one-time unlimited option. | Pass — price and allowance claims |
| 14 | Quote Decision is not a payment tool, document editor, or regulated electronic signature service. | Pass |
| 12 | A decision receipt records explicit click consent and a typed name only. | Pass — consent claim |
| 13 | Every visitor-facing product claim is listed with its exact browser test in `.factory/claims.json`. | Pass after F-2-1 is corrected |
| 7 | The sample sandbox is described in `.factory/demo.md`. | Pass |
| 5 | Requires Node.js 20 or later. | Pass |
| 7 | Data is specific to the browser origin. | Pass — technical setup note |
| 7 | The normal quote log uses `quote-decision-log` IndexedDB. | Pass — technical storage note |
| 13 | The demo uses `demo:quote-decision-log` and does not read or write the normal database. | Pass — demo claim |
| 12 | Client receipts use the separate `quote-decision-client-receipts` database, with a separate demo namespace. | Pass — technical storage note |
| 10 | `npm run build` creates `dist/` with `dist/index.html` at its root. | Pass |
| 10 | The browser suite checks desktop and 390 px mobile layouts. | Pass |
| 15 | It also checks keyboard use, privacy, demo, offline, updates, recovery, and the main quote flow. | Pass |
| 10 | Quotes and client receipts remain in separate browser IndexedDB databases. | Pass — technical storage note |
| 10 | License tokens and their cached daily verification result use localStorage. | Pass — technical storage note |
| 11 | There are no analytics, advertising trackers, remote fonts, or runtime CDNs. | Pass — request-log check |
| 18 | Client links contain the quote in the URL fragment, so the app server does not receive the fragment. | Pass — client-link/privacy checks |
| 9 | Anyone who has the link can read its contents. | Pass — useful access warning |
| 16 | Use Data and license to export JSON or CSV, import a backup, or delete local quotes. | Pass — data-action claims |
| 12 | A client can download or delete the local receipt from its link. | Pass — receipt claims |
| 9 | Read the complete privacy policy and terms before purchase. | Pass |
| 6 | Publish `dist/` to the static host. | Pass |
| 8 | `public/staticwebapp.config.json` configures application routes and the 404 page. | Pass |
| 7 | It also sets security and cache headers. | Pass |
| 7 | The service worker requires HTTPS in production. | Pass |
| 11 | The product-specific visual system and generated-art provenance are documented in `.factory/design.md`. | Pass |
| 11 | The social preview is derived from the same original dispatch-gate artwork. | Pass |
| 6 | Source art is retained in `assets/src/`. | Pass |
| 1 | MIT. | Pass |
| 2 | See LICENSE. | Pass |

The landing headings name the product job and process; they are not mood
headings. The visible action labels name their results. The art-deco dispatch
surface is specific to the quote-review checkpoint and does not present as a
generic product template.

## Claims and sandbox checks

I cloned the provided repository into a fresh temporary directory, ran
`npm ci`, and ran every exact command from `.factory/claims.json`
individually. All 16 completed successfully, each with one desktop pass and
the expected mobile-project skip:

`demo-sample-data`, `local-device-privacy`, `json-export`, `csv-export`,
`quote-fingerprint`, `review-checkpoint`, `client-link`, `decision-receipt`,
`decision-consent-record`, `client-decision-retention`, `backup-import`,
`delete-local-quotes`, `delete-client-receipt`, `unlimited-price`,
`free-five-quotes`, and `offline-reload`.

The current landing and README were then compared against that registry. F-2-1
is the remaining displayed capability without a registry entry. The privacy
claim test records the demo flow’s requests; my independent live request log
also contained only the product origin for home, demo, and a sample quote.

The clean checkout also passed `npm test` (11 tests), `npm run typecheck`,
`npm run lint`, `npm run build`, the complete browser suite, and
`npm run test:performance`. The production build emitted `dist/` and reported
16.70 KB gzip JavaScript and 6.03 KB gzip CSS.

## Earlier finding recheck

I read `review-1.md`, `polish-1.md`, and the current handoff, then confirmed
each earlier finding on the live site and in current source.

| Earlier ID | Current check |
| --- | --- |
| F-1-1 | Pass — app, Privacy, Terms, and 404 share the same Quote log, Data & license, Try demo, and Privacy header links; all have Privacy and Terms in the footer. |
| F-1-2 | Pass — `decision-consent-record` is registered and its clean-context claim command passed. |
| F-1-3 | Pass — `backup-import` is registered and its claim command passed. |
| F-1-4 | Pass — `delete-local-quotes` is registered and its claim command passed. |
| F-1-5 | Pass — `delete-client-receipt` is registered and its claim command passed. |
| F-1-6 | Pass — the copy is limited to the displayed $19 option and its claim command checks the product checkout target without following it. |
| F-1-7 | Pass — Privacy, Terms, and 404 each provide route-specific title, description, canonical URL, Open Graph, Twitter, favicon, and social image metadata. |
| F-1-8 | Pass — live share copy says a link carries the reviewed quote and warns that anyone with it can read it. |
| F-1-9 | Pass — the README opening explains local browser storage and offline use without “local-first PWA.” |
| F-1-10 | Pass — the README uses “a link you can send to the client,” not browser-fragment terminology. |
| F-1-11 | Pass — user-facing fingerprint wording is “unchangeable ID,” with the technical digest retained only in proof. |
| F-1-12 | Pass — the browser-suite description is split into 10- and 15-word sentences. |
| F-1-13 | Pass — the deployment description is split into short sentences. |

## Structure, routing, accessibility, and product-scope checks

- Check that `/`, `/demo`, `/data`, `/demo/data`, `/demo/new`, both seeded
  demo quote routes, `/new`, `/privacy/`, and `/terms/` return 200: confirmed.
- Check that an unknown route returns the designed 404 with a route back to
  the quote log: confirmed with HTTP 404.
- Check that each sampled route has `lang=en`, one h1, one main landmark, a
  route title, description, canonical URL, Open Graph/Twitter metadata, and
  favicon: confirmed. Home title is “Quote Decision — review quotes before
  sending”; the legal and demo titles use their route names plus product name.
- Check that history navigation restores route focus: confirmed. Navigating
  from `/demo` to `/demo/new` and back focused the current h1 each time. A
  fresh first Tab selected the 202.6 × 44 px Skip to main content link.
- Check same-origin links found on these routes: all returned their expected
  status. Two external Sociobot links were identified in legal pages but were
  not opened because they are outside this product’s allowed resource scope.
- Check accessibility: axe scans of home, demo, Privacy, Terms, and the 404
  reported no serious or critical findings. The live 390 px view had no
  horizontal overflow.
- Check privacy and offline behavior: the first-visit demo request log was
  same-origin only; the registered `offline-reload` sandbox command passed.
- Check visual identity: the live design matches the recorded dark
  art-deco-dispatch system, including product-specific rail geometry, stepped
  controls, brass route marks, original checkpoint art, and reduced-motion
  policy. It is distinct from a generic SaaS layout.
- Check missed leverage against the brief: review checkpoint, expiry,
  client accept/decline, receipt export/import, backup export/import, and
  deletion are present. An AI-assisted action is not an expected part of this
  focused local quote-decision workflow, so no AI feature is required.

## What would make this perfect

Register and independently test the receipt-import result, then replace the
user-facing `IndexedDB` wording. After those two changes, rerun every claim
command from a clean checkout and repeat the cold 390 px demo check. A further
review can pass only when those checks produce zero findings.
