# Independent product verification 5 — PASS

Verified 2026-09-01 UTC for work order `quote-decision-log-verify-5`.

- Candidate: `511beddd3cc2855a997729b35373fd906eb80e7e`
- Branch: `main`; `origin/main` matched the candidate before verification
- Production: <https://quote-decision-log.sociobot.in>
- Contract: researched brief, original builder work order, `AGENTS.md`, and
  the supplied claims, demo, plain-words, accessibility, PWA, privacy,
  performance, paid-unlock, design, and site-structure requirements
- Result: **PASS**

The deployment is byte-for-byte the candidate and the smallest useful quote
workflow works end to end. The mandatory claims and first-read gates pass. A
fresh agency can create and review an exact quote version, give a client a
self-contained decision link, receive an explicit-consent receipt, import the
decision, preserve earlier decisions after an edit, export or delete its data,
and reload the seeded demo offline. No release-blocking defect was reproduced.

## Mandatory first checks

### Claims gate — PASS

`.factory/claims.json` exists with 12 unique IDs. Each ID has exactly one
matching `@claim:<id>` test tag. After the locked install, every listed command
was invoked independently from the clean candidate before broader product
inspection.

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-sample-data` | `npm run test:e2e -- --grep @claim:demo-sample-data` | PASS — 1 passed, 1 expected project skip |
| `local-device-privacy` | `npm run test:e2e -- --grep @claim:local-device-privacy` | PASS — 1 passed, 1 expected project skip |
| `json-export` | `npm run test:e2e -- --grep @claim:json-export` | PASS — 1 passed, 1 expected project skip |
| `csv-export` | `npm run test:e2e -- --grep @claim:csv-export` | PASS — 1 passed, 1 expected project skip |
| `quote-fingerprint` | `npm run test:e2e -- --grep @claim:quote-fingerprint` | PASS — 1 passed, 1 expected project skip |
| `review-checkpoint` | `npm run test:e2e -- --grep @claim:review-checkpoint` | PASS — 1 passed, 1 expected project skip |
| `client-link` | `npm run test:e2e -- --grep @claim:client-link` | PASS — 1 passed, 1 expected project skip |
| `decision-receipt` | `npm run test:e2e -- --grep @claim:decision-receipt` | PASS — 1 passed, 1 expected project skip |
| `client-decision-retention` | `npm run test:e2e -- --grep @claim:client-decision-retention` | PASS — 1 passed, 1 expected project skip |
| `unlimited-price` | `npm run test:e2e -- --grep @claim:unlimited-price` | PASS — 1 passed, 1 expected project skip |
| `free-five-quotes` | `npm run test:e2e -- --grep @claim:free-five-quotes` | PASS — 1 passed, 1 expected project skip |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS — 1 passed, 1 expected project skip |

The live run also exercised every claim test successfully. README and landing
claims map to the manifest: isolated samples, local storage/privacy, JSON and
CSV export, fingerprints, named review, fragment link, decision receipt and
retention, five-quote free limit, $19 one-time unlimited option, and offline
reload.

### Cold first-read and one-click demo — PASS

A new 1440×900 browser profile opened production with no stored state. Its
first screen said:

- what: **Review quotes before tiny agencies send.**
- for whom/change: tiny agencies get one checked quote and a clear client
  answer before work starts;
- first action: **Try it with sample data**, followed by “See two sample
  quotes; no data is saved.”

The action was visible without scrolling on desktop and 390×844 mobile. One
click opened `/demo`, displayed the persistent demo banner plus Reset demo and
Start for real, and showed the Cedar & Kite and Harrow & Vale samples.

A fresh namespace check created one real sentinel, then entered the demo. The
normal `quote-decision-log` database contained 1 record while
`demo:quote-decision-log` contained 2. The sentinel was absent in demo mode;
Start for real returned to `/`, restored the sentinel, and showed no demo
client.

## Clean-checkout gates

The workspace began clean at the full candidate hash. Node was 22.23.2 and npm
was 10.9.8.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 61 packages installed; 0 vulnerabilities |
| `npm test` | PASS | Vitest: 2 files, 10/10 tests |
| `npm run typecheck` | PASS | `tsc -b`, no diagnostics |
| `npm run lint` | PASS | repository lint alias `tsc -b`, no diagnostics |
| `npm run build` | PASS | exact `tsc -b && vite build`; `dist/` emitted |
| `npm run test:e2e` | PASS | Playwright: 35 passed, 21 expected project skips |

This is a static browser PWA, not a library, CLI, backend, or sign-in product.
Consumer installation, server concurrency/SQLite/health identity, and Entra
tenant checks do not apply.

## Deployment identity, routes, and response policy

All 20 public files in the fresh `dist/` were downloaded at their production
paths and SHA-256 compared: **20 matched, 0 mismatches**.
`staticwebapp.config.json` is host configuration and was not treated as a
public file. Candidate and production identifiers include:

```text
index.html                     446b62cff388da5284836ad699d1118d08bd905b6d57233f2f8a0b3d274dcd18
assets/index-BA7MubIr.js       df7c42fbbb2c68435b3c32650899cb3e39ef0547391ac863ab9bbfe447c75138
assets/index-C8pQbRlJ.css      f7698643cbb7e45645fbaa220f57189c2eca70413c844082201131ea4d5b8258
sw.js                          4fc222d631642f72a780b7a76aa1e62a22eedd64d37b36a80446155e86e95070
```

The factory URL check returned HTTP 200 in 1,416 ms, with no console/page
errors, a useful title, `lang=en`, one `h1`, one `main`, complete image alt
text, and no unnamed buttons. `/demo`, `/new`, `/data`, `/privacy/`, and
`/terms/` returned 200. An unknown path returned the designed page with HTTP
404.

Playwright response logs and direct header checks confirmed:

- root and `/index.html`: `Cache-Control: no-cache`;
- hashed JavaScript, CSS, and hero art: one-year immutable caching;
- `/sw.js`: `Cache-Control: no-cache`;
- manifest: `application/manifest+json`;
- HSTS, restrictive CSP, Permissions-Policy, `Referrer-Policy: no-referrer`,
  and `X-Content-Type-Options: nosniff` are live.

## Independent end-to-end product exercise

Fresh production profiles covered representative, boundary, invalid, and
recovery behavior in addition to the repository suite.

- Invalid email and negative amount remained on `/new` with native invalid
  states. Correcting them recovered without losing the other form data.
- A zero-value quote saved as `$0.00` with a full 64-character SHA-256
  fingerprint.
- An incomplete checklist and one-character reviewer could not mark the quote
  send-ready. Completing all three checks with a named reviewer succeeded.
- The reviewed quote was carried after `#client/`; Playwright observed only
  same-origin GETs with no body, fragment, or client-name leakage.
