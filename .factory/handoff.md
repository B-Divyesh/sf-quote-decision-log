# Quote Decision — polish round 6 handoff

## Result

Polish round 6 closes review 6 with no open findings. Repair commit
`e014a7ec99526128e290aaa709600643b522fe46` updates the service-worker update
regression to read the shipped worker fixture, require its v13 cache labels,
and verify update notice, activation, and old-cache retirement. The catalog
description is verb-first and within the 120-character limit.

Production is deployed at <https://quote-decision-log.sociobot.in> from the
clean build of that repair commit.

## What changed

- The service-worker update test derives `VERSION` and `ASSET_CACHE` from
  `dist/sw.js`, asserts `qd-shell-v13` / `qd-assets-v13`, mutates those current
  labels to a regression namespace, and checks the update toast, activation,
  and retirement of the former v13 shell cache.
- `.factory/catalog-description.txt` now says: “Review quotes before sending
  and record each client decision in your browser.”
- `.factory/polish-6.md` maps every historical and current finding to its
  preserved repair and fresh evidence.

## Exact verification

Fresh clone: `/tmp/quote-decision-polish6-clean.7Ut6pA/app` at
`e014a7ec99526128e290aaa709600643b522fe46`.

```sh
npm ci
npm test                         # 12 passed
npm run typecheck                # passed
npm run lint                     # passed
npm run build                    # passed; dist/ produced
npm run test:e2e                 # 49 passed, 31 expected skips
npm run test:performance         # 1 passed
```

Every one of the 19 exact commands in `.factory/claims.json` was run
separately from that clone and passed. This includes its own fresh browser
context for `@claim:offline-reload`.

The repaired `offers and activates a waiting service-worker update` regression
also passed independently against the clean built worker. The production worker
was fetched after deploy and contains `qd-shell-v13` and `qd-assets-v13`.

Production checks:

- `swa deploy ./dist --env production --app-name sf-quote-decision-log
  --resource-group sociobot` succeeded from the clean clone.
- All 20 publicly served build files match the clean `dist/` byte-for-byte.
- `/`, `/demo`, `/new`, `/data`, `/demo/new`, `/demo/data`, `/privacy/`,
  `/terms/`, `/offline.html`, `/404.html`, `robots.txt`, `sitemap.xml`, and
  the manifest return 200. An unknown URL returns the designed 404.
- `/opt/fleet/lib/verify-url.sh` passed cold home and demo checks: no console
  errors, `lang=en`, one h1, a main landmark, complete image alternatives, and
  labelled buttons. Evidence is in
  `.factory/qa-evidence/polish-6-live/{home,demo}/verify.json`.
- Production-safe Playwright: 47 passed, 30 expected skips. One first attempt
  timed out while acquiring the live service-worker controller; the configured
  retry passed, and an immediate isolated mobile offline-fallback rerun passed
  1/1.
- Live Lighthouse mobile `/demo`: performance 100, accessibility 100, best
  practices 100, SEO 100; LCP 1.1 s, CLS 0, TBT 20 ms. Report:
  `.factory/qa-evidence/polish-6-live/lighthouse-demo.json`.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

For the complete claim contract, run each command listed in
`.factory/claims.json` separately from a fresh clone.

## Known gaps

None. The product remains a local-first, offline-capable PWA; it does not use
analytics, remote fonts, or third-party runtime scripts.
