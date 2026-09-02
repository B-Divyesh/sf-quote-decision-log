# Independent product verification 9 — FAIL

## Verdict

**FAIL.** Candidate `0384c20d42382593b791f0a5f317c2a5a694155d`
is deployed byte-for-byte at <https://quote-decision-log.sociobot.in> and its
core product paths work, but it does not meet the supplied claims contract.
The README makes a visitor-facing privacy claim that is absent from
`.factory/claims.json`. The contract makes an unlisted README claim
release-blocking even when an independent spot check finds the statement true.

- Work order: `quote-decision-log-verify-9`
- Date: 2026-09-02 UTC
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2 / Chromium 1208
- Artifact: local-first offline PWA
- Defects: critical 0, high 1, medium 1, low 1
- Product code changed by verifier: none

## Release-blocking finding

### HIGH — README privacy claim is not registered or proven by one claim test

README lines 65–66 state: “There are no analytics, advertising trackers,
remote fonts, or runtime CDNs.” No entry in `.factory/claims.json` states that
claim or names the README as its location.

The closest entry, `local-device-privacy`, says only that quote data stays on
the device. Its tagged test records a short demo flow and asserts that requests
are same-origin. That does not prove the separate claim: same-origin analytics
or tracking would still pass it. The supplied claims contract says an unlisted
claim on the landing page or in README fails review.

Independent browser logs and source inspection found no analytics, trackers,
remote fonts, or runtime CDN in this candidate. The defect is that shipped copy
is outside the mandatory claims registry and sandbox proof, not evidence that
the product currently transmits user data.

Required repair: either remove the sentence or add one claims entry and one
`@claim:<id>` test that records a complete representative demo flow and rejects
analytics/tracking requests, remote fonts, and runtime CDN resources.

## Other findings

### MEDIUM — Offline fallback breaks the plain-words and site skeleton rules

`public/offline.html` calls its state “OFFLINE SIGNAL” and says “The app shell
is between stations.” “App shell” is technical jargon and “between stations”
is the brand metaphor expressly disallowed by the plain-words contract. This
standalone route also omits the product's standard header and footer.

The normal service-worker-controlled offline reload is clear and works. This
finding applies to the shipped fallback document. Replace the heading with a
literal offline explanation and use the standard route skeleton.

### LOW — The license-return browser test is not production-origin aware

`tests/app.spec.ts:380` always intercepts
`pilot-api.sociobot.in`, while production correctly selects
`api.sociobot.in` in `src/license.ts:4`. The full live suite therefore sends
its fake token to the real verification endpoint. It exited zero only because
the optimistic state sometimes won the timing race and Playwright retried.

Fresh evidence:

- full live suite: 44 passed, 29 skipped, 1 flaky, exit 0;
- exact live test, three runs with retries disabled: 2 passed, 1 failed;
- the failure was the missing “Unlimited is active” heading after the real API
  correctly rejected `test-license-token`.

The real invalid-token flow was checked independently: the token was stored,
the query parameter was stripped, the production API returned 200 with an
invalid verdict, the paid state relocked, and the page showed “License no
longer active.” Make the route interception choose the same origin as the app.

## Mandatory first gates

### Claims file and exact claim commands — PASS

`.factory/claims.json` exists. After `npm ci`, all 18 exact command entries
were invoked separately from the candidate checkout and returned zero:

| Claim | Result |
| --- | --- |
| `demo-sample-data` | PASS |
| `quote-fields` | PASS |
| `local-device-privacy` | PASS |
| `json-export` | PASS |
| `csv-export` | PASS |
| `quote-fingerprint` | PASS |
| `review-checkpoint` | PASS |
| `client-link` | PASS |
| `decision-receipt` | PASS |
| `decision-consent-record` | PASS |
| `receipt-import` | PASS |
| `client-decision-retention` | PASS |
| `backup-import` | PASS |
| `delete-local-quotes` | PASS |
| `delete-client-receipt` | PASS |
| `unlimited-price` | PASS |
| `free-five-quotes` | PASS |
| `offline-reload` | PASS |

Each command ran the one matching desktop claim test and intentionally skipped
its non-applicable second browser project. The release blocker came from the
required landing/README cross-check after these declared commands passed.

### Cold first-read and one-click demo — PASS

Opened cold with service workers blocked, the live first screen answers:

- what it does: “Review quotes before you send them.”
- for whom: “For tiny agencies that need one checked quote and a clear client
  answer before work starts.”
- what to click: “Try it with sample data,” followed by “See two sample quotes;
  no data is saved.”

That one click opened `/demo`, immediately showed the Cedar & Kite and Harrow &
Vale quotes, and displayed the persistent demo banner with Reset demo and Start
for real. Start for real clears both demo databases while preserving normal
data, as asserted by the claim test.

