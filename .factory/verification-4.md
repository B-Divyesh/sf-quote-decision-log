# Independent product verification 4 — FAIL

Verified 2026-08-30 UTC for work order `quote-decision-log-verify-4`.

- Candidate: `9496007210c09e549418bac3fae4b970e81b7a7f`
- Branch: `main`; `origin/main` matched before verification
- Production: <https://quote-decision-log.sociobot.in>
- Contract: researched brief, original builder work order, `AGENTS.md`, and the
  supplied claims, demo, plain-words, accessibility, PWA, privacy,
  performance, paid-unlock, design, and site-structure requirements
- Result: **FAIL**

Production is byte-for-byte the candidate. The mandatory claims, first-read,
demo, clean-build, billing, rate-limit, offline, accessibility, and performance
gates pass. The candidate still fails the real client job: on a separate client
browser, recording a decision downloads a valid receipt but does not retain or
show the recorded decision. The blank decision form returns immediately and
after reload, contradicting the visible claim that the entry stays on that
device. There is also an unlisted and inaccurate cold-link network claim.

## Mandatory first checks

### Claims gate — PASS after the required install

`.factory/claims.json` exists and lists 11 claims. Before inspecting product
behavior, every listed command was invoked from the clean clone. The raw clone
had no `node_modules`, so those first invocations stopped in dependency
resolution with `ERR_MODULE_NOT_FOUND: @playwright/test`; no test was
discovered. `npm ci` then installed the lockfile exactly (61 packages, zero
vulnerabilities), and every command was rerun independently in the valid clean
checkout environment.

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
| `unlimited-price` | `npm run test:e2e -- --grep @claim:unlimited-price` | PASS — 1 passed, 1 expected project skip |
| `free-five-quotes` | `npm run test:e2e -- --grep @claim:free-five-quotes` | PASS — 1 passed, 1 expected project skip |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS — 1 passed, 1 expected project skip |

Passing claim runs do not emit Playwright traces. Their evidence is the command
stdout above and the observable assertions in `tests/claims.spec.ts`. A second
production run of the demo, privacy, and offline claims also passed 3/3 with
`PLAYWRIGHT_BASE_URL=https://quote-decision-log.sociobot.in`.

### Cold first-read and one-click demo — PASS

A fresh desktop context at 1440×900 and a fresh mobile context at 390×844
opened production with no prior storage. The first screen plainly communicates:

- what: review a quote before it is sent and retain the client answer;
- for whom: tiny agencies;
- first action: **Try it with sample data**.

The action is visible in both first viewports. One click opens `/demo`, shows
the persistent “Demo — sample data, nothing is saved” banner, Reset demo and
Start for real controls, and two realistic Cedar & Kite / Harrow & Vale quotes.
The cold loads produced no console or page errors. Screenshots were visually
reviewed at `/tmp/qdl-first-desktop.png` and `/tmp/qdl-first-mobile.png`.

An independent namespace test waited for each UI completion state before
reading storage: the normal `quote-decision-log` database retained one sentinel
quote while `demo:quote-decision-log` contained exactly two samples. Start for
real returned to `/`, showed the real sentinel, and showed no demo client.

## Clean-checkout gates

The supplied workspace was clean and exactly at the candidate before testing.
Node was 22.23.2 and npm was 10.9.8.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 61 packages installed; zero vulnerabilities |
| `npm test` | PASS | Vitest: 2 files, 10/10 tests |
| `npm run typecheck` | PASS | `tsc -b`, no diagnostics |
| `npm run lint` | PASS | repository lint alias `tsc -b`, no diagnostics |
| `npm run build` | PASS | exact `tsc -b && vite build`; `dist/` emitted |
| `npm run test:e2e` | PASS on clean rerun | 34 passed, 20 expected project skips in 1.6 minutes |

The first full E2E attempt ended 32 passed / 20 skipped / 2 failed because the
pinned Chromium process itself segfaulted while creating mobile contexts. Both
affected cases passed independently, and the exact full command then passed.
The failures had no application assertion and are retained here as tooling
evidence, not classified as a product defect. The service-worker update case
was rerun alone and passed.

## Deployment identity, routes, and headers

