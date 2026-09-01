# Quote Decision repair 5 handoff

## Result

**PASS.** The release-blocking mobile performance finding in independent report
commit `4be77366f525a64e5cac1420e1b5a0d0af9c0662` is repaired. Version 1.0.4 is
deployed at <https://quote-decision-log.sociobot.in> from implementation commit
`fb31f97`. The researched brief, local-first behavior, demo sandbox, quote
workflow, and art-deco dispatch-desk visual system are preserved.

Work order: `quote-decision-log-repair-5`

Candidate repaired: `5d9bc5766cf5fa839a6a529fc8795c3e7b5fe8e0`

Verification date: 2026-09-01 UTC

## Finding reproduced and root cause

Before changing product code, Lighthouse 12.8.2 audited a fresh mobile `/demo`
load. It reproduced the verifier's exact CLS:

- performance: 97 locally; the verifier's independent contention run was 87;
- CLS: `0.1069808763540318` in both runs;
- Lighthouse attributed the complete shift to the page footer;
- the footer moved from `y=644.98` to below the viewport after the quote list's
  deferred layout completed.

The quote register used `content-visibility: auto` without an intrinsic-size
reservation. On the mobile demo, Chromium first laid out the footer while the
register contents were skipped. It then rendered the nearby two-row register
and moved the footer by about 424 px. This also forced a second style/layout
pass and made main-thread timing sensitive to host contention.

Raw and summarized reproduction evidence is in
`.factory/evidence/repair-5/pre-fix/`.

## Repair and regression coverage

- Removed deferred rendering from the quote register so its final height is
  present in the first layout.
- Added `tests/performance.spec.ts`, run by `npm run test:performance` and by
  the full browser suite.
- The regression uses a fresh service-worker-free context at 390×844 and 4×
  CPU slowdown. It asserts fresh-load CLS below 0.05 and long-task blocking
  work at or below 200 ms.
- The measured local regression result was CLS `0` and 99 ms blocking work.
- Bumped the app to v1.0.4, install start URL to `/?v=4`, and service-worker
  caches to `qd-shell-v6` / `qd-assets-v6`. The update-lifecycle regression was
  updated and passed.

Three final local Lighthouse runs all reported:

| Run | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 1.205 s | 0 | 0 ms |
| 2 | 100 | 100 | 100 | 100 | 1.353 s | 0 | 0 ms |
| 3 | 100 | 100 | 100 | 100 | 1.355 s | 0 | 0 ms |

The exact reports and the independent Playwright budget measurement are in
`.factory/evidence/repair-5/post-fix/`.

## Complete local verification

The final v1.0.4 tree passed:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

- clean install: 61 packages installed, 62 audited, 0 vulnerabilities;
- unit/contract: 11/11 passed;
- typecheck and lint command: passed;
- production build: passed with `dist/index.html` at its root;
- initial JavaScript: 53.82 kB raw / 16.70 kB gzip;
- CSS: 23.37 kB raw / 6.03 kB gzip;
- full browser suite: 41 passed, 27 intentional cross-project skips;
- dedicated performance gate: 1 passed;
- every one of the 16 exact `.factory/claims.json` commands was also invoked
  separately and passed from its required demo entry point.

The browser suite covers the complete quote/review/send/client-decision flow,
receipt integrity and consent, backup recovery, demo isolation, exports,
deletion, invalid input, desktop and 390 px mobile layouts, keyboard use,
focus, 44 px targets, reduced motion, route history, and same-origin request
privacy. Playwright axe found zero serious or critical findings on the landing,
demo, create, data, client, expired-client, privacy, and terms states.

The local `verify-url.sh` run loaded in 529 ms with no console/page errors. It
confirmed `lang=en`, one `h1`, a main landmark, alt text, and button names.
Desktop and mobile screenshots are in `.factory/evidence/repair-5/local/`.
Offline reload and the service-worker update lifecycle both passed.

## Deployment and live verification

Deployment used the work order's static configuration:

```sh
/opt/fleet/lib/deploy-static.sh quote-decision-log /work/repo/dist
```

It reused only `sf-quote-decision-log` in resource group `sociobot`, uploaded
deployment `be45a33a-11c2-4847-871f-7807fb43902a`, and confirmed the scoped
custom domain ready over HTTPS. No other product resource, shared database,
staging slot, app setting, or secret was accessed.

Live verification results:

- all 20 public build files matched local `dist/` byte-for-byte by SHA-256;
- `/`, `/demo`, `/privacy/`, `/terms/`, manifest, service worker, JS, and CSS
  returned 200; an unknown route returned the designed 404 with HTTP 404;
- root HTML and `sw.js` use `Cache-Control: no-cache`; hashed JS/CSS use
  `public, max-age=31536000, immutable`;
- the manifest MIME is `application/manifest+json`;
- CSP, Permissions-Policy, Referrer-Policy, `nosniff`, and HSTS are present;
- `verify-url.sh` loaded `/demo` in 778 ms with no console/page errors and all
  semantic smoke checks passing;
- live desktop and mobile end-to-end quote flows both passed;
- live axe checks: 3 passed, 1 intentional duplicate skipped, with zero
  serious/critical findings;
- live demo, same-origin privacy, and offline-reload claim checks passed;
- the live 390 px / 4× CPU performance regression passed.

Fresh production Lighthouse 12.8.2 mobile results:

| Run | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 1.132 s | 0 | 0 ms |
| 2 | 100 | 100 | 100 | 100 | 1.128 s | 0 | 37 ms |
| 3 | 100 | 100 | 100 | 100 | 1.131 s | 0 | 0 ms |

Live reports, screenshots, HTML, and smoke output are in
`.factory/evidence/repair-5/live/`.

## Known gaps

No release-blocking product gaps remain. The external Sociobot billing service
was not contacted because the work order forbids reading or connecting to
resources outside this product's scope. The tested product contract is the
displayed $19 hosted-checkout link; no quote or demo workflow depends on that
external request.
