# Independent product verification 12 — FAIL

Verified 2026-09-02 UTC for work order
`quote-decision-log-verify-12`.

- Candidate: `a0660accb4191737e8edfac24f19e2597d6fb926`
- Production: <https://quote-decision-log.sociobot.in>
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2 / Chromium 1208,
  Lighthouse 12.8.2
- Artifact: local-first offline PWA
- Verifier product-code changes: none

## Verdict

**FAIL.** The live deployment matches the candidate build and the core workflow
works, but the required persistent demo disclosure is completely hidden by the
offline notice at 390 px. This violates the demo-sandbox and mobile layout
contract.

## Mandatory first checks

`.factory/claims.json` exists and declares 19 claims. After `npm ci`, every
listed command was invoked independently from the clean candidate checkout.
All passed through the demo entry point:

`demo-sample-data`, `quote-fields`, `local-device-privacy`,
`no-tracking-remote-resources`, `json-export`, `csv-export`,
`quote-fingerprint`, `review-checkpoint`, `client-link`, `decision-receipt`,
`decision-consent-record`, `receipt-import`, `client-decision-retention`,
`backup-import`, `delete-local-quotes`, `delete-client-receipt`,
`unlimited-price`, `free-five-quotes`, and `offline-reload`.

Cold production first-read passed. The initial screen says **“Review quotes
before you send them.”**, identifies tiny agencies needing a checked quote and
clear client answer, and makes **“Try it with sample data”** the primary action.
Adjacent text says that it opens two sample quotes and saves no data. One click
opened `/demo`, the two seeded agencies, and the persistent **Reset demo** and
**Start for real** controls. A fresh direct `/demo` context created only
`demo:quote-decision-log`, not the normal quote database.

## Clean candidate gates

| Check | Result |
| --- | --- |
| Checkout | PASS — clean `main` at the full candidate hash before testing |
| `npm ci` | PASS — 61 packages installed; 0 vulnerabilities reported |
| `npm test` | PASS — 12/12 Vitest tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — exact `tsc -b && vite build`; `dist/` produced |
| `npm run test:e2e` | PASS — clean final run: 49 passed, 31 intentional project skips |
| `npm run test:performance` | PASS — 390×844 at 4× CPU slowdown |
| Live production-safe suite | PASS — 48 passed, 30 intentional project skips |
| Live performance test | PASS — same throttled-mobile budget |

During an earlier full browser run, Chromium itself exited with SIGSEGV while
opening a context for the update test. Playwright retried it successfully. The
test then passed alone, and the complete suite was rerun cleanly with 49 passed
and no retry. This was runner instability, not an application failure.

The exact build emitted 55,076 bytes of JavaScript (17.04 kB gzip), 24,739
bytes of CSS (6.27 kB gzip), no font files, a 25,958-byte mobile image, and a
47,998-byte desktop image. All are within the supplied PWA budgets.

## Deployment identity and routes

The rebuilt candidate has 20 publicly served output files plus the Azure Static
Web Apps control file. Every public file was fetched and compared by SHA-256:
**20 compared, 0 mismatches**. This covers HTML, hashed JavaScript/CSS and map,
both hero images, icons, manifest, service worker, offline page, privacy, terms,
robots, sitemap, social preview, and 404 page. Direct access to
`staticwebapp.config.json` correctly returns 404.

The candidate itself adds documentation/evidence on top of product commit
`b267f8ed9c32f4943b608541a5315311935c6d39`; there is no candidate delta under
`src`, `public`, build configuration, or dependencies. The byte comparison
therefore proves that production is the candidate product artifact.

A fresh crawl found no dead links. All same-origin application, demo, legal,
offline, and sample-quote URLs returned 200. An unknown URL returned the
designed page with HTTP 404. The product checkout returned 303 to the hosted
Dodo checkout, and `https://sociobot.in/` returned 200.

## End-to-end and adversarial behavior

The local and live browser suites exercised quote creation; scope, value, and
expiry persistence; a named three-check review; send-ready state; a fragment-
only client link; separate 390 px client acceptance; exact consent text and
typed name; portable receipt export/import; altered and missing-consent receipt
rejection; JSON/CSV export; backup delete/import recovery; demo/normal database
isolation; receipt and quote deletion; the five-quote free boundary; and invalid
stored-data recovery.

An additional fresh production flow found:

- spaces-only required fields were rejected with field guidance;
- malformed email and `-1` amount were rejected by named native validation;
- the documented zero-value boundary saved and displayed as `$0.00`;
- a one-character reviewer could not clear the review checkpoint;
- a quote expired on 2026-09-01 displayed the expiry notice on 2026-09-02 and
  exposed no decision form;
- editing the reviewed/sent quote produced version 2, changed its SHA-256
  fingerprint, removed its review state, and showed **Needs review**;
- reloading the old client link still showed the original version 1 scope and
  fingerprint, with no revised text in the request or page; and
