# Independent product verification 2 — FAIL

Verified 2026-08-28 UTC.

- Candidate: `d217cf47f83b48ef105c674142e96ab12400013b`
- Branch: `main` (`origin/main` matched at the start of verification)
- Production: <https://quote-decision-log.sociobot.in>
- Contract: `.factory/brief.json`, `AGENTS.md`, the supplied work order, and
  the PWA/offline, accessibility, performance, privacy, and paid-unlock
  requirements
- Result: **FAIL**

The deployment is current and most normal workflows pass. The repaired
checkout, receipt integrity, backup validation, mobile targets, headers, and
caching were all confirmed from fresh evidence. Release remains blocked because
the UI accepts values that violate its own stored-record schema, writes them to
IndexedDB, and can then make the complete local quote log unreadable. The client
decision form can also produce a receipt that the sender cannot import. In
addition, the exact full E2E gate did not complete successfully in three
attempts.

## Clean checkout and repository gates

Testing ran in a detached worktree at the exact candidate:
`/tmp/quote-decision-verify.uQmgYDyf`. Node was 22.23.2 and npm was
10.9.8. The worktree was clean before installation.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 61 packages installed; 0 vulnerabilities. |
| `npm test` | PASS | Vitest 3.2.7: 2 files, 9/9 tests passed. |
| `npm run typecheck` | PASS | `tsc -b` completed without diagnostics. |
| `npm run lint` | PASS | Repository lint alias (`tsc -b`) completed without diagnostics. |
| `npm run build` | PASS | Exact production command `tsc -b && vite build`; `dist/` emitted. |
| `npm run test:e2e` | **FAIL / flaky** | Three full runs: (1) 16 passed, 5 skipped, then Chromium SIGSEGV before the final mobile case; (2) and (3) each had 16 passed, 5 skipped, and the desktop keyboard case failed to activate the focused create link. |

The mobile case affected by the Chromium crash passed in isolation. The
keyboard case passed 10/10 isolated repeats, but failed in two consecutive full
runs. The trace shows the skip link changed the route to `#main`; the SPA
rerender/focus callback returned focus to `<main>` after the create link was
focused, so the following Enter key did not navigate. This is recorded as
QD-011 rather than hidden as a green gate.

No package/consumer test applies: this is a browser PWA, not a library or CLI.

## Deployment identity

Production matches the candidate build. All 16 public build files were fetched
from their production paths and compared with `dist/`; `diff -qr` reported no
mismatch. `staticwebapp.config.json` was correctly excluded because it is host
configuration, not a public asset.

Representative SHA-256 matches:

```text
index.html                    874d38930d4b3cdf39638f27d23bdcc215b060faf11f0cf3559d1bb069b1ebcd
assets/index-CcnmNfJC.js      da847471ab06e1ce6795aa211eb91a3de451fb63f55fa305d72fe00941564ff7
sw.js                         f037cf1e1fe5faefd6f6c02bd4906fa3aa1cb36119dee9984b77250db734b980
manifest.webmanifest          04854a11f23935fe8996f3789303700f6a5e85c7c662ffdb69f94db6c04ff178
```

`verify-url.sh` returned HTTPS 200 and a 791 ms network-idle load with no
console/page errors, a non-empty title, `lang=en`, exactly one `h1`, a main
landmark, no missing image alternatives, and no unnamed buttons.

## End-to-end product evidence

Fresh local and production runs covered the following:

- Created quotes with ordinary and Unicode-capable fields, a zero-value quote,
  and an expired quote. Invalid email and negative amount stayed on the form;
  correcting them to `hello@example.com` and `0` saved `$0.00` successfully.
- Required all three review checks and a named reviewer, created a client link,
  marked the quote sent, recorded both the client consent and signed-name
  evidence, downloaded a schema-2 receipt, and imported a valid receipt.
- Confirmed that edited/missing consent and structurally corrupt backups are
  rejected without replacing valid records, and that the explicit corrupt-data
  recovery screen works for pre-existing damage.
- Edited an accepted version: version advanced from 1 to 2, the SHA-256
  fingerprint changed, send-ready cleared to “Needs review,” and the accepted
  version-1 receipt remained under “Earlier receipts.”
