# Adversarial first-read review 4 — FAIL

Reviewed 2026-09-02 UTC against
<https://quote-decision-log.sociobot.in> and a clean checkout of
`ce4230d5e005eb3e315a807cdae5bc019c5847d5`. This was a read-only product
review. Product code and deployment resources were not changed.

## Verdict

**FAIL.** One minor finding remains. There are no blocking findings and no
untested product claims, but PASS requires zero findings.

## Cold first screen

Fresh Chromium contexts opened the live home page at 390 × 844 and 1440 ×
900 with service workers blocked. Before scrolling, the screen answers the
three first-visit questions:

- **What it does:** review a quote before it is sent and keep the client's
  answer.
- **For whom:** tiny agencies that need a checked quote before work starts.
- **What to select first:** **Try it with sample data**.

The exact supporting copy is “For tiny agencies that need one checked quote
and a clear client answer before work starts.” The action is followed by “See
two sample quotes; no data is saved.” Both the action and explanation are above
the fold at 390 px and desktop. The 390 px document had no horizontal overflow
(`scrollWidth = clientWidth = 390`). No first-screen blocking finding applies.

## Findings

### Minor

#### F-4-1 — The sitemap omits stable application routes

- **Location and exact contents:** live and source `public/sitemap.xml` list
  only `/`, `/demo`, `/privacy/`, and `/terms/`.
- **Verification:** `/new`, `/data`, `/demo/new`, and `/demo/data` are stable,
  user-facing routes. Each returned 200, exposed its own canonical URL, and
  rendered a complete page, but none appears in the sitemap. The deployment
  contract test checks rewrite rules but does not check sitemap completeness.
- **Why this matters:** the required site structure says the sitemap lists
  every route. The current file gives crawlers an incomplete inventory of the
  product's stable pages.
- **Concrete fix:** add the four stable routes above to `sitemap.xml`. Keep
  private data-bearing quote/edit/client URLs, the offline fallback, and 404
  out of the index. Add a deployment test that compares the stable public-route
  list with sitemap locations.

## Copy audit

Counts are whitespace-delimited. The inventory includes visible sentences and
short facts; headings and controls are checked separately. No item exceeds 22
words. No banned marketing adjective, inconsistent product term, unexplained
user-facing jargon, metaphor heading, or empty slogan was found.

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
| 6 | Built by Param Factory · v1.0.6 | Pass |

Headings are “Quote review and decision record,” “How it works,” “Review,
send, then record the answer,” “Draft,” “Review,” “Send,” “Record,” “Privacy
and limits,” and “Price.” Each names its section or workflow stage. The small
labels “Local control” and “One-time license” also describe their sections.

Actions are **Try it with sample data**, **Create a quote**, **Read Privacy**,
**Read Terms**, and **Open $19 checkout**. Each is a result-naming verb. Header
items are route names, not ambiguous action buttons.

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
| 7 | The normal quote log uses `quote-decision-log` IndexedDB. | Pass; developer context |
| 13 | The demo uses `demo:quote-decision-log` and does not read or write the normal database. | Pass |
| 12 | Client receipts use the separate `quote-decision-client-receipts` database, with a separate demo namespace. | Pass; developer context |
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
| 8 | `public/staticwebapp.config.json` configures application routes and the 404 page. | Pass; developer context |
| 7 | It also sets security and cache headers. | Pass |
| 7 | The service worker requires HTTPS in production. | Pass; developer context |
| 11 | The product-specific visual system and generated-art provenance are documented in `.factory/design.md`. | Pass |
| 11 | The social preview is derived from the same original dispatch-gate artwork. | Pass |
| 6 | Source art is retained in `assets/src/`. | Pass |
| 1 | MIT. | Pass |
| 2 | See LICENSE. | Pass |

README headings—“What it does,” “Develop,” “Verify,” “Privacy and data,”
“Deploy,” and “Design and license”—make sense out of context. Technical terms
are confined to developer, verification, deployment, or storage details.

