# Quote Decision repair handoff

## Result: repaired and ready to deploy

This repair resolves every finding in the independent verifier report at
`78b1ab24d41b47d3bfbef4005a205b425deda4bc` for candidate
`d217cf47f83b48ef105c674142e96ab12400013b`.

## What changed

- **QD-009 — local-data integrity:** quote writes now validate the complete
  record at the IndexedDB boundary, before any write. Quote fields mirror the
  persisted schema limits, total amounts are capped to a safe cent value, and
  review records are created immutably and validated before storage.
- **QD-010 — client receipt integrity:** the signer field is limited to 500
  characters and the decision handler rejects an out-of-schema trimmed signer
  before recording or downloading a receipt. Correcting a field clears the
  field-level recovery message.
- **QD-011 — keyboard reliability:** `#main` is recognized as the skip-link
  anchor rather than an application route. The app no longer rerenders or
  steals focus after a keyboard user activates Skip to main content.
- The destructive-action color token was raised to `#FF9B8F`, restoring
  WCAG AA text contrast on the data screen.

## Regression coverage

- Unit coverage rejects an unsafe cent value and a 501-character reviewer
  through `validateQuote`.
- Browser coverage bypasses the HTML limits to prove an unsafe amount and an
  overlong reviewer never reach IndexedDB, then reloads the remaining valid
  quote successfully.
- The client lifecycle test bypasses `maxlength` to prove a 501-character
  signer cannot create a receipt, then records a valid decision.
- The full keyboard workflow activates the skip link before creating and
  reviewing a quote.

## Verification run on 2026-08-30 UTC

```text
npm ci                              PASS — 61 packages, 0 vulnerabilities
npm test                            PASS — 10/10
npm run typecheck                   PASS
npm run lint                        PASS
npm run build                       PASS — dist/ emitted
npm run test:e2e                    PASS — 19 passed, 5 intentional skips
```

The final complete Playwright run used the pinned 1.58.2 Chromium and covered
desktop plus Pixel 5 / 390 px. It includes the quote lifecycle, keyboard and
skip link, Axe serious/critical scans, privacy request assertions, legal
screens, offline reload, service-worker update, responsive targets, storage
recovery, receipt import, and the new validation regressions. Browser
assertions found no unexpected failures.

Exact production build output:

```text
Initial JS   45.19 kB raw / 14.30 kB gzip
CSS          21.73 kB raw / 5.76 kB gzip
Mobile hero  25.96 kB
```

The deployment-policy unit test confirms manifest MIME, immutable hashed
assets, CSP, and Permissions-Policy. No product backend or third-party
runtime service is used; state remains in browser IndexedDB.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

## Deployment and known gaps

The static deployment artifact remains `dist/` with `index.html` at its root.
Push `main` to deploy through the factory static configuration. No known
product gaps remain from the verifier report; post-push live identity and
response-policy checks are the final handoff step.