- no console or page errors occurred throughout that flow.

These results cover normal, boundary, invalid-input, and recovery paths from
the brief. Library/CLI packaging, backend persistence/concurrency, and sign-in
checks do not apply to this static PWA.

## Accessibility and responsive behavior

`/opt/fleet/lib/verify-url.sh` reported HTTPS 200, a 793 ms network-idle load,
`lang=en`, one `h1`, one `main`, complete image alt text, labelled buttons, and
no console/page errors. Fresh Axe 4.10.2 scans of `/`, `/demo`, `/new`, and
`/data` found zero serious or critical violations; the full suite also scans
the legal, offline, 404, and client screens.

- At 390×844, `scrollWidth` equalled `clientWidth` at 390 px. No visible
  interactive target measured below 44×44 px.
- All three first-screen facts ended by 636.38 px on mobile and 645.61 px at
  1440×768, so they were visible without scrolling.
- Keyboard-only creation and review passed. First Tab focused the skip link;
  its focus treatment was a 3 px solid brass outline and the target measured
  about 203×44 px.
- With reduced motion, scroll behavior was `auto`; observed animation and
  transition durations were 0.01 ms with one iteration.
- A 200% text-scale probe found no clipped text or unavailable controls, and
  the viewport meta does not disable zoom.

Screenshots and the URL verifier result are under
`.factory/qa-evidence/`.

## Privacy, headers, caching, and billing boundary

The cold page and full demo/client/export flow made same-origin GET requests
only. No beacon, XHR, fetch, analytics, advertising tracker, remote font,
runtime CDN, cookie, client name, or `#client/` fragment left the app origin.
The explicit billing actions are the only observed cross-origin boundary.

Root responses are Brotli-compressed and `no-cache`; the service worker is
`no-cache`; hashed JavaScript/CSS are cached for one year with `immutable`.
The manifest is served as `application/manifest+json`. Responses include HSTS,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, a restrictive
CSP with `frame-ancestors 'none'`, and a restrictive Permissions-Policy.

The product-specific checkout returned HTTP 303 to a hosted Dodo session; no
purchase was made. An invalid license verification returned HTTP 200 with
`{"expires_at":null,"reason":"invalid","valid":false}`. From one client, one validation followed
by a concurrent 35-request burst produced 30 total HTTP 200 responses and six
HTTP 429 responses. The excess responses included `Retry-After: 4`. Observed
allowance: **30 requests per burst per client**.

## PWA and performance

Chromium reported no manifest or installability errors. The live service worker
controlled `/demo` with cache `qd-shell-v10`; a 390 px offline navigation
reloaded the sample log, displayed the offline banner, and retained Cedar &
Kite without console/page errors. The exact local production build's update
test created a waiting worker, showed **“A fresh version is ready.”**, activated
it via **Update now**, removed the old cache, and reloaded successfully.

Fresh Lighthouse 12.8.2 on live `/demo` reported:

| Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT | Transfer |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 100 | 100 | 100 | 0.90 s | 1.13 s | 0 | 36 ms | 54,837 B |

The report is `.factory/qa-evidence/lighthouse-live-demo.json`.

## Claims and defects

The live landing page, README, privacy page, terms, and data screen were
cross-checked against `.factory/claims.json`. No unmatched visitor-facing
product claim was found. Every listed claim has one tagged observable test.

### Medium — QD-009: Offline notice completely hides the demo disclosure on mobile

Reproduction on the live candidate:

1. Open `/demo` in a fresh 390×844 context and wait for service-worker control.
2. Set the browser offline and navigate to `/demo` again.
3. Inspect the top of the page.

The fixed offline banner occupied `top: 0` through `bottom: 54`. The required
demo label occupied `top: 33` through `bottom: 49`, so all 16 px of its text was
covered. Hit tests at the label's left, center, and right returned
`.offline-banner`, not the demo label. **Reset demo** and **Start for real**
remain visible, but their explanation — **“Demo — sample data, nothing is
saved.”** — does not.

Evidence: `.factory/qa-evidence/live-demo-offline-390x844.png`.

Impact: while using the advertised offline demo, a visitor cannot see that the
workspace contains sample data and that changes are not saved as real data.
This fails the demo-sandbox requirement for a persistent demo banner and the
mobile layout rule that content must not hide behind fixed bars. The automated
offline claim currently asserts the offline banner and sample row, but misses
this overlap.

Suggested repair: reserve space for the wrapped offline notice or stack it in
normal flow above the demo banner at narrow widths, then add a 390 px offline
assertion that the demo label is visible and is the topmost element at its
center point.

## Final decision

**FAIL.** Do not promote `a0660accb4191737e8edfac24f19e2597d6fb926`
until QD-009 is fixed and the mobile offline-demo intersection is retested. A
real paid purchase was not made; QA stopped at the correct product-specific
hosted checkout handoff and exercised invalid-license handling plus the
enforced API allowance without charging a card.
