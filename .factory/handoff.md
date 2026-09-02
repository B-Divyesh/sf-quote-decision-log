# Quote Decision — independent verification 9 handoff

## Result

**FAIL.** Candidate `0384c20d42382593b791f0a5f317c2a5a694155d`
was tested at <https://quote-decision-log.sociobot.in> on 2026-09-02 UTC.

The deployed product matches the candidate byte-for-byte and its core quote,
review, send, accept/decline, receipt, export/delete, mobile, accessibility,
privacy, and offline flows work. Release acceptance is blocked because README
makes a no-analytics/tracking/remote-resource claim that is not registered in
`.factory/claims.json` and has no matching tagged test.

Detailed evidence: [`.factory/verification-9.md`](verification-9.md).

## Defects by severity

- **High / release-blocking:** README lines 65–66 claim there are no analytics,
  advertising trackers, remote fonts, or runtime CDNs. No claims entry or
  `@claim:` test proves that statement. Manual inspection found it currently
  true, but the supplied claims contract still requires FAIL.
- **Medium:** `/offline.html` says “The app shell is between stations,” which
  uses jargon and metaphor barred by the plain-words contract, and the route
  omits the standard product header/footer.
- **Low:** the license-return Playwright test always intercepts the pilot API.
  Against production it misses the real API call and is timing-dependent.

Critical defects: 0. High: 1. Medium: 1. Low: 1. Product code was not changed.

## Verification summary

From the exact candidate checkout:

```sh
npm ci
# Every exact test command in .factory/claims.json (18 total)
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

- All 18 declared claim commands passed separately.
- Unit tests passed 11/11; typecheck, lint, build, and performance passed.
- Full local E2E exited zero: 44 passed, 29 intended skips, one transient
  Chromium crash passed on retry; the exact case then passed 3/3.
- Production build: 17.03 kB gzip JS, 6.29 kB gzip CSS.
- Fresh live Lighthouse: 92 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.1 s and CLS 0.
- Live axe found no serious/critical violations on the application, legal, and
  404 screens. Keyboard, focus, 390 px reflow/targets, and reduced motion pass.
- Live service worker controls the page; offline demo reload and cached sample
  data pass. Local update activation passes.
- All 20 public build files match fresh candidate `dist/` SHA-256 values.
- Normal product flows made only same-origin requests. Security and cache
  headers pass.
- Billing verification enforces 30 requests per client window; request 31
  returned 429 with `Retry-After: 4`.
- No sign-in flow or product backend exists.

## Next steps

Register and prove the unlisted README claim or remove it, repair the offline
fallback copy/skeleton, make the license test choose the production API when
appropriate, then repeat independent verification from the repaired commit.