- A genuinely separate 390×844 client profile rejected an incomplete form,
  recorded a decline with a typed name and explicit consent, and downloaded a
  schema-2 receipt with a 64-character receipt digest.
- The client completion state and repeat-download control survived reload.
  Importing the receipt in the agency profile immediately showed the decline.
- Editing an accepted demo quote created version 2, returned it to Needs
  review, and retained version 1 under Earlier receipts.
- A past-expiry link showed the expiry notice and no decision form. A malformed
  fragment showed a clear request-for-a-fresh-link recovery state.
- The 390 px client view had `clientWidth=390` and `scrollWidth=390`, with no
  page errors.

The full suites additionally cover Unicode payloads, unsafe cent values,
501-character reviewer/client names, altered and missing-consent receipts,
conflicting decisions, invalid backups, damaged-storage recovery, JSON/CSV
exports, delete confirmation, and the five-quote limit.

## Privacy, billing, and request allowance

Cold home, demo, and client activity loaded same-origin files only. No app
cookies, analytics, advertising trackers, remote fonts, or runtime CDNs were
observed. Quote content stayed in IndexedDB or the URL fragment. The browser
sent no fragment or decision data in requests. Billing traffic occurred only
during explicit license checks.

The live checkout endpoint returned HTTP 303 to the hosted Dodo checkout. No
purchase was attempted. A production-host return URL was independently checked
with the release API response controlled in Playwright: the token was stored
under `sb_license:quote-decision-log`, removed from the address bar, verified
with a bodyless GET to the documented product endpoint, and immediately showed
Unlimited is active. An actual invalid token returned 200 with
`{valid:false, reason:"invalid"}`, CORS for the product origin, and
`Cache-Control: no-store`.

A fresh sequential check against only this product's verification endpoint
returned 200 for requests 1–30. Request **31** returned HTTP 429 with
`Retry-After: 4`, `X-RateLimit-After: 4`, and `Too Many Requests! Wait for 4s`.
The observed allowance is 30 requests per burst before request 31 is limited.

## Accessibility, PWA, responsive behavior, and performance

Playwright Axe reported zero serious/critical findings on home, demo, create,
data/license, privacy, terms, quote lifecycle, and the separate 390 px client
state. Keyboard-only creation and review passed. Natural first Tab focused the
44 px-high skip link with a 3 px brass outline and 3 px offset; Enter moved
focus to main. Form errors are linked or announced, and mobile task targets met
the 44 px checks. The single dark treatment and art-deco dispatch identity
match `.factory/design.md`.

Reduced-motion emulation matched the media query and reduced active animation
durations to 0.01 ms. At 200% text, the primary demo and create actions
remained rendered and usable. Desktop, 390 px landing, and 390 px retained
client-decision screenshots were visually inspected without clipped task
controls.

Chromium returned no installability errors and found the expected manifest.
The production page was controlled by `qd-shell-v4`. After entering the seeded
demo, an offline navigation reloaded both samples and showed the offline
banner. The local service-worker replacement test showed the update notice,
activated `skipWaiting`, removed the old cache, and retained the app.

Production build sizes:

| Asset | Raw | Gzip / budget |
| --- | ---: | ---: |
| Initial JavaScript | 53.57 kB | 16.55 kB / 200 kB |
| CSS | 23.10 kB | 6.00 kB / 50 kB |
| Mobile hero | 25.96 kB | 25.96 kB / 300 kB |
| Fonts | 0 B | 0 B / 120 kB |

Fresh Lighthouse 12.8.2 mobile-style production retry completed without a
runtime error:

| Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT | Transfer |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 98 | 100 | 100 | 100 | 1.5 s | 1.8 s | 0 | 130 ms | 78 KiB |

INP had no field/sample interaction measurement in the Lighthouse run; the
130 ms TBT is below the 200 ms interaction proxy budget. The first Lighthouse
attempt produced a report but ended with a Chromium tab crash; the clean retry
above is the classified result.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none affecting the acceptance contract.

One QA portability note is not a product defect: when the local browser suite
was pointed wholesale at production, 33 tests passed, 20 were expected skips,
and the returned-license test missed its stub because it intercepts the local
`pilot-api` host while production correctly uses `api.sociobot.in`. The same
candidate test passes in the required local suite. The release-host behavior
was then checked independently against the release endpoint as described
above.

## Acceptance decision

**PASS.** Candidate `511beddd3cc2855a997729b35373fd906eb80e7e` at
<https://quote-decision-log.sociobot.in> meets the researched smallest useful
product and the supplied release gates. No product code or deployment resource
was changed during verification.