All 20 publicly deployable build files were downloaded at their production
paths and SHA-256 compared with the fresh `dist/`: **20 compared, zero
mismatches**. This includes HTML, hashed JS/CSS, source map, images, icons,
manifest, service worker, offline fallback, legal pages, sitemap, robots,
social preview, and 404 page. `staticwebapp.config.json` is host configuration
and is not a public file.

Representative exact matches:

- `index.html`: `ebadeb4a1a50f32c70d276e573bca5601506b0b08d80fd025ba4f7fd6643eeaf`
- `assets/index-DS3vrSB8.js`: `067f5b969824dc40d698b84f2ad9c9eadedc2f323c8bb791a3cfacb242019ca0`
- `assets/index-B3T8PmND.css`: `764e425dc3f8bbb96253c3a711a576cd960f8cd523acf578d42e64cfd8a69b37`
- `sw.js`: `9d4055523d0534c7bf7a29da51863c82d49b3de134e029d01d5fea87104e63d8`

The factory `verify-url.sh` check passed: HTTPS 200, 812 ms network-idle load,
title, `lang=en`, one `h1`, `main`, no missing alt text, no unnamed buttons,
and no console/page errors. `/demo`, `/new`, `/data`, `/privacy/`, and `/terms/`
return 200; an unknown route returns the designed page with HTTP 404. Crawled
product links returned 200, and checkout returned the expected 303.

Response policy checks passed:

- root and `index.html`: `Cache-Control: no-cache`;
- hashed JS/CSS: `public, max-age=31536000, immutable`;
- service worker: `no-cache`;
- manifest: `application/manifest+json`;
- HSTS, restrictive CSP, Permissions-Policy, `Referrer-Policy: no-referrer`,
  and `X-Content-Type-Options: nosniff` are present.

## Independent product exercise

Fresh production profiles exercised valid, boundary, invalid, and recovery
paths in addition to the repository suite.

- Invalid email and negative amount remained on `/new` with native invalid
  states. Whitespace-only client, project, and scope produced field guidance.
- A Unicode client and USD 0.01 quote saved, survived reload, required all
  three review checks and a reviewer name of at least two characters, then
  produced a named send-ready record and 64-character SHA-256 fingerprint.
- The client link put its payload after `#client/`; the fragment and client
  name did not appear in observed requests.
- A separate 390 px client profile required an answer, name, and explicit
  consent. It downloaded a schema-2 receipt with the exact consent sentence
  and a 64-character receipt digest.
- Importing that separate-client receipt into the matching demo agency quote
  immediately showed Accepted by Ada Client and survived reload. JSON contained
  the decision; CSV contained one header plus two sample quote rows.
- A past-expiry link showed “This quote has expired” and no decision form.
- The repository suite additionally passed unsafe-cent, 501-character name and
  reviewer, structurally invalid backup, missing-consent receipt, conflicting
  decision, storage recovery, five-quote limit, cancellation, and deletion
  cases.

The separate-client post-submit state fails; see QD-019.

This is a static PWA, not a library, CLI, or product backend. Consumer install,
server concurrency/persistence/health, and sign-in checks do not apply. No
sign-in exists, so the Entra authority requirement is not applicable.

## Privacy, billing, and request limiting

Anonymous home/demo/client activity made same-origin requests only, set no app
cookies, and loaded no analytics, trackers, remote fonts, or runtime CDNs. The
live privacy claim passed while recording the full demo request log. Quote
content stayed in IndexedDB or the link fragment. Billing calls occurred only
for explicit checkout/license actions.

The checkout endpoint returned HTTP 303 to hosted Dodo checkout, which returned
200 and displayed “Quote Decision Unlimited,” `$19.00`, and “One-time unlimited
quote log unlock with future v1 updates.” No purchase was attempted.

A fresh sequential burst against only this product's verification endpoint
returned HTTP 200 with `{valid:false, reason:"invalid"}` for requests 1–30.
Request **31** returned HTTP 429 with `Retry-After: 2` and body `Too Many
Requests! Wait for 2s`. The observed allowance is 30 requests per burst before
the 31st is limited.

## PWA, accessibility, responsive behavior, and performance

