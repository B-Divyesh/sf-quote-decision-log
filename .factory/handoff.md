# Quote Decision — independent verification 12 handoff

## Result

**FAIL.** Candidate `a0660accb4191737e8edfac24f19e2597d6fb926` was
independently verified on 2026-09-02 UTC against
<https://quote-decision-log.sociobot.in>. The live deployment matches every
public file in the rebuilt candidate. No product code was changed. The
candidate has one release-blocking medium defect: at 390 px while offline, the
fixed offline notice completely covers the required **“Demo — sample data,
nothing is saved.”** disclosure.

Full evidence and observations are in
[`.factory/verification-12.md`](verification-12.md). Fresh screenshots, the
URL-verifier output, and the Lighthouse JSON are in `.factory/qa-evidence/`.

## What was verified

- All 19 commands declared in `.factory/claims.json` passed independently.
- The cold first screen plainly identifies the job, tiny-agency user, and first
  action; its one-click demo opens two isolated sample quotes.
- `npm ci`, 12 unit tests, typecheck, lint, production build, 49 local browser
  tests, and the throttled-mobile performance test passed.
- The production-safe live suite passed 48 tests with 30 intentional
  cross-project skips.
- Normal, boundary, invalid, expiry, version-retention, receipt, recovery,
  export/delete, free-limit, and paid-license handoff paths passed.
- Desktop, 390 px mobile, keyboard, focus, reduced motion, 200% text,
  serious/critical Axe, console/page-error, link, and response-header checks
  passed.
- PWA installability, live offline reload, and the exact build's waiting-worker
  update flow passed; visual inspection found the overlapping mobile notices.
- All 20 public build files matched production byte-for-byte by SHA-256.
- Billing verification enforced an observed 30-request burst allowance per
  client; excess requests returned 429 with `Retry-After: 4`.
- Live Lighthouse scored 100/100/100/100 with LCP 1.13 s, CLS 0, TBT 36 ms,
  and 54,837 bytes transferred.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
PLAYWRIGHT_BASE_URL=https://quote-decision-log.sociobot.in npm run test:e2e -- --grep-invert "offers and activates a waiting service-worker update"
```

Demo: <https://quote-decision-log.sociobot.in/demo>

## Known gaps

**QD-009 (medium, release-blocking):** on an offline 390×844 `/demo` reload,
the fixed offline notice spans vertical pixels 0–54 while the demo disclosure
spans 33–49. The disclosure is fully obscured, although Reset demo and Start
for real remain visible. This violates the persistent demo-banner contract and
the rule against fixed bars hiding content. See the reproduction, hit-test
evidence, and suggested regression in `.factory/verification-12.md`.

A real purchase was not made; QA stopped at the working product-specific
hosted checkout handoff to avoid a charge.
