# Quote Decision — independent verification 13

## Verdict

**PASS** — candidate `051ee2d171ce1420eecda47da4d5e521d8305cb0` is buildable and the deployed product at <https://quote-decision-log.sociobot.in> matches its production build.

Verified on 2026-09-02 from `/work/repo`, a clean checkout at the candidate
commit. No product code was modified during this verification.

## Cold first read

The cold live landing screen says: **“Review quotes before you send them.”**
It says it is for **“tiny agencies”** needing a checked quote and a clear client
answer before work starts. Its visible primary action is **“Try it with sample
data”**, with the adjacent explanation **“See two sample quotes; no data is
saved.”** This answers what the product does, who it is for, and what to click
first in plain words. The action opens `/demo` in one click.

## Required claim contract

`.factory/claims.json` exists and contains 19 claims. From the clean install I
ran every declared command, separately through the shipped Playwright demo
entry point. All exited successfully:

`demo-sample-data`, `quote-fields`, `local-device-privacy`,
`no-tracking-remote-resources`, `json-export`, `csv-export`,
`quote-fingerprint`, `review-checkpoint`, `client-link`, `decision-receipt`,
`decision-consent-record`, `receipt-import`, `client-decision-retention`,
`backup-import`, `delete-local-quotes`, `delete-client-receipt`,
`unlimited-price`, `free-five-quotes`, and `offline-reload`.

The expected duplicate mobile-project skips in desktop-only claim coverage were
reported as skips, not failures. The final Playwright status was `passed` with
no failed tests.

## Local quality gates

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 0 vulnerabilities reported |
| `npm test` | Passed: 12 tests |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run build` | Passed; produced `dist/` |
| `npm run test:e2e` | Passed; 80-case desktop/mobile suite, expected skips only |
| `npm run test:performance` | Passed |

The exact production build has 17.04 KB gzip JavaScript and 6.29 KB gzip CSS;
there are no downloaded fonts. The largest hero WebP is 48.00 KB. These are
within the applicable static-PWA budgets. An independent live 390×844 run at
4× CPU slowdown measured CLS **0** and blocking time **170 ms** (budget:
<0.05 and <=200 ms).

## Live deployment and functional QA

- Rebuilt candidate output and fetched every public build file from production:
  all 20 public files matched byte-for-byte, including the hashed JS/CSS,
  PWA icons, manifest, legal pages, images, and `sw.js`. The deployment-only
  `staticwebapp.config.json` is intentionally not a public URL (it returns the
  designed 404), so it was not treated as an asset mismatch.
- Ran `PLAYWRIGHT_BASE_URL=https://quote-decision-log.sociobot.in npm run
  test:e2e` and `npm run test:performance`; both completed with Playwright
  status `passed`.
- This covers representative quote creation, named review/send-ready gating,
  client decision/consent receipt and import, exports/imports/deletion,
  five-quote boundary behavior, whitespace-only invalid input and recovery,
  demo isolation, and desktop plus 390px mobile layouts.
- Keyboard-only review workflow passed: skip link, focus transfer, form input,
  checkbox Space activation, reviewer name, and send-ready action. Mobile
  check found `scrollWidth === 390`, one `h1`, a `main` landmark, and no errors.
- Axe scans on live `/demo`, `/privacy/`, and `/terms/` found zero serious or
  critical violations. The full suite also scans the form, data, offline, and
  404 screens.

## Privacy, PWA, and response policy

- A fresh live browser request log across demo, legal, and offline flow made
  16 GET requests, all to `https://quote-decision-log.sociobot.in`; no fetch,
  XHR, tracker, remote font, beacon, or page/console error was observed.
  The claim suite separately covers the client decision and export flows.
- Live CSP is restrictive and matches the app: self-only scripts/fonts,
  `frame-ancestors 'none'`, `object-src 'none'`, self-only images (plus data
  URIs), and the explicit Sociobot billing origins in `connect-src`. Responses
  include HSTS, `no-referrer`, `nosniff`, and a locked-down Permissions-Policy.
  Hashed JS is `public, max-age=31536000, immutable`; `sw.js` is `no-cache`.
- The live worker controlled the page. In an isolated context, after initial
  `/demo` load, an offline reload showed the sample log, the offline notice,
  and the persistent demo disclosure with no errors. A routed, browser-only
  simulated new `v13` worker showed **“A fresh version is ready”**, exposed a
  waiting worker, and activated via **“Update now”** without errors. No server
  state was changed.
- This static PWA exposes no product server endpoint. The only optional remote
  interaction is Sociobot's hosted checkout/license verification, which is not
  invoked without a user license; checkout handoff is covered without following
  it. Therefore an application request-rate allowance is not applicable.

## Defects by severity

- **Release-blocking / high / medium:** none.
- **Low (test-maintenance):** `tests/app.spec.ts` still substitutes/asserts
  `qd-shell-v10` cache names in its service-worker update regression while the
  shipped worker uses `v13`. The automated test currently passes, and the
  independently simulated v13 update path passed, so this is not a product
  failure. Update the literal regression cache names before the next worker
  cache-version change to keep the automated assertion precise.

