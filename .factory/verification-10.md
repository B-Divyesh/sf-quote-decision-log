# Independent product verification 10 — PASS

Verified 2026-09-02 UTC for work order `quote-decision-log-verify-10`.

- Candidate: `13c9cc19def35b5ffbeebc33385ca44ea46041ba`
- Production: <https://quote-decision-log.sociobot.in>
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2 / Chromium 1208
- Artifact: local-first offline PWA
- Product code changed by verifier: none

## Verdict

**PASS.** The candidate meets the researched brief and the supplied product
contract. No critical, high, medium, or low defects were found.

## Mandatory first checks

`.factory/claims.json` exists and contains 19 claims. After `npm ci`, every
listed command was invoked from the clean candidate checkout against its demo
entry point and passed:

`demo-sample-data`, `quote-fields`, `local-device-privacy`,
`no-tracking-remote-resources`, `json-export`, `csv-export`,
`quote-fingerprint`, `review-checkpoint`, `client-link`, `decision-receipt`,
`decision-consent-record`, `receipt-import`, `client-decision-retention`,
`backup-import`, `delete-local-quotes`, `delete-client-receipt`,
`unlimited-price`, `free-five-quotes`, and `offline-reload`.

Cold production first-read passed. The first screen says “Review quotes before
you send them,” identifies “tiny agencies,” and presents “Try it with sample
data” with the adjacent outcome “See two sample quotes; no data is saved.” One
click opens the isolated two-quote demo with persistent Reset demo and Start
for real controls.

## Clean candidate gates

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 61 packages installed; npm reported 0 vulnerabilities |
| `npm test` | PASS — 11/11 Vitest tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/` produced |
| `npm run test:e2e` | PASS — 48 passed, 30 expected project skips |
| `npm run test:performance` | PASS — 390×844 at 4× CPU slowdown |

The production build emitted 55,076 bytes of JavaScript (17.04 kB gzip),
24,725 bytes of CSS (6.29 kB gzip), a 25,958-byte mobile WebP, and a
47,998-byte desktop WebP. These are within the stated static/PWA budgets.

## Live deployment and product behavior

All 20 publicly served files from fresh `dist/` matched the deployed files
byte-for-byte by SHA-256. The complete Playwright suite then passed against
`PLAYWRIGHT_BASE_URL=https://quote-decision-log.sociobot.in` with the same
48 passed / 30 expected skips result.

This exercises representative normal and recovery paths: quote creation,
scope/value/expiry persistence, named three-check review, send-ready state,
fragment-only client link, client acceptance with exact consent and typed name,
portable receipt export/import, invalid-receipt rejection, backup recovery,
normal/demo namespace isolation, delete controls, free five-quote boundary,
and invalid safe-money input.

The live PWA registered and controlled `/sw.js`; after the first visit, a
390 px demo browser context reloaded while offline with the demo log and
offline status visible and no page/console errors. The suite also passed the
waiting-service-worker update lifecycle. At 390 px,
`scrollWidth = clientWidth = 390`; keyboard focus was a visible 3 px brass
outline; reduced motion reduced observed animation/transition durations to
0.01 ms.

## Accessibility, privacy, and policies

- Fresh axe scans on live `/`, `/demo`, `/new`, and `/data` at desktop/mobile
  viewports found zero serious or critical violations. Each had one `h1` and
  one `main`; no scanned route logged console or page errors.
- The complete live demo/client/export flow passed its request-log claim:
  same-origin GET app resources only, with no analytics, ads, trackers, remote
  fonts, runtime CDNs, beacons, XHR, or fetch calls. Client payload remains in
  the URL fragment rather than HTTP requests.
- Responses include HSTS, `nosniff`, `Referrer-Policy: no-referrer`, a
  restrictive CSP and Permissions-Policy. Root and service worker are
  `no-cache`; hashed assets are one-year immutable. Manifest MIME is
  `application/manifest+json`; unknown routes return the designed HTTP 404.
- The explicit Sociobot invalid-license verification returned
  `{ "valid": false, "reason": "invalid" }`. A fresh one-client burst to
  this product's verify endpoint returned 200 for requests 1–30 and 429 with
  `Retry-After: 3` for request 31. Observed allowance: 30 requests per burst.

Fresh mobile Lighthouse on live `/demo` reported performance 99 and
accessibility 100, with LCP 1.1 s, CLS 0, and TBT 100 ms.

## Defects and next steps

None. A real purchase was not made; verification correctly stopped at the
product-specific hosted Sociobot checkout handoff, while the UI/claim test
verified the exact checkout target.
