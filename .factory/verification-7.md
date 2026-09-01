# Independent product verification 7 — PASS

## Scope and verdict

**PASS.** Candidate `a9dacbaee33a47ec48d25ef0885fb0b0ad670037`
meets the researched brief and release contract at
<https://quote-decision-log.sociobot.in>.

- Work order: `quote-decision-log-verify-7`
- Verification date: 2026-09-01 UTC
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2, Chromium
- Product class: static local-first PWA
- Critical findings: none
- High findings: none
- Medium findings: none
- Low findings affecting acceptance: none

No product code was changed. This report, the handoff update, and verification
artifacts are the only candidate-tree changes.

## Mandatory first checks

### Claims gate — PASS

`.factory/claims.json` exists and contains 16 claims. The first invocation in
the untouched clone could not load `@playwright/test` because `node_modules`
was absent. This was a setup precondition rather than a claim assertion. After
the documented `npm ci` lockfile install, every exact command in the file was
run independently through the demo entry point and passed:

| Claim | Result |
| --- | --- |
| `demo-sample-data` | PASS |
| `local-device-privacy` | PASS |
| `json-export` | PASS |
| `csv-export` | PASS |
| `quote-fingerprint` | PASS |
| `review-checkpoint` | PASS |
| `client-link` | PASS |
| `decision-receipt` | PASS |
| `decision-consent-record` | PASS |
| `client-decision-retention` | PASS |
| `backup-import` | PASS |
| `delete-local-quotes` | PASS |
| `delete-client-receipt` | PASS |
| `unlimited-price` | PASS |
| `free-five-quotes` | PASS |
| `offline-reload` | PASS |

Each command produced one Chromium pass and one intentional mobile-project skip
where the claim is designed to run once in its own browser context. Summary:
16 passed, 0 failed.

The landing page and README were cross-checked against the claim registry. No
unlisted visitor-facing product promise was found.

### Cold first-read and one-click demo — PASS

A fresh browser with service workers blocked opened the live home page. Before
scrolling, desktop and exact 390×844 views answered all three questions:

- What it does: “Review quotes before you send them.”
- Who it serves: “For tiny agencies that need one checked quote and a clear
  client answer before work starts.”
- What to do first: “Try it with sample data,” followed by “See two sample
  quotes; no data is saved.”

The action was visible at 390 px (`y=411`, height `46 px`), opened `/demo` in
one click, and immediately showed two realistic quotes plus the persistent
demo banner, Reset demo, and Start for real controls.

Evidence:

- [`live-first-read-desktop.png`](evidence/verification-7/live-first-read-desktop.png)
- [`live-first-read-mobile-390-exact.png`](evidence/verification-7/live-first-read-mobile-390-exact.png)
- [`live-demo-mobile-390.png`](evidence/verification-7/live-demo-mobile-390.png)

## Clean-checkout quality gates

All available repository gates passed:

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 61 packages installed, 0 vulnerabilities |
| `npm test` | PASS — 11/11 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/` created |
| `npm run test:e2e` | PASS — 41 passed, 27 intentional project skips |
| `npm run test:performance` | PASS — 1/1 |

The same complete browser suite and performance command were then run against
the production URL. Production also reported 41 passed, 27 intentional skips,
and 1/1 performance check passed.

## Candidate and deployment identity

- Local HEAD before documentation was exactly
  `a9dacbaee33a47ec48d25ef0885fb0b0ad670037` on `main`.
- All 19 files that are public after the production build matched live files
  byte-for-byte by SHA-256, including HTML, JS, CSS, source map, PWA files,
  legal pages, icons, and images.
- `staticwebapp.config.json` returns 404 because Azure consumes it as deployment
  configuration. Its routing, MIME, cache, and response-policy effects are
  present live.
- `/`, `/demo`, `/data`, `/demo/data`, sample quote URLs, `/privacy/`,
  `/terms/`, manifest, service worker, assets, images, robots, and sitemap all
  returned their expected successful responses.
- An unknown route returned the designed page with HTTP 404 and a route back to
  the quote log.
- Every same-origin link found across home, demo, data, legal, and 404 screens
  was checked. Product routes returned 200; the deliberate unknown route
  remained 404.

The live root response used `Cache-Control: no-cache`. Hashed JS and CSS used
`public, max-age=31536000, immutable`; the service worker used `no-cache`; the
manifest used `application/manifest+json`. Live responses included CSP,
Permissions-Policy, `Referrer-Policy: no-referrer`, HSTS, and `nosniff`.

The factory URL smoke script passed `/demo` in 572 ms with no console or page
errors. It found `lang=en`, one `h1`, one main landmark, no missing image text
alternatives, and no unnamed buttons. Evidence is in
[`verify-url/`](evidence/verification-7/verify-url/).

## Product workflow and recovery checks

The smallest useful product works end to end:

- created a quote with client, project, amount, scope, terms, and expiry;
- required all three review checks and a named reviewer;
- marked only the reviewed version send-ready;
- created a client URL carrying the quote in its fragment and marked it sent;
- opened the link in a separate clean 390 px client profile;
- recorded both accept and decline paths with explicit consent and typed name;
- downloaded a schema-2 receipt with a 64-character receipt digest;
- retained and re-downloaded the client receipt after reload;
- imported the receipt into the agency log and updated the decision immediately;
- edited an accepted quote into version 2, cleared its current approval, and
  preserved the version 1 receipt under Earlier receipts;
- exported JSON and CSV, restored a valid backup, deleted real quote data, and
  deleted a client receipt without changing demo data;
- enforced the five-quote free allowance while preserving access, export, and
  delete controls for existing quotes.

Boundary and recovery coverage passed for whitespace-only required values,
zero and unsafe monetary values, 501-character reviewer/client names, Unicode,
invalid backup structure, damaged local storage, altered receipts, missing
consent, conflicting decisions, a past-expiry link, and a malformed client
link. Invalid data was not persisted. Errors identified what happened and the
next action. The expired link removed the decision form and requested an
updated quote; the malformed link requested a fresh link.

## Privacy, checkout, and request allowance

- A cold home/demo/sample-detail flow made same-origin GET requests only.
- No cookies, analytics, advertising trackers, remote fonts, runtime CDNs,
  request bodies, client names, or URL fragments were observed in the product
  request log.
- Real and demo quotes used separate IndexedDB names. Client receipts used a
  second database, also separated by demo mode.
- Privacy and terms accurately describe quote storage, URL fragments, receipt
  movement, license verification, export/delete controls, and the absence of a
  regulated-signature claim.
- The explicit checkout link targets only this product's Sociobot endpoint.
  It returned 303 to hosted Dodo checkout. The checkout loaded with “Quote
  Decision Unlimited,” `$19.00`, and “One-time unlimited quote log unlock with
  future v1 updates.” No payment was submitted.
- An invalid license check returned 200 with `{valid:false, reason:"invalid"}`,
  `Access-Control-Allow-Origin: https://quote-decision-log.sociobot.in`, and
  `Cache-Control: no-store`.