## Demo and sandbox checks

- The first-screen action opens `/demo` in one click. The first mobile demo
  screen already shows a quote dashboard with one accepted and one send-ready
  quote. The records are Cedar & Kite's $2,100 Product photography quote and
  Harrow & Vale's $4,800 Website launch quote.
- The persistent banner reads “Demo — sample data, nothing is saved.” It has
  **Reset demo** and **Start for real** controls. Reset restored exactly the two
  seeds.
- A fresh direct `/demo` context opened only
  `demo:quote-decision-log`. The clean `demo-sample-data` claim test created a
  real quote plus demo changes and a demo receipt, then confirmed **Start for
  real** cleared both demo stores without changing the real quote. Re-entry
  restored only the two seeds.
- The independent cold/demo request logs used only
  `https://quote-decision-log.sociobot.in`, made no non-GET requests, and
  recorded no page or console errors. The stronger registered request-log
  claim also passed through review, client decision, receipt, and export flows.

No demo or sandbox finding remains.

## Claims

The repository was cloned to
`/tmp/quote-decision-review4-clean.GjSIkW/app` at the supplied commit. After
`npm ci`, every exact command in `.factory/claims.json` was run separately.

| Claim ID | Result |
| --- | --- |
| `demo-sample-data` | Pass |
| `quote-fields` | Pass |
| `local-device-privacy` | Pass |
| `no-tracking-remote-resources` | Pass |
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

The landing page and README were compared sentence by sentence with the claim
registry and tagged tests. No unlisted product claim or untested listed claim
was found.

## Earlier finding recheck

Every earlier `.factory/review-*.md`, `.factory/polish-*.md`, and the prior
handoff was read. Each prior finding was checked against the live site and
current source or its clean tagged regression, not its earlier closure label.

| Earlier ID | Current verification |
| --- | --- |
| QD-001 | Fixed: source and `unlimited-price` target Quote Decision's Sociobot checkout; no provider is embedded. |
| QD-002 | Fixed: receipt validation requires the exact consent text; consent/import claims pass. |
| QD-003 | Fixed: malformed backup validation occurs before replacement; recovery suite passes. |
| QD-004 | Fixed: valid receipt import immediately rerenders the named decision. |
| QD-005 | Fixed: required fields trim and reject whitespace-only values with field guidance. |
| QD-006 | Fixed: legal links meet the 44 px mobile target check. |
| QD-007 | Fixed: live hashed assets use immutable caching; deployment contract passes. |
| QD-008 | Fixed: live/static config supplies CSP, permissions, referrer, MIME, and nosniff policy. |
| QD-009 | Fixed: input length and safe-money bounds are enforced by schema tests. |
| QD-010 | Fixed: imported consent is tied to the matching version and fingerprint. |
| QD-011 | Fixed: the configured single browser retry remains present; the full suite passes. |
| QD-012 | Fixed: 19 unique registry entries map to exactly one matching test tag and all pass. |
| QD-013 | Fixed: `/demo` and `?demo=1` retain seeds, banner, reset, isolated storage, and destructive exit. |
| QD-014 | Fixed: the skip link is first and route changes focus the new h1. |
| QD-015 | Fixed: mobile controls and legal links pass the 44 px checks. |
| QD-016 | Fixed: invalid license verification rerenders the free state. |
| QD-017 | Fixed under its original scope: real routes, route titles, shared navigation, metadata, and designed 404 pass. F-4-1 is a new sitemap finding. |
| QD-018 | Fixed: blocked service-worker registration fails softly; resilience test passes. |
| QD-019 | Fixed: client receipt retention and deletion pass in separate contexts. |
| QD-020 | Fixed: the client-link warning accurately states bearer-link access. |
| QD-021 | Fixed: the focused mobile skip link remains at least 44 px high. |
| F-1-1 | Fixed: app, legal, offline, and 404 pages share the same four header links and legal footer links. |
| F-1-2 | Fixed: exact consent and typed client name are registered and tested. |
| F-1-3 | Fixed: valid JSON backup import is registered and tested. |
| F-1-4 | Fixed: normal quote deletion is registered and remains isolated from demo data. |
| F-1-5 | Fixed: local client-receipt deletion is registered and tested. |
| F-1-6 | Fixed: the claim is limited to the displayed $19 option and product-specific handoff. |
| F-1-7 | Fixed: legal and 404 pages expose complete route-specific social metadata. |
| F-1-8 | Fixed: no bearer link is called private; the access warning remains visible. |
| F-1-9 | Fixed: the README opening explains browser storage and offline use plainly. |
| F-1-10 | Fixed: feature copy says “a link you can send to the client.” |
| F-1-11 | Fixed: user feature copy says “unchangeable ID”; SHA-256 remains in technical proof. |
| F-1-12 | Fixed: the browser-suite description remains split into short sentences. |
| F-1-13 | Fixed: deployment copy remains split into short sentences. |
| F-2-1 | Fixed: receipt import has a registered valid/invalid clean-demo claim test. |
| F-2-2 | Fixed: the feature list says “this browser on this device.” |
| F-3-1 | Fixed: **Start for real** clears both demo stores before leaving; the expanded claim passes. |
| F-3-2 | Fixed: scope, value, and expiry have a registered reload-and-storage claim. |
| F-3-3 | Fixed: the live landing page has a plainly named Privacy and limits section. |
| F-3-4 | Fixed: the live Price section states five free quotes and $19 once to remove the limit. |
| F-3-5 | Fixed: the README says each site address keeps its own browser data. |

