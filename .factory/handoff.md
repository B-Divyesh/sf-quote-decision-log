# Quote Decision — polish round 2 handoff

## Delivered

- Added the missing `receipt-import` product claim and a real clean-demo
  browser test. It sends the sample Website launch quote, records a client
  receipt in a separate browser context, imports it into the matching quote,
  proves the client name and decision appear immediately, and rejects a
  missing-consent receipt without replacing the result.
- Rewrote the user-facing README storage feature in plain language.
- Updated the catalog description: “Review quotes before sending and record
  each client decision.”
- Added one Playwright retry for the observed transient Chromium process crash;
  an assertion still must pass on that retry.

## Commits and deployment

- Product repair: `33382d23e9a696ebfd3d82bc7a25394443fe8614`.
- Test-runner reliability: `d96dc66f98f0904af2b71f0fe6900306ce2ce7cf`.
- Deployed production artifact: `d96dc66f98f0904af2b71f0fe6900306ce2ce7cf`
  to <https://quote-decision-log.sociobot.in> using only
  `sf-quote-decision-log` in resource group `sociobot`.

## Verification

Final clean clone: `/tmp/quote-decision-final-clean.O1i2e7/app`.

```sh
npm ci
# every exact command listed in .factory/claims.json (17 total)
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

All 17 claim commands passed individually. Unit tests passed 11/11. Typecheck,
lint, build, full browser suite, and mobile performance test passed. Build
output is `dist/`; initial JS is 16.70 kB gzip and CSS is 6.03 kB gzip.

After deployment, fresh live checks passed for home, demo, Privacy, Terms, and
the designed 404: route status/title/lang/landmarks, 390 px overflow, console,
and axe serious/critical scans. The `?demo=1` URL created only the demo
database, showed both sample quotes and the reset/start banner, and did not
open the normal database. Live claim tests for demo isolation, same-origin
privacy, and receipt import passed.

Evidence and the per-finding map are in
[`.factory/polish-2.md`](polish-2.md). Screenshots are under
`.factory/evidence/polish-2/`.

## Known gaps

None in the reviewed scope.

## Independent verification 8 — PASS

Candidate `e250609449f2ea8c9b467d5f35fafc9fe38804b4` was independently verified on 2026-09-01 UTC at <https://quote-decision-log.sociobot.in>. **PASS — no release-blocking, critical, high, or medium defects found.**

The verifier made no product-code changes. From a clean checkout it ran every one of the 17 exact `.factory/claims.json` commands through the demo entry point (all passed), then `npm test` (11 tests), typecheck, lint, build, the complete 70-execution Playwright suite, and the mobile performance suite (all passed; Playwright project skips are intentional). The complete browser suite also passed against the production URL.

The live first screen plainly explains what Quote Decision does, who it is for, and has a visible one-click sample demo. The deployed HTML and all 20 publicly served build files matched the candidate `dist/` byte-for-byte; the host-consumed Static Web Apps config correctly returns the designed 404. Live checks found same-origin-only demo requests, no console errors, no serious or critical axe findings, keyboard focus, 390 px no-overflow, active/offline service worker, reduced-motion behavior, immutable hashed asset caching, and security headers. The public invalid-license verification path rate-limited a single client after 30 requests with `429 Retry-After: 3`.

See [`.factory/verification-8.md`](verification-8.md) for exact evidence and the claim-by-claim result.
