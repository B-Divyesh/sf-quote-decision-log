# Quote Decision independent verification handoff

## Result: FAIL

Independent verification of candidate
`d217cf47f83b48ef105c674142e96ab12400013b` against
<https://quote-decision-log.sociobot.in> completed on 2026-08-28 UTC.

Production is byte-for-byte current and the intended normal workflow, repaired
receipt/backup checks, checkout, privacy policy, accessibility baseline,
offline reload, service-worker update, headers, caching, and bundle budgets all
pass. Release is blocked by newly identified input/storage integrity defects:

- **QD-009 (High):** out-of-schema quote or reviewer values are written before
  validation. An amount of `90071992547409.92`, a 501-character client name, or
  a 501-character reviewer can persist a record that makes the local quote log
  unavailable after reload. Recovery can require deleting all local quotes.
- **QD-010 (Medium):** a 501-character client signer name produces a receipt
  presented as recorded to the client but rejected by the sender on import.
- **QD-011 (Medium):** the exact full E2E command failed three times: one
  Chromium process crash and two repeatable full-suite keyboard failures caused
  by the `#main` skip-link hash rerender/focus race. The keyboard case passed
  10/10 in isolation, but the required complete gate is not green.

Full evidence is in [.factory/verification-2.md](verification-2.md).

## Verification summary

```text
npm ci                 PASS — 61 packages, 0 vulnerabilities
npm test               PASS — 9/9
npm run typecheck      PASS
npm run lint           PASS
npm run build          PASS — dist/ emitted
npm run test:e2e       FAIL — 16 passed, 5 skipped, 1 failed per full run
live suite (no SW edit) PASS — 16 passed, 4 intentional skips
keyboard isolated      PASS — 10/10 repeats
deployment identity    PASS — 16/16 public files exact
axe serious/critical   PASS — 0 findings on tested screens
PWA install/offline    PASS
API rate limit         PASS — first 429 at burst request 31; Retry-After: 3
```

Build output is 44,502 B JS, 21,734 B CSS, no fonts, and a 25,958 B mobile
hero. Five mobile Lighthouse runs scored performance 93/84/98/95/99 (median
95); accessibility, best practices, and SEO were 100 in every run. Median LCP
was 1.171 s and CLS was 0.

## Required repair and re-verification

1. Validate the complete quote/review record before any IndexedDB write. Match
   all persisted schema limits in the form and cap amount so cents remain a
   safe integer.
2. Enforce the 500-character client signer limit before receipt generation and
   show field-level recovery text.
3. Prevent `#main` skip-link navigation from rerendering the SPA/stealing focus,
   then obtain a clean full `npm run test:e2e` run.
4. Re-run the production boundary reproductions, exact build comparison,
   desktop/mobile axe, offline/update lifecycle, and API rate-limit check.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

No product code was modified during verification. Only this handoff and the
independent verification report were added/updated.
