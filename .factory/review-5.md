# Adversarial first-read review 5 — FAIL

Reviewed 2026-09-02 UTC against
<https://quote-decision-log.sociobot.in> and a clean clone of
`a638e750b63a65c1e54fc0ed67bee3acac3f8e60`. This was a read-only product
review. Product code, deployment resources, billing, DNS, and other services
were not changed or opened.

## Verdict

**FAIL.** One minor finding remains. There are no blocking findings and no
untested product claims, but PASS requires zero findings.

## Cold first screen

Fresh Chromium contexts opened the live home page at 390 × 844 and 1440 × 900
with service workers blocked. Before scrolling, I could answer all three
first-visit questions:

- **What it does:** reviews a quote before it is sent and records the client's
  answer.
- **For whom:** tiny agencies that need a checked quote before work starts.
- **What to select first:** **Try it with sample data**.

The exact headline is “Review quotes before you send them.” The supporting
sentence is “For tiny agencies that need one checked quote and a clear client
answer before work starts.” The primary action is followed by “See two sample
quotes; no data is saved.” These elements are visible before scrolling at both
sizes. The mobile document width is exactly 390 px. No first-read blocking
finding applies.

## Findings

### Minor

#### F-5-1 — The three first-screen facts are below or clipped by the desktop viewport

- **Location and exact text:** live `/`, `.plain-facts`: “Stored in this
  browser”, “Works offline after the first visit”, and “Five quotes free · $19
  once for unlimited”.
- **Verification:** at 1440 × 900, each fact has `top = 856 px` and `bottom =
  904 px`, so all three are clipped by the bottom edge. At desktop heights of
  768 px and 844 px, all three begin at 856 px and are completely below the
  fold. At 390 × 844 they are visible.
- **Why this matters:** the required first-screen structure puts the three
  privacy, offline, and price facts before scrolling. Desktop visitors instead
  see a five-line headline and must scroll to read any of the three facts.
- **Concrete fix:** reduce the desktop hero's vertical demand or move the fact
  row above the actions so all three facts fit within a 1440 × 768 viewport.
  Add a Playwright assertion that every `.plain-facts li` has a bottom edge at
  or above `window.innerHeight` at the desktop review size.

## Copy audit

Counts are whitespace-delimited. The inventory includes every visible
sentence or sentence-like fact on the landing page and in the README.
Headings and actions are checked separately. No sentence exceeds 22 words,
uses a banned marketing adjective, changes a core product term, or relies on a
metaphor. F-5-1 concerns placement, not wording.

### Landing page

| Words | Sentence or fact | Result |
| ---: | --- | --- |
| 1 | Online | Pass |
| 4 | Stored on this device | Pass |
| 6 | Review quotes before you send them. | Pass |
| 16 | For tiny agencies that need one checked quote and a clear client answer before work starts. | Pass |
| 8 | See two sample quotes; no data is saved. | Pass |
| 4 | Stored in this browser | F-5-1 placement |
| 6 | Works offline after the first visit | F-5-1 placement |
| 8 | Five quotes free · $19 once for unlimited | F-5-1 placement |
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
| 6 | Built by Param Factory · v1.0.7 | Pass |

Headings and labels are “Quote review and decision record”, “How it works”,
“Review, send, then record the answer”, “Draft”, “Review”, “Send”, “Record”,
“Privacy and limits”, and “Price”. Each names the product, section, or workflow
stage. “Local control” and “One-time license” describe the sections they label.

Landing actions are **Try it with sample data**, **Create a quote**, **Read
Privacy**, **Read Terms**, and **Open $19 checkout**. Each uses a verb and names
the result. The navigation label **Try demo** is also clear.

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

README headings—“What it does”, “Develop”, “Verify”, “Privacy and data”,
“Deploy”, and “Design and license”—make sense without surrounding text.
Implementation terms appear only in maintainer or technical storage sections.

## Demo and sandbox checks

