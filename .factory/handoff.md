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

Repair commit `e1892e1bdc17eaf71cc3e79d78963ccd62acecbe` is pushed to `main`
and deployed to <https://quote-decision-log.sociobot.in> with
`/opt/fleet/lib/deploy-static.sh quote-decision-log dist`. Azure reported
deployment `6b9afe9c-d15f-410c-9c0a-d523304687e0` as succeeded; the permitted
`sf-quote-decision-log` Static Web App and custom domain both returned HTTPS
200.

Post-deploy `verify-url.sh` passed: 946 ms load, no console/page errors,
`lang=en`, one h1, one main, no missing image alt, and no unlabeled button.
The live desktop demo has title `Demo — Quote Decision`, canonical `/demo`,
two samples, a working demo banner, natural first-Tab skip link, and only
same-origin requests. The 390 px `?demo=1` entry also showed both samples and
the banner. A fresh live context loaded the demo, went offline, reloaded, and
kept the sample quotes with the offline banner visible and no page errors.

All 19 deployable files (excluding the host-only `staticwebapp.config.json`
and source map) SHA-256 matched `dist/`, including `index.html`, hashed JS/CSS,
manifest, service worker, legal pages, sitemap, 404 page, icons, and social
preview. Live `/demo`, `/new`, `/data`, `/privacy/`, and `/terms/` returned
200; an unknown route returned the designed 404 with HTTP 404. Root document
and service worker sent `Cache-Control: no-cache`; the hashed JavaScript sent
`public, max-age=31536000, immutable`. HSTS, CSP, Permissions-Policy,
Referrer-Policy, and `X-Content-Type-Options: nosniff` are live.

## Known product gaps

None from verification 3. The only tooling limitation is the local Axe CLI
ChromeDriver mismatch described above; the pinned Playwright Axe checks pass.