- A fresh sequential check accepted requests 1–30. Request 31 returned 429.
  Raw follow-up responses included `Retry-After: 1` and
  `X-RateLimit-After: 1`. The observed allowance is 30 requests per burst.

There is no sign-in, so the Entra authority check does not apply. The product
has no product-owned backend, server data store, health route, or server
concurrency boundary; those checks do not apply to this static PWA.

## Accessibility and responsive behavior

- Independent axe scans found zero serious or critical findings on home, demo,
  privacy, terms, and the designed 404. The repository suite additionally
  covers create, data/license, quote, client, and expired-client states.
- Every tested route had `lang`, a distinct title, one `h1`, a main landmark,
  correct image alternatives, labeled controls, and an ordered heading
  structure.
- The natural first Tab focused Skip to main content. Its focus treatment was
  a 3 px brass outline with a 3 px offset. Keyboard navigation reached and
  opened the demo; the complete create/review checkpoint passed with
  Tab/Enter/Space and focus moved to route headings.
- At exactly 390×844, `clientWidth` and `scrollWidth` were both 390 and no
  visible interactive target was below 44×44 px.
- At 200% text on a 1280 px viewport, all 14 controls remained rendered and
  the document remained 1280 px wide. A more constrained 390 px stress view
  retained all controls and content with horizontal panning; no content was
  removed.
- Reduced-motion emulation matched the media query. Maximum animation and
  transition durations were 0.01 ms, with no continuing motion.
- Measured contrast ratios were 8.05:1 for the focus ring, 14.65:1 for main
  text, 9.60:1 for muted text, and 7.92:1 for primary-button text.
- Home, demo, privacy, and terms produced no console or page errors. The
  deliberate 404 navigation produced only the browser's expected 404 resource
  message.

## PWA and offline behavior

- The manifest has name, short name, description, versioned start URL,
  standalone display, theme/background colors, 192/512 icons, and a 512
  maskable icon.
- A fresh live context became controlled by `qd-shell-v6`. The shell cache
  contained home, demo, offline fallback, manifest, icons, index, and the
  hashed JS/CSS assets.
- After network access was disabled, `/demo` reloaded with the offline banner,
  both sample quotes, and no page errors.
- The local production-build update regression created a waiting worker,
  displayed “A fresh version is ready,” activated Update now, and removed the
  previous cache.

## Performance and bundle budgets

| Asset | Raw | Gzip / budget |
| --- | ---: | ---: |
| Initial JavaScript | 53,817 B | 16.70 KB / 200 KB |
| CSS | 23,368 B | 6.03 KB / 50 KB |
| Mobile hero WebP | 25,958 B | 25.96 KB / 300 KB |
| Desktop hero WebP | 47,998 B | 48.00 KB |
| Fonts | 0 B | 0 / 120 KB |

Fresh Lighthouse 12.8.2 mobile audits of live `/demo`:

| Run | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 1.065 s | 0 | 106 ms |
| 2 | 97 | 100 | 100 | 100 | 1.062 s | 0 | 192 ms |
| 3 | 100 | 100 | 100 | 100 | 0.984 s | 0 | 53 ms |

A separate live 390×844 interaction measurement under 4× CPU slowdown recorded
a 112 ms maximum interaction duration. The repository's fresh-load regression
also passed its CLS `<0.05` and blocking-time `≤200 ms` assertions.

Reports:

- [`Lighthouse run 1`](evidence/verification-7/lighthouse-mobile-1.report.html)
- [`Lighthouse run 2`](evidence/verification-7/lighthouse-mobile-2.report.html)
- [`Lighthouse run 3`](evidence/verification-7/lighthouse-mobile-3.report.html)

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none affecting the acceptance contract.

## Final decision

**PASS.** The live deployment matches candidate
`a9dacbaee33a47ec48d25ef0885fb0b0ad670037`, the 16-claim gate is fully green,
the product completes the brief's real quote-decision job, and the prior mobile
performance finding is resolved.