- The landing action opened `/demo` in one click. The first mobile demo screen
  immediately showed Cedar & Kite's accepted `$2,100.00` Product photography
  quote and Harrow & Vale's `$4,800.00` send-ready Website launch quote.
- The persistent banner says “Demo — sample data, nothing is saved.” It has
  working **Reset demo** and **Start for real** controls. The live
  `demo-sample-data` test confirmed that reset restores the two seeds and that
  leaving clears demo changes without changing a pre-existing real quote.
- Fresh direct `/demo` and `/?demo=1` contexts created only
  `demo:quote-decision-log`. They created no normal database or localStorage
  entry. Their requests were same-origin GETs only.
- The live offline claim passed in its own fresh browser context. The exercised
  cold, demo, export, review, client, and receipt flows had no third-party
  runtime requests. No page or application-console error appeared.

No demo, storage-isolation, offline, or privacy finding remains.

## Claims

Every exact command in `.factory/claims.json` was run separately from clean
clone `/tmp/quote-decision-review5.Pwt6EV/app`.

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

The current landing page and README were compared sentence by sentence with
the registry and tagged tests. No unlisted claim or untested listed claim was
found.

## Earlier finding recheck

Every earlier review, polish record, and the prior handoff was read. Current
live behavior was checked against the deployed page, and the relevant storage,
validation, routing, and deployment code was inspected. The deployed HTML,
hashed JavaScript, hashed CSS, service worker, sitemap, legal pages, 404, and
offline fallback match the clean build byte-for-byte.

| Earlier ID | Current verification |
| --- | --- |
| QD-001 | Fixed: the buy action targets Quote Decision's Sociobot checkout; no payment provider is embedded. |
| QD-002 | Fixed: imported receipts require the exact consent text. |
| QD-003 | Fixed: malformed backups are validated before storage replacement. |
| QD-004 | Fixed: valid receipt import immediately shows the client decision. |
| QD-005 | Fixed: required quote fields trim and reject whitespace-only input. |
| QD-006 | Fixed: legal links pass the 44 px mobile target check. |
| QD-007 | Fixed: hashed live assets use immutable caching. |
| QD-008 | Fixed: live CSP, permissions, referrer, HSTS, and nosniff headers are present. |
| QD-009 | Fixed: source and tests enforce text and safe-money bounds. |
| QD-010 | Fixed: imported consent is bound to the matching version and fingerprint. |
| QD-011 | Fixed: the browser runner retains one retry; the uncontested full suite passed. |
| QD-012 | Fixed: all 19 claim entries map to one tagged test and passed separately. |
| QD-013 | Fixed: both demo entry points retain seeds, banner, reset, namespaces, and destructive exit. |
| QD-014 | Fixed: the skip link is first and route changes focus the h1. |
| QD-015 | Fixed: mobile controls and legal links retain 44 px targets. |
| QD-016 | Fixed: invalid license verification rerenders the free state. |
| QD-017 | Fixed: routes, unique titles, shared navigation, metadata, and designed 404 remain intact. |
| QD-018 | Fixed: blocked service-worker registration fails without an application error. |
| QD-019 | Fixed: client receipt retention and deletion remain isolated and persistent. |
| QD-020 | Fixed: link copy warns that anyone with the client link can read the quote. |
| QD-021 | Fixed: the focused 390 px skip link is 44 px high. |
| F-1-1 | Fixed: app, legal, offline, and 404 pages share the same primary header and legal footer links. |
| F-1-2 | Fixed: exact consent and typed client name are registered and tested. |
| F-1-3 | Fixed: valid JSON backup import is registered and tested. |
| F-1-4 | Fixed: normal quote deletion remains isolated from demo data. |
| F-1-5 | Fixed: a client can delete its saved local receipt. |
| F-1-6 | Fixed: price copy is limited to the displayed $19 option and product checkout handoff. |
| F-1-7 | Fixed: Privacy, Terms, and 404 retain complete route-specific social metadata. |
| F-1-8 | Fixed: no bearer link is called private; the access warning is visible. |
| F-1-9 | Fixed: the README explains browser storage and offline use without PWA jargon. |
| F-1-10 | Fixed: the README calls this a link a client can receive, not a fragment. |
| F-1-11 | Fixed: user copy says “unchangeable ID”; SHA-256 remains in technical proof. |
| F-1-12 | Fixed: the browser-suite description remains split into short sentences. |
| F-1-13 | Fixed: the deployment description remains split into short sentences. |
| F-2-1 | Fixed: receipt import has a valid/invalid tagged sandbox claim test. |
| F-2-2 | Fixed: the user feature list says “this browser on this device.” |
| F-3-1 | Fixed: **Start for real** clears both demo stores before leaving. |
| F-3-2 | Fixed: scope, value, and expiry have a registered persistence claim. |
| F-3-3 | Fixed: the landing page retains its “Privacy and limits” section. |
| F-3-4 | Fixed: the landing page states five free quotes and $19 once for unlimited. |
| F-3-5 | Fixed: the README says each site address keeps its own browser data. |
| F-4-1 | Fixed: the sitemap lists `/new`, `/data`, `/demo/new`, and `/demo/data`; the deployment contract checks the full inventory. |

