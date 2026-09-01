# Quote Decision — adversarial review 3 handoff

## Delivered

- Performed the required cold 390 px and desktop review of the live product.
- Audited every landing-page and README sentence, plus headings and actions.
- Exercised the one-click demo, reset, storage separation, same-origin request
  behavior, and exit/re-entry behavior.
- Ran all 17 registered claim commands separately from a clean clone.
- Rechecked every earlier review and polish finding against production and
  current source.
- Verified metadata, routes, back/focus behavior, same-origin links,
  accessibility, responsive layout, security headers, offline behavior, build
  output, and the visual identity.

The detailed result is [`.factory/review-3.md`](review-3.md). Product code and
deployment resources were not changed.

## Verdict and known gaps

**FAIL.** Five findings remain:

- blocking: demo edits persist after **Start for real** despite “nothing is
  saved”;
- blocking: “Capture scope, value, and expiry” has no claims entry;
- medium: the landing page omits the required Privacy and limits section;
- medium: the landing page omits the complete five-free/$19-unlimited tier;
- minor: “browser origin” is unexplained README jargon.

## Verification

Clean clone: `/tmp/quote-review-3-clean.LqzgMG/app`, commit
`382f44f33d5c775491ba6786dc9e190977cedfaa`.

```sh
npm ci
# Run every exact test command in .factory/claims.json (17 total)
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

All 17 registered commands passed separately. Unit tests passed 11/11;
typecheck, lint, build, the 70-execution browser suite, and mobile performance
passed. The browser suite reported 42 passes and 28 intended skips.

The live route/accessibility subset passed 7 checks with 5 intended skips.
The worker URL verifier reported no console errors and correct title, language,
landmarks, image alternatives, and button labels. Same-origin crawl targets
returned 200; the designed unknown route returned 404.

## Next steps

Implement the five concrete fixes in `review-3.md`, add the eighteenth tagged
claim test, redeploy only `sf-quote-decision-log`, and repeat the complete
adversarial review from a fresh browser and clean clone.
