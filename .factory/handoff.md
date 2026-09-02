# Quote Decision — review 6 handoff

## Result

Reviewer work only. No product code or deployment resource was changed.
`.factory/review-6.md` records **FAIL** with one minor finding: the
service-worker update regression still uses obsolete v10 cache labels while
the shipped worker uses v13.

## Verified

- Fresh live first read at 390 × 844 and 1440 × 768; the sample action and
  all three facts are above the fold.
- Demo isolation, reset, destructive demo exit, same-origin request behavior,
  offline reload, metadata, routing/history focus, and accessibility on live.
- Clean clone gates: `npm test` (12 passed), typecheck, lint, build, full
  Playwright suite, mobile performance suite, and all 19 individually run
  claim commands.

## Run

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

## Remaining work

Update the service-worker update test to mutate the current cache labels (or
derive them from the worker fixture), then assert the generated update cache
is activated and the previous current cache is retired. See `F-6-1` in
`.factory/review-6.md`.
