# Quote Decision — polish round 5 handoff

## Result

**PASS.** Review 5's final finding is fixed in commit
`b267f8ed9c32f4943b608541a5315311935c6d39`, pushed to `main`, and deployed as
version 1.0.8 at <https://quote-decision-log.sociobot.in>. Every finding from
reviews 1–5 is mapped with final evidence in [`.factory/polish-5.md`](polish-5.md).

## What changed

- Rebalanced the desktop hero and reduced its vertical demand while preserving
  the art-deco dispatch identity.
- Added a 1440 × 768 browser regression that requires every first-screen fact
  to end within the viewport.
- Moved the compact rail and bottom-navigation breakpoints before their layouts
  can overflow at intermediate widths.
- Released version 1.0.8 with service-worker cache `qd-shell-v10`.
- Updated the catalog line to a 12-word, verb-first description.

## Verification

- Final clean clone: `/tmp/quote-decision-polish5-clean.DRQyzQ/app` at
  `b267f8e`.
- Every one of the 19 exact claim commands passed individually.
- `npm test`: 12 passed. Typecheck, lint, and `npm run build` passed.
- Clean `npm run test:e2e`: 49 passed, 31 intended skips.
- Dedicated mobile performance test: 1 passed.
- Production-safe live suite: 48 passed, 30 intended skips. The local-only
  service-worker mutation test was excluded from production.
- Local Lighthouse: 100/100/100/100; LCP 1.7 s, CLS 0, TBT 0 ms.
- Live Lighthouse: 100/100/100/100; LCP 1.3 s, CLS 0, TBT 0 ms.
- Build output: 17.04 kB gzip JavaScript and 6.27 kB gzip CSS.
- The live URL verifier found HTTPS 200, one h1, `lang=en`, one main landmark,
  complete alt text, labelled buttons, and no console errors.
- Cold live 1440 × 768 measurement: all three fact bottoms are 645.61 px.
- Cold live 390 × 844 measurement: the last fact ends at 636.38 px with no
  horizontal overflow.
- All 19 checked live deployment files match local `dist/` byte-for-byte.
- Stable routes returned 200; an unknown route returned the designed 404.
- Deployment ID: `0d5cea3c-20ed-42eb-aada-eb5929819844`.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

The demo is available at <https://quote-decision-log.sociobot.in/demo> and
<https://quote-decision-log.sociobot.in/?demo=1>.

## Known gaps

None in the reviewed product scope. No real purchase was made, and the hosted
checkout was not opened; its product-specific handoff is covered without a
charge by `@claim:unlimited-price`.
