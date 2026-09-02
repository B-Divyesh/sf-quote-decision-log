# Quote Decision — polish round 3 handoff

## Delivered

- **Start for real** now clears both demo quote and demo receipt databases
  before opening the normal quote log. A failed clear keeps the visitor in the
  demo and gives recovery guidance.
- The expanded `demo-sample-data` claim proves destructive demo exit, two-seed
  restoration, receipt cleanup, and preservation of a pre-existing real quote.
- Added the `quote-fields` claim and test for exact scope, value, and expiry
  after a route reload. The manifest now has 18 claims and one tag per claim.
- Added the required landing **Privacy and limits** and **Price** sections.
  The first screen and price section state five quotes free and $19 once for
  unlimited quotes. The checkout link remains product-specific.
- Replaced “browser origin” with “Each site address keeps its own browser
  data.” Removed the untested future-update promise from paid copy.
- Preserved the art-deco dispatch identity and fixed the mobile navigation and
  hero widths so the 390 px page has no horizontal overflow.
- Bumped the release to v1.0.5, the PWA shell cache to `qd-shell-v7`, and the
  install start URL to `?v=5`.
- Updated `.factory/catalog-description.txt`, `.factory/copy-audit.md`,
  `.factory/demo.md`, and `.factory/polish-3.md`.

## Verification

Implementation commit:
`0384c20d42382593b791f0a5f317c2a5a694155d`.

Clean clone: `/tmp/quote-decision-polish3-clean.ED7aBo/app`.

```sh
npm ci
# Every exact command in .factory/claims.json (18 total)
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

- All 18 claim commands passed separately.
- Unit and deployment contracts passed 11/11.
- The full browser suite passed 45 tests with 29 intended project skips.
- The dedicated mobile performance test passed.
- Production build output is 17.03 kB gzip JavaScript and 6.29 kB gzip CSS.
- Local Lighthouse scored 100/100/100/100 for performance, accessibility,
  best practices, and SEO. LCP was 1.6 s, CLS 0, and TBT 0 ms.
- Live Lighthouse scored 100/100/100/100. LCP was 1.1 s, CLS 0, and TBT 0 ms.
- Playwright axe scans found no serious or critical findings on home, form,
  data, demo, Privacy, Terms, or 404 screens.
- The worker URL check reported HTTPS 200, one h1, one main, `lang="en"`,
  complete image alternatives and button labels, and no console errors.
- A production-safe live suite passed 40 tests with 27 intended skips. One
  Chromium process crash passed on retry; its isolated rerun passed 2/2.
- Live `/`, `/demo`, `/new`, `/data`, `/privacy/`, `/terms/`, `/404.html`,
  `robots.txt`, and `sitemap.xml` returned 200. A made-up route returned the
  designed 404 with HTTP 404.
- Local and production HTML, hashed JavaScript, hashed CSS, and `sw.js` match
  byte-for-byte. Hashed assets have one-year immutable caching. Security
  headers, no-cache HTML/worker behavior, and `qd-shell-v7` were confirmed.

Evidence is under `.factory/evidence/polish-3/`. The finding-by-finding record
is `.factory/polish-3.md`.

## Deployment

Built with `npm run build` and deployed `./dist` through the factory static
deployment script to the existing `sf-quote-decision-log` resource. Deployment
ID: `0e864aba-6590-40bc-a0c9-3938296069f9`. The custom domain is
<https://quote-decision-log.sociobot.in>.

No unrelated resource, shared database, secret, staging slot, or external
billing page was read or changed.

## Known gaps and next steps

None in the reviewed product scope. All review-1, review-2, and review-3
findings are closed, and the production recheck found no remaining issue.
