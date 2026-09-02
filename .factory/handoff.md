# Quote Decision — adversarial review 5 handoff

## Result

**FAIL.** Review 5 found one minor issue and no blocking issue: the three
required first-screen facts are below or clipped by the desktop viewport. The
full finding and evidence are in [`.factory/review-5.md`](review-5.md).

## What was verified

- All 19 declared claim commands passed individually from a clean clone of
  `a638e750b63a65c1e54fc0ed67bee3acac3f8e60`.
- `npm test` passed 12 tests. Typecheck, lint, build, the full browser suite
  (48 passed / 30 expected skips), and the isolated mobile performance test
  passed.
- The live demo reset/isolation, offline reload, route metadata, history focus,
  and axe subset passed. Fresh demo contexts used only the `demo:` database and
  same-origin GET requests.
- Live home, demo, legal, fallback, 404, and stable deep routes were checked at
  390 px and desktop. The deployed HTML, app assets, service worker, sitemap,
  legal pages, and fallbacks match the clean build.
- The URL verifier found HTTPS 200, one h1, `lang="en"`, a main landmark,
  complete image alternatives, labelled buttons, and no console errors.

## Known gaps / next steps

- Fix F-5-1 by fitting all three `.plain-facts` items above the fold at a 1440
  × 768 desktop viewport, then add a Playwright position assertion.
- Re-run review 5 from a fresh context after the layout change. No real
  purchase was made, and external services were not opened.
