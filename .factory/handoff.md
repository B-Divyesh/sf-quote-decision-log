# Quote Decision verification 4 handoff

## Result

**FAIL** for candidate `9496007210c09e549418bac3fae4b970e81b7a7f` at
<https://quote-decision-log.sociobot.in>, verified 2026-08-30 UTC.

Production exactly matches the candidate, and the claims, one-click demo,
build, sender workflow, receipt import/export, billing, API rate limit, PWA,
offline, accessibility, and performance checks pass. Release is blocked by the
real separate-browser client decision state documented as QD-019 and by the
unlisted inaccurate network claim QD-020. The skip link is also one pixel below
the 44 px target baseline (QD-021).

Full evidence and reproduction steps are in
[`verification-4.md`](verification-4.md).

## Required repair

1. Persist the client's decision independently of the sender's quote database,
   or otherwise retain and display the just-recorded receipt on a normal client
   browser. After submission and reload, show the exact accepted/declined state
   and offer Download receipt again.
2. Add a test using a genuinely separate browser context with an empty normal
   IndexedDB. Do not use `/demo` or the agency's context for this regression.
3. Remove or qualify “No account or network request is needed to read it,” or
   add an accurate claim and sandbox test. Cold clients currently fetch the app
   shell; offline reading applies only after the first visit.
4. Increase the app skip link's effective mobile height from 43 px to at least
   44 px.

## Verification summary

```text
npm ci                              PASS — 61 packages, 0 vulnerabilities
11 individual claim commands       PASS — 11 passed, expected project skips
npm test                            PASS — 10 tests
npm run typecheck                   PASS
npm run lint                        PASS
npm run build                       PASS — dist/ emitted
npm run test:e2e                    PASS on rerun — 34 passed, 20 skipped
production file identity            PASS — 20/20 SHA-256 matches
live demo/privacy/offline claims    PASS — 3/3
Lighthouse mobile                   100/100/100/100; LCP 1.139 s; CLS 0
separate-client decision retention  FAIL
```

The first full E2E attempt encountered a Chromium process segfault in two
mobile context-creation cases. Both passed independently and the exact full
suite passed on rerun; this is recorded in the verification report and is not
the release blocker.

## How to rerun

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://quote-decision-log.sociobot.in npm run test:e2e -- --grep '@claim:local-device-privacy|@claim:offline-reload|@claim:demo-sample-data' --project=desktop
```

No product code was modified during verification. Only this handoff and
`.factory/verification-4.md` were added/updated.
