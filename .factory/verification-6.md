# Independent verification 6 — FAIL

## Scope and verdict

- Candidate commit: `5d9bc5766cf5fa839a6a529fc8795c3e7b5fe8e0`
- Live URL: <https://quote-decision-log.sociobot.in>
- Date: 2026-09-01
- Result: **FAIL**

The release is not accepted because the completed mobile Lighthouse run reports
performance **87/100** (required: at least 90) and cumulative layout shift
**0.10698** (required: below 0.1). This is a release-blocking performance
finding. No product code was changed during verification.

## Required claim checks

After `npm ci` in this checkout, I invoked every exact command listed in
`.factory/claims.json` separately, using the declared demo entry point:

`demo-sample-data`, `local-device-privacy`, `json-export`, `csv-export`,
`quote-fingerprint`, `review-checkpoint`, `client-link`, `decision-receipt`,
`decision-consent-record`, `client-decision-retention`, `backup-import`,
`delete-local-quotes`, `delete-client-receipt`, `unlimited-price`,
`free-five-quotes`, and `offline-reload`.

Each command completed. The full browser suite then recorded `passed` with no
failed tests, independently covering all of those tagged checks.

## Cold first read

Fresh desktop load of the live root page returned HTTP 200 with no console or
page errors. Its first screen says, “Review quotes before you send them,” says
it is for “tiny agencies,” and presents “Try it with sample data” first. The
adjacent instruction says it opens two sample quotes and saves no data. This
meets the plain-language, one-click demo requirement.

## Local quality checks

| Check | Result | Evidence |
| --- | --- | --- |
| Install | PASS | `npm ci` completed; 62 packages audited with 0 vulnerabilities reported. |
| Unit/contract tests | PASS | `npm test`: 11 tests in 2 files passed. |
| Type check | PASS | `npm run typecheck` completed. |
| Lint command | PASS | `npm run lint` completed (`tsc -b`). |
| Exact production build | PASS | `npm run build` completed and emitted `dist/`. |
| Full browser suite | PASS | `npm run test:e2e` scheduled 66 tests; `test-results/.last-run.json` records `status: passed` and no failed tests. |

The exact production build emitted 53.82 kB raw / 16.70 kB gzip initial
JavaScript and 23.40 kB raw / 6.05 kB gzip CSS, within the declared static
bundle budgets.

## Product workflow and recovery checks

On the live deployment, in fresh browser contexts, I confirmed:

- “Try it with sample data” opens `/demo`, shows the persistent demo banner,
  and shows the Cedar & Kite and Harrow & Vale sample quotes. A direct fresh
  `/demo` visit created only `demo:quote-decision-log` in IndexedDB.
- An empty create form reports “Enter a client name, not only spaces.”
  Completing the required fields saved a normal quote.
- A named reviewer completed all three review checks, producing Send-ready.
- The generated client link carries its reviewed payload in a URL fragment.
- In a separate 390px client context, the quote showed “Fingerprint verified.”
  Recording an accepted decision produced a schema-2 Quote Decision JSON
  receipt with the typed client name and exact consent text. Reloading retained
  that client receipt.
- The owner flow recorded 11 requests and the client flow recorded 6; every
  observed request was same-origin, GET-only where applicable, with no request
  body. Both flows had zero console and page errors.

## Accessibility, responsive, PWA, and route checks

- Axe scans of `/`, `/demo`, `/new`, `/data`, `/privacy/`, and `/terms/` at
  desktop and 390px mobile found zero serious or critical findings. Each scan
  had exactly one `h1` and one `main` landmark.
- Keyboard use: Tab reaches a 44px-high skip link with a visible 3px focus
  outline; Enter moves focus to `main`; keyboard navigation to Create a quote
  moves focus to the route heading.
- Reduced-motion emulation matched `prefers-reduced-motion: reduce`; main
  animation and button transition durations both computed to `0.00001s`.
- The live manifest parsed without errors: standalone display, `/?v=3` start
  URL, matching theme/background colors, and 192px, 512px, and maskable icons.
- After first load, a 390px demo context had a controlling service worker and
  `qd-shell-v5` cache. With network disabled, `/demo#home` reloaded with the
  offline banner and both sample quotes. The full local browser suite also
  passed its service-worker update lifecycle test.
- All 10 same-origin links discovered from the primary routes returned HTTP
  200. A made-up route returned HTTP 404 with the designed not-found page.

## Deployment, headers, privacy, and caching

The local `dist/index.html` and live root HTML had the same SHA-256:
`097ad8bd3604d1db4082437600bdce1803b7a5f45aa170f4d576438e6c423323`.
All 20 publicly served build files matched the candidate byte-for-byte. The
remaining build file, `staticwebapp.config.json`, is host configuration and
correctly returns 404 when requested publicly.

Live HTML and `sw.js` use `Cache-Control: no-cache`; hashed JS and CSS use
`public, max-age=31536000, immutable`. The responses include HTTPS transport,
content policy, referrer, content-type, and permissions headers. The content
policy permits only self-hosted page assets plus the declared billing origins.
The observed normal and demo flows made no off-origin request.

The product itself is static and has no product-owned server endpoint. The
optional hosted checkout and license-verification endpoint were not requested:
the work order restricts connections to the scoped `sf-quote-decision-log`
resource. Therefore, no independent rate-allowance result is available for
that external billing service; the release result above does not depend on it.

## Release-blocking finding

| Severity | Finding | Fresh evidence |
| --- | --- | --- |
| High | Mobile performance is below the required budget. | Clean Lighthouse 12.8.2 mobile audit of `/demo`, using the installed Chromium and no runtime error: performance 87/100, LCP 1.131 s, total blocking time 424 ms, max potential FID 246 ms, CLS 0.1069808763540318, 54,295 bytes total transfer. The performance requirement is ≥90 and CLS <0.1. |

The first Lighthouse attempt produced the same CLS and a 90 performance score,
but had a browser screenshot runtime error. The clean second run above is the
release evidence.

## Next step

Reduce layout movement and main-thread blocking enough to achieve CLS below
0.1 and a repeatable mobile Lighthouse score of at least 90, then rerun this
verification from a clean checkout.