No earlier finding is unfixed, half-fixed, or regressed under its original
condition.

## Structure, accessibility, and visual identity

- Home, demo, data, new, demo data/new, Privacy, Terms, offline fallback, 404,
  and both seeded quote URLs returned their expected status. An unknown route
  returned the designed page with HTTP 404 and a route back. All same-origin
  links discovered in the crawl returned 200. The product checkout and
  Sociobot home links were identified but not requested because the work order
  forbids connecting outside this product's resource scope; the checkout href
  is covered without navigation by `unlimited-price`.
- Sampled routes have `lang=en`, exactly one h1, one main landmark, route
  titles, descriptions, self-canonical URLs, complete Open Graph/Twitter
  metadata, and favicons. History back/forward updates the URL and focuses the
  page h1. Header/footer navigation is consistent. F-4-1 records the sitemap
  exception.
- The worker URL verifier reported zero console/page errors, one h1, a main
  landmark, complete image alternatives, and labelled buttons. Live Playwright
  axe checks found no serious or critical issues. Mobile target, keyboard,
  focus, reduced-motion, and overflow regressions pass.
- The dark art-deco dispatch rail, brass checkpoint, stepped controls,
  route-line workflow, and original illustration match `.factory/design.md`.
  This is product-specific and not a generic SaaS template.

## Quality gates

- `npm test`: 11 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/`; initial JavaScript is 17.04 kB
  gzip.
- `npm run test:e2e`: 48 passed, 30 intentional project skips.
- `npm run test:performance`: 1 passed at the mobile project.
- Live structure/accessibility subset: 11 passed, 5 intentional project
  skips.

## Missed leverage

The brief-implied adjacent work is present: JSON and CSV export, backup import,
decision-receipt export/import, expiry, named review, and client
accept/decline. Sync would conflict with the stated local-device model unless
accounts and a new privacy model were added. An AI step would not remove an
obvious task from this approval-and-record workflow. No missed-leverage or
decorative-AI finding applies.

## What would make this perfect

Add the four omitted stable app routes to the sitemap and protect the route
inventory with a deployment test. Then rerun the static contract and live
sitemap check. That is the only remaining change needed for a zero-finding
review.
