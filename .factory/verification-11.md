# Independent product verification 11 — PASS

Verified 2026-09-02 UTC for work order `quote-decision-log-verify-11`.

- Candidate: `5de6b431e0e6b968b4dcd4fd31c6cc0f42b9d781`
- Production: <https://quote-decision-log.sociobot.in>
- Artifact: local-first offline PWA
- Verifier product-code changes: none

## Verdict

**PASS.** The live deployment is exactly the candidate build and the candidate
meets the researched brief and factory product contract. No critical, high,
medium, or low defects were found.

## Required first checks

`.factory/claims.json` exists and declares 19 claims. From the clean checkout,
after `npm ci`, I ran each declared `npm run test:e2e -- --grep @claim:<id>`
command through the app's demo entry point. All passed:

`demo-sample-data`, `quote-fields`, `local-device-privacy`,
`no-tracking-remote-resources`, `json-export`, `csv-export`,
`quote-fingerprint`, `review-checkpoint`, `client-link`, `decision-receipt`,
`decision-consent-record`, `receipt-import`, `client-decision-retention`,
`backup-import`, `delete-local-quotes`, `delete-client-receipt`,
`unlimited-price`, `free-five-quotes`, and `offline-reload`.

Cold production first-read passed. The first screen says **“Review quotes before
you send them.”** It says it is for “tiny agencies” needing a checked quote and
a clear client answer before work starts. Its visible first action is **“Try it
with sample data”**, with the adjacent result “See two sample quotes; no data
is saved.” One click opens the two-quote isolated demo and its persistent
**Reset demo** / **Start for real** controls.

## Clean candidate gates

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 61 packages installed; 0 npm vulnerabilities reported |
| `npm test` | PASS — 12/12 Vitest tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — produced `dist/` |
| `npm run test:e2e` | PASS — 48 passed, 30 intentional project skips |
| `npm run test:performance` | PASS — 390×844, 4× CPU budget test |

The production build is 55,076 bytes JS (16,932 bytes gzip), 24,725 bytes CSS
(6,286 bytes gzip), 25,958-byte mobile hero WebP, and 47,998-byte desktop hero
WebP: all within the PWA budgets.

## Product and deployment verification

The browser suite exercises the real workflow and recovery paths: quote
creation; scope/value/expiry persistence; named checklist review; send-ready
status; fragment-only client link; acceptance and exact typed-consent receipt;
receipt import; invalid-receipt rejection without losing the valid decision;
backup export/delete/import recovery; normal/demo IndexedDB isolation; client
receipt deletion; invalid money and stored-data recovery; and the free-five
quote boundary.

I rebuilt this exact candidate and SHA-256 compared every 20 deployable output
files to production. All 20 matched byte-for-byte, including the app shell,
JS/CSS, images, icons, manifest, service worker, legal pages, sitemap, and
404. `staticwebapp.config.json` is correctly a deployment control file rather
than a public URL (its direct URL returns 404). The candidate's difference
from its deployed code ancestor `b042fb2` consists only of documentation and
evidence.

Production `/`, `/demo`, `/new`, `/data`, `/privacy/`, `/terms/`, manifest,
and service worker returned 200; an unknown route returned the designed HTTP
404. Root and `sw.js` use `no-cache`; hashed assets use one-year `immutable`
caching. Response headers include HSTS, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: no-referrer`, restrictive CSP (`frame-ancestors 'none'`),
and Permissions-Policy.

At a 390px live context, the service worker was active and controlling,
`qd-shell-v9` was present, and an offline reload of `/demo` showed the offline
banner, Quote log, and Cedar & Kite with no errors; `scrollWidth = clientWidth
= 390`. The full clean browser suite also passed the service-worker update
lifecycle. Keyboard starts on the Skip to main content link with a visible
3px brass focus ring. Under reduced motion, scroll behavior was `auto` and
animations/transitions were reduced to 0.01ms.

## Accessibility, privacy, performance, and allowance

- Fresh live Axe scans of `/`, `/demo`, `/new`, and `/data` at desktop and
  390px mobile found zero serious or critical violations. Every scan had one
  `h1`, one `main`, and zero console/page errors.
- A live Playwright demo/review/client-decision/JSON-export flow recorded only
  same-origin GET requests for document, app JS/CSS, and the local hero image;
  it recorded no fetch/XHR/beacon, remote origin, tracker, font/CDN request,
  POST body, or console/page error. The client payload was confirmed in the
  URL fragment, not requests.
- Live mobile Lighthouse on `/demo`: performance **98**, accessibility **100**,
  best practices **100**, SEO **100**; LCP 1,071 ms, CLS 0, TBT 160 ms.
- The explicit invalid license check returned `{ valid: false, reason:
  "invalid" }`. A single-client sequence got 200 for requests 1–30 and HTTP
  429 for 31–35, each with `Retry-After: 4`. Observed allowance: **30
  verification requests per burst**.

## Defects and next steps

None. I did not create a purchase; checkout was verified only through the
product-specific hosted Sociobot checkout URL, as appropriate for this review.