No earlier finding regressed. F-5-1 is a new desktop first-screen layout
finding.

## Structure, accessibility, and visual identity

- `/`, `/demo`, `/new`, `/data`, `/demo/new`, `/demo/data`, `/privacy/`,
  `/terms/`, `/offline.html`, and `/404.html` returned 200. An unknown URL
  returned the designed page with HTTP 404. The seeded quote and edit deep
  links also returned 200 with their correct state and titles.
- Each checked route has one h1, one main landmark, a route-specific title and
  description, canonical URL, Open Graph/Twitter metadata, favicon, shared
  header, and Privacy/Terms footer. The sitemap lists every stable public
  route. Same-origin links are live; the external checkout and `sociobot.in`
  legal link were not followed because this review's resource scope excludes
  other services.
- First Tab focuses the 44 px skip link. Forward and back navigation restore
  the route and focus its h1. Live axe scans found no serious or critical issue
  on home, demo, Privacy, Terms, or 404.
- The app has visible focus states, reduced-motion rules, labelled controls,
  image alternatives, no horizontal overflow at 390 px, and no load-time
  application console errors. The 404 document itself produces the expected
  browser resource error for its HTTP 404 status.
- The brass checkpoint illustration, transit rails, clipped corners, stamped
  states, condensed display type, dark painted-paper palette, and restrained
  motion match `.factory/design.md`. The result is product-specific rather
  than a generic SaaS template.

F-5-1 is the only structure issue.

## Quality gates

- `npm test`: 12 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/`.
- `npm run test:e2e`: 48 passed, 30 expected project skips.
- `npm run test:performance`: 1 passed when run alone.
- Production JavaScript is 17.04 kB gzip and CSS is 6.29 kB gzip.
- `/opt/fleet/lib/verify-url.sh` reported HTTPS 200, one h1, `lang="en"`, a
  main landmark, complete image alternatives, labelled buttons, and no console
  errors.
- A production-safe live subset covering demo reset/isolation, offline reload,
  routing metadata, history focus, and axe checks passed 7 tests with 5
  intended project skips.

## Missed leverage

No missing high-value feature was found. The brief calls for a local review
checkpoint and a portable client decision trail; both are complete. JSON/CSV
export, backup import, receipt import, and local deletion cover the obvious
portability needs. Hosted sync would weaken the local-storage promise, and an
AI step would add cost and uncertainty to a deterministic approval record.

## What would make this perfect

Resolve F-5-1 and add its desktop fold-position regression test. With the
three fact lines fully visible before scrolling at the desktop review size,
this review has no remaining product, copy, demo, claim, route, accessibility,
privacy, or scope issue.
