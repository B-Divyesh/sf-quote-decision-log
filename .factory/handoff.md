# Quote Decision independent verification 5 handoff

## Result

**PASS** for candidate `511beddd3cc2855a997729b35373fd906eb80e7e` at
<https://quote-decision-log.sociobot.in>, verified 2026-09-01 UTC under work
order `quote-decision-log-verify-5`.

All 12 mandatory claim commands passed from the clean clone. The cold first
screen plainly states the job, intended tiny-agency user, and first action, and
offers the one-click isolated sample demo. The full local quality gates pass,
production matches all 20 public build files, and fresh desktop/mobile product,
privacy, accessibility, PWA, billing, header, caching, and performance checks
found no release-blocking defect.

The complete evidence and classification are in
[`verification-5.md`](verification-5.md).

## Verification summary

```text
npm ci                              PASS — 61 packages, 0 vulnerabilities
12 claims.json commands             PASS — 12 passed, 12 expected project skips
npm test                            PASS — 10/10 Vitest tests
npm run typecheck                   PASS — no diagnostics
npm run lint                        PASS — no diagnostics
npm run build                       PASS — dist/ emitted
npm run test:e2e                    PASS — 35 passed, 21 expected project skips
factory verify-url.sh               PASS — 200, no console/page errors
production artifact identity        PASS — 20/20 exact matches
Playwright Axe                      PASS — 0 serious/critical findings
PWA install/offline/update          PASS
license request allowance           PASS — request 31 returned 429 + Retry-After
```

Fresh Lighthouse 12.8.2 production result: performance 98, accessibility 100,
best practices 100, SEO 100, FCP 1.5 s, LCP 1.8 s, CLS 0, TBT 130 ms, transfer
78 KiB.

## Product behavior confirmed

- Create a quote, recover from invalid input, and store a zero-value boundary.
- Require all three internal checks and a named reviewer before send-ready.
- Preserve the exact reviewed version with a 64-character SHA-256 fingerprint.
- Carry the client quote in a URL fragment without request leakage.
- Record either client answer with explicit consent in a separate clean mobile
  profile, retain the receipt after reload, and import it into the agency log.
- Retire earlier decisions when a new quote version is saved.
- Block new decisions on expired links and recover clearly from malformed links.
- Export JSON/CSV/decision receipts, recover damaged data, and delete local data.
- Keep demo and real IndexedDB namespaces separate.
- Reload the seeded demo offline and activate a waiting service-worker update.
- Show the exact five-quote free limit and $19 one-time unlimited option.

## Privacy and live policy

Ordinary home, demo, and client flows made same-origin requests only and set no
app cookies. No analytics, trackers, remote fonts, or runtime CDNs were seen.
The only cross-origin application call is the documented explicit Sociobot
license action. The product verification endpoint allowed 30 sequential
requests; request 31 returned 429 with `Retry-After: 4`.

Root and the service worker are not cached stale; hashed assets are immutable.
The manifest MIME, HSTS, CSP, Permissions-Policy, no-referrer, nosniff, and
designed 404 are live.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

## Known gaps

No known release-blocking product gap remains. A repository test portability
note is documented in the report: its valid-return license stub names the
local staging API, so that one test is not directly reusable against the
production API without changing the intercepted host. The required local test
passes, and release-host behavior passed an independent production-origin
check.

This verification changed documentation only. It did not change product code,
deploy the app, or access unrelated services or infrastructure.
