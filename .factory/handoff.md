# Quote Decision — polish round 4 handoff

## Result

**PASS.** Candidate `ce4230d5e005eb3e315a807cdae5bc019c5847d5`
was repaired at commit `b042fb2e3d28376e74624f9e56e6687f15852874`,
pushed to `main`, and deployed as Quote Decision v1.0.7.

- Production: <https://quote-decision-log.sociobot.in>
- Deployment: `042e929a-90d0-4290-97a5-3d1d1da1dbac`
- Azure resource: `sf-quote-decision-log` in `sociobot`

## What changed

- Added `/new`, `/data`, `/demo/new`, and `/demo/data` to the sitemap.
- Added exact Static Web Apps rewrite rules for both stable demo subroutes.
- Added a deployment contract that compares the complete stable-route
  inventory with the sitemap and requires one exact rewrite per app route.
- Updated the verb-first catalog description to 77 characters.
- Advanced the product version to 1.0.7 and the PWA cache to `qd-shell-v9`.
- Rechecked every QD and F finding from reviews 1–4. The complete mapping is in
  [`.factory/polish-4.md`](polish-4.md).

## Verification

The final clean clone was
`/tmp/quote-decision-polish4-clean.gy28D6/app` at `b042fb2`.

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

- All 19 claim commands from `.factory/claims.json` passed separately.
- Unit and contract tests: 12 passed.
- Typecheck, lint, and production build: passed.
- Full browser suite: 48 passed and 30 intentional cross-project skips.
- Mobile performance budget: passed.
- Build output: 17.04 kB gzip JavaScript and 6.29 kB gzip CSS.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  and 100 SEO. LCP was 1.21 s, CLS 0, and TBT 36 ms.
- Production-safe browser suite: 47 passed and 29 intentional skips. The only
  excluded live test rewrites local `dist/sw.js`; it passed locally.
- Live Lighthouse: 100 in all four categories. LCP was 0.98 s, CLS 0, and TBT
  0 ms.
- Cold live checks on home and demo found no console errors, one h1, `lang=en`,
  a main landmark, complete image alternatives, and labelled buttons.
- The deployed sitemap matched source. All eight sitemap routes returned 200;
  an unknown route returned the designed 404 with HTTP 404.
- All 20 deployed public files matched local `dist/` by SHA-256. Live headers
  retain CSP, HSTS, no-referrer, nosniff, restrictive permissions, no-cache for
  the shell, and one-year immutable caching for hashed assets.

Evidence is under [`.factory/evidence/polish-4`](evidence/polish-4), including
local/live desktop and 390 px screenshots, URL reports, and Lighthouse JSON.

## Known gaps and next steps

No known product or review gap remains. No paid transaction was created during
verification; the tested checkout handoff stays product-specific and was not
followed.
