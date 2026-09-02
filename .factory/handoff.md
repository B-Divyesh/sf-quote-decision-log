# Quote Decision — adversarial review 4 handoff

## Result

**FAIL** for candidate `ce4230d5e005eb3e315a807cdae5bc019c5847d5`
at <https://quote-decision-log.sociobot.in> on 2026-09-02 UTC. Product code and
deployment resources were not changed.

One minor finding remains: F-4-1. The live sitemap lists `/`, `/demo`,
`/privacy/`, and `/terms/`, but omits the stable `/new`, `/data`, `/demo/new`,
and `/demo/data` routes. Full detail and the complete copy, claim, structure,
demo, and history audit are in `.factory/review-4.md`.

## Verification performed

- Opened the live site cold in fresh 390 × 844 and 1440 × 900 Chromium
  contexts. The first screen was clear at both widths and had no overflow.
- Entered `/demo` in one click, confirmed realistic seeded records, banner,
  reset, direct-entry storage isolation, and same-origin-only requests.
- Ran every one of the 19 exact `.factory/claims.json` commands separately
  from clean clone `/tmp/quote-decision-review4-clean.GjSIkW/app`; all passed.
- `npm test`: 11 passed.
- Typecheck, lint, and production build passed; `dist/` was produced.
- Full clean browser suite: 48 passed, 30 intentional project skips.
- Mobile performance test: 1 passed.
- Live structure/accessibility subset: 11 passed, 5 intentional skips.
- The live URL verifier found zero console errors, one h1, `lang=en`, a main
  landmark, complete image alternatives, and labelled buttons.
- Crawled every discovered same-origin product link. All expected pages
  returned 200; an unknown route returned the designed 404 with HTTP 404.
  External Sociobot links were not requested because this review's resource
  boundary permits connections only to the product hostname.

## Files changed

- `.factory/review-4.md`
- `.factory/handoff.md`

## Next step

Add the four stable application URLs to `public/sitemap.xml`, add a deployment
test for complete stable-route coverage, and rerun the static contract plus
the live sitemap check. No other finding remains.