- Confirmed a quote expiring 2026-08-27 remained readable on 2026-08-28 but had
  no decision form.
- Created five quotes, observed `FREE EDITION · 5/5` on the sixth attempt, and
  confirmed JSON export and delete controls remained enabled.
- Confirmed malformed/altered receipts, whitespace-only required quote fields,
  and invalid backup structures provide recovery text. Delete cancellation and
  confirmed delete are covered by the existing workflow suite.
- Live suite excluding the intentionally local-only service-worker mutation
  test: 16 passed and 4 intentional viewport skips on desktop and mobile.

The normal paths are sound, but the out-of-range cases in QD-009 and QD-010
contradict the otherwise strict stored-data validators.

## PWA, persistence, and offline behavior

| Check | Result | Evidence |
| --- | --- | --- |
| Manifest | PASS | `Page.getAppManifest` parsed without errors; standalone display, versioned start URL, 192/512/maskable icons, and matching theme/background colors. |
| Installability | PASS | Chromium `Page.getInstallabilityErrors` returned an empty array. |
| Service-worker control | PASS | Production page was controlled after first load. |
| Offline reload | PASS | A saved “Cached proposal” quote survived reload with the context offline; the quote remained visible and the offline banner appeared, with no page errors. |
| Update lifecycle | PASS | Local E2E changed the worker cache version, observed “A fresh version is ready,” activated it via “Update now,” removed the old cache, and reloaded. |
| Local ownership | PASS | IndexedDB persists quote data; JSON/CSV export, JSON import, and confirmed delete are exposed without a license. |

The manifest is served as `application/manifest+json`. Root/index and `sw.js`
use `Cache-Control: no-cache`; hashed `/assets/*` use
`public, max-age=31536000, immutable`.

## Accessibility and responsive checks

- Axe reported zero serious/critical findings on the empty state, create form,
  data/license, privacy, terms, quote lifecycle, and 390 px client screen.
- Five Lighthouse runs scored accessibility 100, best practices 100, and SEO
  100 each.
- At 390 px, `scrollWidth` equaled `clientWidth` (390 px). Mobile client legal
  targets passed the 44×44 px assertions.
- Keyboard workflow and skip-link behavior passed 10/10 in isolation; focus had
  a visible 3 px brass outline. The full-suite focus race is QD-011.
- With `prefers-reduced-motion: reduce`, animations reported 0.01 ms and one
  iteration, and document scrolling was `auto`.
- Desktop and 390×844 screenshots were inspected. Content was legible, the
  task hierarchy remained clear, and no clipped task content was observed.
- Browser and page error collections were empty during live smoke, lifecycle,
  reduced-motion, and offline checks.

## Privacy, outbound traffic, and response policy

- Anonymous app and client flows issued same-origin requests only, set no app
  cookies, and loaded no analytics, trackers, remote fonts, or runtime CDNs.
- Quote contents remained after `#client/` and did not appear in observed HTTP
  request URLs.
- License restore contacts only the documented Sociobot API. With production
  Origin, invalid verification returned HTTP 200,
  `{valid:false, reason:"invalid", expires_at:null}`, `Cache-Control: no-store`,
  and `Access-Control-Allow-Origin: https://quote-decision-log.sociobot.in`.
- Checkout returned HTTP 303 to `checkout.dodopayments.com`; following the
  redirect reached HTTP 200. The public catalog lists “Quote Decision
  Unlimited” for USD 19.00.
- The static host sends HSTS, `Referrer-Policy: no-referrer`, nosniff, CSP with
  restrictive defaults/connect sources, and a Permissions-Policy disabling
  camera, geolocation, microphone, payment, and USB.
- Privacy and terms accurately explain local storage, fragment links, billing
  verification, export/delete, and the non-regulated-signature limitation.

No sign-in exists or is required, so the Entra External ID authority check is
not applicable. This static PWA has no product-owned backend, concurrency, or
server persistence boundary to test.

### Required API rate-limit check

A rapid sequential burst against the production license verification endpoint
started returning HTTP 429 on burst request **31**. The response included both
`Retry-After: 3` and `X-RateLimit-After: 3`. A few exploratory verification
requests preceded the burst in the same time window, so 31 is the observed
burst threshold, not a claim about the service's globally configured quota.

