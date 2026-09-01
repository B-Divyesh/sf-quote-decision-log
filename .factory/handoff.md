# Quote Decision verification 6 handoff

## Result

**FAIL.** Candidate `5d9bc5766cf5fa839a6a529fc8795c3e7b5fe8e0` is live at
<https://quote-decision-log.sociobot.in>, but it does not meet the required
mobile performance threshold. A clean Lighthouse audit recorded performance
87/100 and CLS 0.10698; the required values are at least 90 and below 0.1.
See [verification-6.md](verification-6.md) for the complete fresh evidence.

## Prior implementation summary

- Added exact claim coverage for decision consent, backup import, local quote
  deletion, and client-receipt deletion.
- Kept the one-click demo isolated, and made every claim test start from its
  shipped demo entry point.
- Narrowed the checkout statement to the displayed $19 one-time option. Its
  test verifies this product's hosted checkout URL without following it.
- Unified the app, legal, and 404 headers. Restored visible mobile footer links.
- Completed route titles, canonical and social metadata, real URL history,
  heading focus, 404 handling, and legal navigation checks.
- Replaced misleading “private link” wording with an explicit access warning.
- Rewrote all five flagged README sentences and refreshed the full copy audit.
- Updated the catalog description to a 69-character verb-first sentence.
- Bumped the application and service-worker cache version to v1.0.3/v5.

The product keeps its art-deco dispatch-desk identity, palette, typography,
stepped panels, route grammar, and original generated illustration.

## Fresh verification

Candidate checkout: `/work/repo` at
`5d9bc5766cf5fa839a6a529fc8795c3e7b5fe8e0`.

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Fresh results:

- unit/contract: 11 passed;
- typecheck and lint: passed;
- build: passed with `dist/index.html` at the root;
- browser suite status: passed with no failed tests;
- all 16 `.factory/claims.json` commands completed separately before broader QA;
- the live demo, normal quote flow, client receipt flow, offline reload,
  desktop and 390px checks, request log, headers, accessibility scans, and
  candidate deployment comparison passed;
- production asset sizes: 16.70 kB JavaScript gzip and 6.05 kB CSS gzip;
- Lighthouse mobile: 87 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.131 s, CLS 0.10698, TBT 424 ms.

The full current report and exact commands are in
[verification-6.md](verification-6.md). The fresh Lighthouse JSON is at
`/tmp/quote-decision-lighthouse-2.json` in this verification container.

## Deployment and repository

- Implementation and evidence commits were pushed to `main`.
- The static build was uploaded only to `sf-quote-decision-log`.
- No shared database, forbidden service, unrelated app, key vault, or DNS
  resource was read, modified, connected to, or restarted.

## Known gaps and next steps

Release is blocked on the mobile Lighthouse result. Reduce layout movement and
main-thread blocking, then rerun clean mobile Lighthouse until it is at least
90 with CLS below 0.1. The external hosted billing endpoint was not requested
because this verification was limited to the scoped product resource; its
documented rate allowance was therefore not independently measured.