## Clean-checkout quality gates

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 61 packages, 0 vulnerabilities |
| `npm test` | PASS — 11/11 unit tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/` produced |
| `npm run test:e2e` | PASS — exit 0; 44 passed, 29 intended skips, 1 Chromium-process flaky |
| exact flaky case repeated three times | PASS — 3/3 |
| `npm run test:performance` | PASS |

The local suite's flaky execution was a headless Chromium SIGSEGV while
creating a new context, not an application assertion. The exact case then
passed three consecutive runs.

Production output is within budget:

- JavaScript: 55,076 bytes raw / 17.03 kB gzip;
- CSS: 24,725 bytes raw / 6.29 kB gzip;
- mobile hero WebP: 25,958 bytes;
- largest hero WebP: 47,998 bytes.

## End-to-end product evidence

The shipped suites and independent live checks covered:

- create a quote; preserve scope, currency value, expiry, and exact version;
- require all three review checks and a named reviewer before send-ready;
- create a URL-fragment client link and mark the reviewed version sent;
- accept with exact consent and typed name, download a receipt, import it, and
  retain it in a separate client browser context;
- decline in a separate 390 px client context, download a schema-2 receipt with
  64-character quote and receipt digests, and import it into the agency log;
- show an expired quote's scope while removing the decision form;
- reject whitespace-only required values, unsafe large amounts, overlong
  names, malformed backups, and receipts missing explicit consent without
  damaging stored valid records;
- enforce the five-quote free boundary; export/import JSON, export CSV, delete
  normal data, delete client receipts, and keep demo/normal stores isolated.

The independent decline import initially used an immediate visibility probe
before the async import completed. A timed rerun passed and showed “Client
decision imported: declined.” No product failure was observed.

## Accessibility, responsive behavior, and performance

- Worker URL verifier: HTTPS 200, `lang=en`, title, one h1, main landmark,
  complete image alternatives and button names, and zero normal-route console
  or page errors.
- Live axe scans on `/`, `/demo`, `/new`, `/data`, `/privacy/`, `/terms/`, and
  the designed 404: zero serious or critical violations.
- 390 px demo: no horizontal overflow (`scrollWidth = clientWidth = 390`) and
  no visible interactive target below 44×44 px.
- Keyboard: skip link, form fields, checkboxes, save, and review checkpoint all
  operated with Tab/Enter/Space. First focus had a visible 3 px brass outline.
- Reduced motion: no checked element retained a transition or animation over
  0.01 seconds.
- A 32 px root-font check at a 640 px viewport had no horizontal overflow.
- Fresh mobile Lighthouse on live `/demo`: performance 92, accessibility 100,
  best practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, CLS 0, TBT 360 ms.

## PWA, privacy, headers, and deployment identity

- Live worker `/sw.js` controlled the page and populated `qd-shell-v7` with
  the shell, manifest, icons, hashed JS, and hashed CSS.
- After the browser was put offline, `/demo` reloaded with the offline banner,
  quote log, and Cedar & Kite sample visible. The local update-lifecycle test
  also passed its waiting-worker toast and activation flow.
- Normal landing/demo/client/data flows made only same-origin GET requests.
  No cookies, analytics, trackers, remote fonts, runtime CDNs, client names, or
  URL fragments were observed in requests. Billing was contacted only during
  the explicit license check.
- Root HTML and `sw.js` use `Cache-Control: no-cache`; hash-named assets use
  `public, max-age=31536000, immutable`.
- Responses include CSP with `frame-ancestors 'none'`, HSTS, no-referrer,
  `nosniff`, and restrictive camera/geolocation/microphone/payment/USB policy.
- All collected same-origin links returned 200; the unknown route returned the
  designed page with HTTP 404. The checkout link was verified but not followed.
- All 20 publicly served build files matched the candidate's fresh `dist/`
  byte-for-byte by SHA-256. `staticwebapp.config.json` is correctly consumed by
  the host rather than served.
- The product has no sign-in flow or product backend. The only server-side
  product call is Sociobot billing verification. Requests 1–30 from one client
  returned 200; request 31 returned 429 with `Retry-After: 4`.

## Release decision and next steps

Do not release this candidate as accepted. No functional quote-flow defect was
found, but the claims contract explicitly blocks it.

1. Register and test the README's no-analytics/tracking/remote-resource claim,
   or remove it.
2. Replace the offline fallback metaphor/jargon and use the standard skeleton.
3. Make billing verification interception production-origin aware.
4. Rerun all exact claim commands, the clean quality gates, and live QA from
   the repaired commit.
