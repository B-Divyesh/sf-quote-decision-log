# Quote Decision — repair 6 handoff

## Result

**PASS.** The three findings in independent verification report commit
`999a50fc4969cb9c66f5f68da3b9acd7d0cd70a4` are repaired, covered by exact
regressions, committed, pushed, and deployed.

- Work order: `quote-decision-log-repair-6`
- Repaired code commit: `c3bb4c2c9b49b2ab8ff1b81710adddefe8a25445`
- Product version: `1.0.6`
- Production: <https://quote-decision-log.sociobot.in>
- Deployment: `0f1b6dee-971d-4df6-8fe3-73fa4b59b12b`
- Azure resource: `sf-quote-decision-log` in `sociobot`

## Repairs

1. Registered `no-tracking-remote-resources` in `.factory/claims.json` for the
   README and privacy-page promise. Its one tagged test runs the landing,
   isolated demo, sent-link, client consent receipt, and export flow. It rejects
   every remote origin, non-GET data request, beacon call, font request,
   tracker-like path, and same-origin resource outside the fixed app allowlist.
2. Replaced `/offline.html` metaphors and jargon with “This page is not
   available offline” and a direct reconnect instruction. It now uses the same
   skip link, wordmark, four navigation links, legal links, footer, metadata,
   stylesheet, focus treatment, and responsive chrome as the static routes.
   `/legal.css` is precached in the new `qd-shell-v8` cache.
3. Made license-return tests select `api.sociobot.in` on production and
   `pilot-api.sociobot.in` elsewhere. The test now proves the expected token was
   requested and waits for a valid, timestamped verification verdict instead
   of accepting the optimistic first paint.
4. Removed a separate demo claim-test race by waiting for Reset demo to finish
   before writing the discard sample.

The required live license failure was reproduced before editing: three runs
with retries disabled produced one pass and two failures at the missing
“Unlimited is active” heading. The fixed test passed 3/3 against production
before deployment and 3/3 again after deployment.

## Clean local verification

Run from `/work/repo`:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

- `npm ci`: 61 packages, 0 vulnerabilities.
- Every one of the 19 `.factory/claims.json` commands was invoked separately;
  all 19 passed.
- Unit: 11/11 passed. Typecheck, lint, and production build passed.
- Full E2E: 47 passed and 30 intended cross-project skips. Chromium 1208
  crashed once while creating a mobile context; the configured runner retry
  passed, and that exact target test then passed with retries disabled.
- The stabilized demo claim passed 3/3 with retries disabled.
- Mobile performance budget passed at 390×844 with 4× CPU slowdown.
- Build output: 55,076-byte JS (17.04 kB gzip), 24,725-byte CSS (6.29 kB
  gzip), 25,958-byte mobile hero, and 47,998-byte desktop hero.
- Local URL checks on `/`, `/demo`, and `/offline.html`: HTTPS-equivalent 200,
  zero console/page errors, title, `lang=en`, one h1, main landmark, complete
  image alternatives, and labelled buttons.
- Three local mobile Lighthouse runs: performance 100, accessibility 100,
  best practices 100, SEO 100; median FCP/LCP 1.056 s, CLS 0, TBT 0.

The browser suite covers create/review/send/accept/decline, exact consent and
fingerprints, receipt import/export, backup recovery, free limits, normal/demo
storage isolation, deletion, desktop, 390 px mobile, keyboard focus, axe scans,
offline reload/fallback, and service-worker update activation. Axe reports no
serious or critical issues on app, legal, fallback, and 404 routes.

## Live verification

- Deployment reused only `sf-quote-decision-log`; DNS and managed TLS were
  already Ready. The public URL returned HTTPS 200 after upload.
- Live E2E, excluding only the test that deliberately mutates the local
  `dist/sw.js`, passed 47 with 29 intended skips and no failures. The update
  lifecycle test passed locally against that mutable file.
- Live URL checks on `/`, `/demo`, and `/offline.html` found zero console/page
  errors and passed the baseline semantic checks.
- Live installability: no manifest errors and no Chromium installability
  errors. The page was service-worker controlled with `qd-shell-v8` present.
- Reduced motion capped animation/transition duration at `0.00001` seconds.
  The 390 px page had `scrollWidth = clientWidth = 390`. A 200% text check at
  640 px had no overflow, retained the h1, and found no visible target below
  44×44 px.
- The new tracking/resource claim passed in the full live suite. Normal flows
  used only allowlisted same-origin GET resources and no beacons, data calls,
  font requests, analytics, advertising trackers, or runtime CDNs.
- All 20 public build files matched local `dist/` byte-for-byte. The deployment
  config is consumed by Static Web Apps and is intentionally not public.
- Response policy: root and service worker use `no-cache`; hashed assets use
  one-year immutable caching; CSP, HSTS, `nosniff`, no-referrer, and restrictive
  Permissions-Policy headers are present. An unknown route returns the designed
  page with HTTP 404.
- Billing identity: the production checkout returned 303 to the hosted
  checkout without being followed; a production invalid-license check returned
  `{valid:false, reason:"invalid"}`.
- Three live mobile Lighthouse runs: 100 in performance, accessibility, best
  practices, and SEO; median FCP 0.903 s, LCP 0.978 s, CLS 0, TBT 0.

Evidence is under [`.factory/evidence/repair-6`](evidence/repair-6), including
local/live screenshots, URL reports, all six Lighthouse JSON reports, and the
machine-readable QA and deployment summaries.

## Known gaps and next steps

No known product gap remains from verification 9. A paid transaction was not
created; verification stopped at the live Sociobot checkout redirect. The
occasional Chromium 1208 process crash is runner-level and recovered on retry;
its exact affected test passed immediately in isolation.
