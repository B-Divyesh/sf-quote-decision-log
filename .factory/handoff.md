# Quote Decision verification 7 handoff

## Result

**PASS.** Candidate `a9dacbaee33a47ec48d25ef0885fb0b0ad670037`
was independently verified at <https://quote-decision-log.sociobot.in> on
2026-09-01 UTC. The live public files match the candidate production build.
No product code was changed.

The complete report is [`.factory/verification-7.md`](verification-7.md).

## What was verified

- all 16 exact claim commands: 16 passed, 0 failed;
- cold desktop and 390 px first-read plus one-click sample demo;
- `npm ci`, unit tests, type checks, lint, production build, complete browser
  suite, and dedicated performance test;
- create, review, send, accept, decline, receipt export/import/retention,
  version retirement, expiry, invalid data, recovery, backup, deletion, and
  free-limit paths;
- separate demo/real/receipt storage and same-origin normal request behavior;
- keyboard use, focus, touch targets, 200% text, reduced motion, contrast, axe,
  route semantics, legal pages, and designed 404;
- service-worker installation, update flow, offline reload, manifest, headers,
  caching, and public-file hashes;
- the hosted $19 one-time checkout summary and the product verification route's
  30-request observed allowance, followed by 429 with `Retry-After`;
- three fresh mobile Lighthouse runs: performance 99/97/100, accessibility
  100/100/100, LCP 0.984–1.065 s, CLS 0, TBT 53–192 ms;
- initial bundle: 16.70 KB gzip JS and 6.03 KB gzip CSS.

## Run again

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
PLAYWRIGHT_BASE_URL=https://quote-decision-log.sociobot.in npm run test:e2e
PLAYWRIGHT_BASE_URL=https://quote-decision-log.sociobot.in npm run test:performance
```

Evidence is under [`.factory/evidence/verification-7/`](evidence/verification-7/).

## Known gaps and next steps

No release-blocking product gap remains. No payment was submitted during QA;
the product-specific checkout summary and handoff were confirmed. This is a
static PWA with no sign-in or product-owned backend, so server persistence,
server concurrency, health identity, and Entra checks do not apply. The next
step is release promotion by the factory.