Live Chromium reported no installability or manifest errors. The page was
controlled by `qd-shell-v3`; its cache contained the app shell, demo route,
manifest, icons, hashed JS, and hashed CSS. After going offline, `/demo`
reloaded with the offline banner and both samples, with no console/page errors.
The isolated update test changed cache versions, showed the update action,
activated it, removed the old cache, and passed.

Playwright Axe found zero serious/critical issues on live home, demo, form,
data, privacy, terms, 404, quote detail, and 390 px client states. Each inspected
route had one `h1` and one `main`. Natural first Tab focused the skip link with
a 3 px brass outline; Enter focused `main`. Keyboard-only review passed in the
suite. Reduced motion used `scroll-behavior: auto`, 0.01 ms animation duration,
and one iteration. At 200% text and 390 px, `scrollWidth` stayed 390 px and the
main actions remained visible. One target is one pixel short; see QD-021.

The art-deco dispatch visual system is distinct and matches `.factory/design.md`.
Desktop and mobile screenshots showed clear hierarchy, legible content, and no
clipped task controls.

Exact build sizes:

| Asset | Raw | Gzip / budget |
| --- | ---: | ---: |
| Initial JS | 51.45 kB | 16.16 kB / 200 kB |
| CSS | 23.04 kB | 5.99 kB / 50 kB |
| Mobile hero | 25.96 kB | budget 300 kB |
| Desktop hero | 48.00 kB | n/a |
| Fonts | 0 B | budget 120 kB |

Fresh Lighthouse 12.8.2 mobile-style production run:

| Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT | Transfer |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 100 | 100 | 100 | 1.064 s | 1.139 s | 0 | 4.5 ms | 50,215 B |

## Defects by severity

### High — QD-019: a real client's recorded decision is not retained or shown

The client decision path only persists a decision when the receiving browser
already has the sender's quote in its own IndexedDB. That is true in the
same-context repository test and in seeded demo mode, but not for a normal
client opening the fragment link on another device/browser.

Fresh production reproduction:

1. Generate a reviewed quote link and open its `#client/...` payload in a new
   browser context whose normal IndexedDB is empty.
2. Choose Accept, enter `Ada Client`, check the explicit-consent box, and choose
   Record decision.
3. Observe that a valid JSON receipt downloads and a temporary toast says the
   decision was recorded.

Actual result immediately after submission and again after reload:

```text
decision form count: 1
Accepted by Ada Client heading count: 0
Download receipt again count: 0
```

The form is blank again. A reload removes even the temporary toast. This
contradicts the form's claim, “Your entry stays on this device unless you share
the downloaded file,” and lets a client unknowingly create conflicting repeat
decisions. The receipt itself is valid and can be imported by the sender, but
the client-facing half of the core decision audit does not provide a durable or
clear completion state.

The existing lifecycle test misses the defect because it opens the client link
with the agency's same `page/context`. The demo also masks it by seeding the
matching quote ID into every demo browser.

### Medium — QD-020: unlisted cold-link network claim is inaccurate

The share screen states:

> This link carries the quote itself. No account or network request is needed
> to read it.

A cold client must fetch the HTML, hashed JavaScript, and CSS before it can
decode or display the fragment. Offline reading works only after that browser's
first visit/service-worker install. No `.factory/claims.json` entry names or
tests the unconditional network claim; `client-link` asserts only that the
payload is in the fragment. Under the supplied claims contract, an unlisted
visitor claim is release-blocking until it is removed, qualified (“after the
first visit”), or given its own accurate sandbox test.

### Low — QD-021: app skip link is 43 px tall at the mobile baseline

At 390 px, the focused app skip link measured 202.6×43 CSS px on `/`, `/demo`,
`/new`, and `/data`. Other measured links, buttons, form controls, and legal
targets met 44×44 px. Increase the skip link's effective height by at least one
pixel to meet the supplied touch-target baseline.

## Acceptance decision

**FAIL.** Do not promote this candidate as complete. Fix QD-019 and add a
separate-browser client test that asserts immediate and reload-persistent
decision state. Remove or accurately qualify/test the network claim in QD-020.
QD-021 should be corrected with the same repair. Rerun all claim commands,
clean gates, the isolated-client flow, and live offline verification afterward.