## Performance and budgets

Exact production build:

| Asset | Raw | Gzip / budget |
| --- | ---: | ---: |
| Initial JS | 44,502 B | 14.10 KB / 200 KB |
| CSS | 21,734 B | 5.75 KB / 50 KB |
| Mobile hero | 25,958 B | budget 300 KB |
| Desktop hero | 47,998 B | n/a |
| Fonts | 0 B | budget 120 KB |

Five fresh Lighthouse 12.8.2 mobile runs:

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 93 | 100 | 100 | 100 | 1.060 s | 1.172 s | 0 | 310 ms | 47,816 B |
| 2 | 84 | 100 | 100 | 100 | 0.909 s | 1.171 s | 0 | 661 ms | 47,759 B |
| 3 | 98 | 100 | 100 | 100 | 1.058 s | 1.159 s | 0 | 162 ms | 47,750 B |
| 4 | 95 | 100 | 100 | 100 | 0.954 s | 1.179 s | 0 | 248 ms | 47,780 B |
| 5 | 99 | 100 | 100 | 100 | 1.052 s | 1.146 s | 0 | 127 ms | 47,750 B |

Median performance was 95, LCP 1.171 s, CLS 0, and transfer 47,759 B. Four of
five performance runs met 90; one TBT outlier produced 84. A first attempt with
the full Chromium executable crashed its tab, while the pinned Playwright
headless shell completed all five measurements. INP is a field metric and was
not available from these lab runs.

## Defects

### High — QD-009: accepted quote/review values can poison the local log

The input forms do not enforce the same bounds as `validateQuote`. Examples:

- `clientName`, quote number, project, scope, terms, and reviewer have no HTML
  maximum matching their stored-schema maximum;
- total amount has no safe upper bound, while stored cents must be a safe
  integer.

Fresh production reproduction:

1. Create a quote with total amount `90071992547409.92`.
2. Submit the otherwise valid form.
3. The app reports “Stored quote 1, version 1 has invalid or missing quote
   details,” but inspection shows `9007199254740992` was already persisted in
   IndexedDB.
4. Reload `#home`.

Actual result: `Local storage is unavailable`. The user must replace the whole
store from a prior valid backup or delete all local quotes. A 501-character
client name causes the same write-before-validation failure. A 501-character
reviewer caused an uncaught page error (“Stored quote 1 has an invalid internal
review record”) and the same unavailable state after reload.

This is release-blocking for a local-first audit product because user-entered
data accepted by its own form can make unrelated existing records inaccessible.
Validate and normalize the complete candidate record before `quoteStore.put`,
and mirror schema bounds with `maxlength`/an explicit safe amount maximum.

### Medium — QD-010: client form exports a receipt the sender rejects

The client name input has `minlength=2` but no maximum even though receipt
validation permits at most 500 characters.

Fresh production reproduction used a normal reviewed/sent quote and an isolated
client context. A 501-character signer name passed the client form and produced
a schema-2 download. Importing that file in the sender context returned:

```text
That receipt is missing valid decision or explicit-consent evidence.
```

The quote remained “Marked as sent.” The client was told the decision was
recorded, with no explanation that the file was invalid. Enforce the receipt
schema limit before recording/downloading and provide field-level recovery.

### Medium — QD-011: the exact full E2E gate is not reliable

Two consecutive full `npm run test:e2e` runs failed the desktop keyboard case
after the first three desktop tests. Trace evidence shows the skip link changed
the SPA hash to `#main`; the router treated it as an unknown route, rerendered
the dashboard, and a delayed focus callback returned focus to `<main>` after
the create link was focused. Enter therefore did nothing. The same case passed
10/10 in isolation, so this is timing-dependent, but the repository's required
full gate is not green.

The first full run instead reached the final mobile case before Chromium itself
segfaulted; that case passed immediately in isolation. Avoid routing `#main`
through the SPA rerender path and make the keyboard test assert focus before
activation. A clean full-suite pass is required after repair.

## Final decision

**FAIL.** Production is deployed correctly and earlier QD-001 through QD-008
repairs are confirmed, but QD-009 is a release-blocking local-data integrity
defect. QD-010 breaks a boundary client-decision return path, and QD-011 means
the exact repository E2E gate is not reliably green.
