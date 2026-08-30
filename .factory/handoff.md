# Quote Decision repair handoff

## Result

This repair addresses every finding in independent verification 3 for candidate
`96daeab61e7831fcd0a0027ef9a2cb083956a188` (`.factory/verification-3.md`).
It keeps the original local-first PWA, quote workflow, billing integration,
and static deployment class.

## Repairs

- **QD-012 — claims gate:** added `.factory/claims.json` with 11 visitor
  claims. Each maps to exactly one tagged Playwright test run from the seeded
  demo entry point.
- **QD-013 — demo and first read:** `/demo` and `?demo=1` now seed Cedar &
  Kite and Harrow & Vale quotes in `demo:quote-decision-log`, never the normal
  `quote-decision-log` database. The persistent banner offers Reset demo and
  Start for real. The landing screen now names tiny agencies, the review/send/
  client-decision job, and the sample-data action in plain language. Added
  `.factory/demo.md` and `.factory/copy-audit.md`.
- **QD-014 — keyboard:** a cold first Tab lands on the skip link. Internal
  path navigation moves focus to the new page heading; the skip link still
  moves focus to main.
- **QD-015 — touch targets:** data, legal, contact, header, and footer links
  are at least 44 px at the 390 px mobile viewport.
- **QD-016 — license state:** an invalid verification rerenders the licensing
  panel before showing the inactive notice, so it no longer says Unlimited is
  active.
- **QD-017 — routing/discovery:** the app now uses `/new`, `/data`,
  `/quote/:id`, `/edit/:id`, and `/demo` paths with route titles and canonicals.
  It keeps legacy hashes and private client fragments compatible. Added Open
  Graph/Twitter/apple metadata, original 1200×630 social art, sitemap, robots
  entry, standard legal skeletons, and a designed `404.html` wired through the
  Static Web Apps response override.
- **QD-018 — service-worker resilience:** blocked service-worker registration
  now fails safely without a page error.

## Regression coverage

- `tests/app.spec.ts` covers natural Tab order, mobile targets, invalid-license
  rerendering, real route metadata/404, blocked workers, and each repaired
  workflow regression.
- `tests/claims.spec.ts` covers sample isolation, same-origin normal flow,
  JSON/CSV export, SHA-256 fingerprint, named review, client fragment,
  decision receipt, exact $19 option, five-quote free limit, and offline demo
  reload. It creates its own browser context for offline verification.
- `src/deployment.test.ts` verifies demo/deep-link rewrites and the 404 override.

## Local verification — 2026-08-30 UTC

```text
npm ci                              PASS — 61 packages, 0 vulnerabilities
npm test                            PASS — 10 tests
npm run typecheck                   PASS
npm run lint                        PASS
npm run build                       PASS — dist/ emitted
npm run test:e2e                    PASS — 39 passed, 15 expected project skips
```

The complete Playwright run used the pinned 1.58.2 Chromium at desktop and
390 px mobile. Its Playwright Axe integration found zero serious/critical
issues on the empty state, form, data screen, seeded demo, legal pages, and
mobile client decision screen. The worker `verify-url.sh` passed locally with
no console/page errors, one h1, one main, `lang=en`, and no missing image alt
or unlabeled button.

`@axe-core/cli` was also attempted. Its bundled ChromeDriver supports Chrome
152 while the provided Playwright Chromium is 145, so it could not start; the
project's pinned Playwright Axe integration is the supported alternative and
passed in the actual test browser.

Local Lighthouse mobile-style run: performance **99**, accessibility **100**,
best practices **100**, SEO **100**; FCP **1.2 s**, LCP **1.6 s**, CLS **0**,
and total transfer **78 KiB**. Final build sizes: JavaScript **51.45 kB raw /
16.16 kB gzip**, CSS **23.04 kB raw / 5.99 kB gzip**, mobile hero **25.96 kB**.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

## Deployment and live verification

The repair commit will be pushed to `main` and deployed using
`/opt/fleet/lib/deploy-static.sh quote-decision-log dist`. This section will be
updated with the resulting commit, live URL, headers, identity comparison, and
post-deploy browser evidence.

## Known product gaps

None from verification 3. The only tooling limitation is the local Axe CLI
ChromeDriver mismatch described above; the pinned Playwright Axe checks pass.
