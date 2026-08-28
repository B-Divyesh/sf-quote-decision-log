# Independent product verification (continuation) — FAIL

Verified on 2026-08-28 UTC.

- Candidate: `8972f8af4ac359220981b050c13b98aed58bd425`
- Production: <https://quote-decision-log.sociobot.in>
- Contract: researched brief, builder work order, and supplied PWA,
  accessibility, privacy, performance, and paid-unlock requirements
- Result: **FAIL**

This second report continues the interrupted verification recorded in
`.factory/verification.md`. Repository state was checked first, all clean-checkout
gates were rerun, deployment identity was reconfirmed, and release-blocking
production checks were repeated. Product code was not changed.

Production is byte-for-byte the candidate and the useful free workflow largely
works. Acceptance still fails: the advertised paid checkout is unavailable,
imported decisions can omit required consent evidence while changing the
recorded answer, and an insufficiently validated backup can make the quote log
unusable.

## Clean checkout and gates

The exact candidate was checked out detached at `/tmp/qd-verify2.tDPQn7` using
Node 22.23.2 and npm 10.9.8.

| Check | Result | Evidence |
| --- | --- | --- |
| Checkout | PASS | Detached full candidate hash; final status clean. |
| `npm ci` | PASS | 59 packages installed; 0 vulnerabilities. |
| `npm test` | PASS | Vitest 3.2.7: 1 file, 5/5 tests. |
| `npm run build` | PASS | Exact `tsc -b && vite build`; Vite 6.4.3 emitted `dist/`. |
| `npm run test:e2e` | PASS | Playwright 1.58.2: 7 passed, 1 intentional duplicate desktop offline case skipped. |
| Lint | N/A | No lint script/configuration; strict TypeScript runs in the build. |

An initial invocation used the report checkout rather than the detached
worktree and could not find local binaries. This verifier path error was
corrected; only the clean detached-worktree results above are classified.

This is an application/PWA, not a library, CLI, or backend, so consumer-package,
server concurrency, API persistence, and server health/build checks do not
apply.

## Deployment identity and live smoke

All 16 files in the fresh `dist/` were fetched at their production paths and
SHA-256 compared: **16 compared, 0 mismatches**. This includes HTML, hashed
JS/CSS, images, icons, source map, manifest, service worker, offline page,
robots, privacy, and terms.

`/opt/fleet/lib/verify-url.sh` returned HTTPS 200 and a 900 ms network-idle
load. Its browser report found no console/page errors and confirmed the title,
`lang=en`, one `h1`, `main`, no missing image alt text, and no unnamed buttons.

## End-to-end behavior

Fresh production-browser exercise confirmed the following normal flow:

1. Create and persist a quote with client/project data, multiline scope,
   optional terms, expiry, and a zero-value boundary amount.
2. Require all three internal checks and a reviewer name of at least two
   characters before preparing the client link.
3. Generate the exact reviewed-version URL and mark it sent.
4. Open it in an isolated 390 px context, verify the fingerprint, require a
   name and consent, decline, and download a receipt.
5. Reject a receipt with a different fingerprint.
6. Import a matching receipt and display it after reload.

The earlier completed portion additionally exercised a nonzero EUR quote,
editing after review (new version/fingerprint and cleared approval), editing
after decision (retired receipt history), JSON/CSV export, delete cancellation
and confirmation, invalid JSON recovery, expiry, refresh persistence, and the
five-quote limit. Per the work order, finished checks were not needlessly
repeated.

Invalid/boundary evidence:

- Invalid email and negative amount stayed on the form; native validity was
  false. Zero was accepted as the documented minimum.
- A one-character reviewer and incomplete checklist stayed on review.
- Wrong-fingerprint feedback was “The receipt fingerprint does not match the
  saved quote version.”
- Whitespace-only client/project/scope still created a normal quote route with
  blank-looking `h1` and “Prepared for” output (QD-005).
- A backup with `currentVersion: 1` and `versions: []` reported “1 quote
  imported.” The log then raised `Cannot read properties of undefined (reading
  'snapshot')` (QD-003).
- Earlier completed checks confirmed a past-expiry quote is readable but has no
  decision form, the sixth quote is gated at `5/5`, and export/delete remain
  available at the free limit.

## Decision-record evidence

A genuine receipt contained `decision: "declined"`, signer `Ada Client`, and
`consentText`. A second import retained the valid quote/version fingerprint but
removed `consentText`, changed the answer to `accepted`, and changed the signer
to `Edited Import`. Production accepted it:

```text
Client decision imported: accepted.
```

After reload it displayed “Accepted by Edited Import,” reproducing QD-002. The
open send screen remained at “Marked as sent” until reload, reproducing QD-004.

## PWA/offline

| Check | Result | Evidence |
| --- | --- | --- |
| Manifest/installability | PASS | Chromium installability errors: none. |
| SW control | PASS | Reload controlled; `qd-shell-v2` and `qd-assets-v2` present. |
| Offline reload | PASS | 390 px offline navigation served the app, banner, and empty-state action with no errors. |
| Update lifecycle | PASS | Earlier isolated check observed waiting worker/update toast, accepted “Update now,” changed controller, removed old caches, and reloaded cleanly. |
| Persistence | PASS | IndexedDB quote state survived reload; export remained available. |

## Accessibility and responsive/visual QA

- Axe 4.10.2 found **0 serious/critical** issues on the fresh desktop empty
  state and 390 px client page. Earlier completed scans covered quote form,
  detail, review, data/license, expired client, privacy, and terms with the same
  result.
- First keyboard focus was visible with a 3 px solid brass outline; the control
  measured about 275×46 px. Earlier keyboard-only exercise completed the core
  agency flow without a trap.
- The 390×844 client page had zero horizontal overflow. Desktop/mobile
  screenshots were visually inspected and remained legible without clipping.
  Privacy and Terms links measured only 47×15 px and 38×15 px (QD-006).
- Reduced motion produced `scroll-behavior: auto`; the only observed entrance
  animation was 0.01 ms with one iteration.
- Lighthouse accessibility was 100 in all runs.

## Privacy, requests, and response policies

- Anonymous production load made only same-origin requests and stored no
  cookies. No analytics, tracking, remote font, or third-party script loaded.
- Client quote data remained in `#client/...`; no request contained a fragment.
- Billing is contacted only for purchase/explicit verification; free first
  paint does not depend on it.
- Privacy and terms pages disclose local storage, portable links, billing
  verification, export, and deletion.
- Root/assets support Brotli. HSTS, strict-origin-when-cross-origin referrer
  policy, and `nosniff` are present.
- CSP and Permissions-Policy are absent; the manifest MIME is
  `application/octet-stream` (QD-008).

## Performance, caching, and bundles

Fresh Lighthouse 12.8.2 mobile reports:

| Run | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 0.91 s | 1.13 s | 0 | 75 ms | 46.8 KB |
| 2 | 99 | 100 | 100 | 100 | 0.92 s | 1.30 s | 0 | 93 ms | 74.4 KB |
| 3 | 99 | 100 | 100 | 100 | 0.93 s | 1.31 s | 0 | 135 ms | 74.4 KB |

Lighthouse emitted a Chromium tab-crash warning after each report, but all
three JSON reports were complete and parseable. The earlier clean series was
92/100/99 performance, 100 for the other categories, and LCP 1.20–1.28 s,
consistent with the fresh results.

Build sizes: JS 37,851 bytes raw / 12.24 KB gzip; CSS 21,328 bytes raw / 5.66
KB gzip; fonts 0; mobile poster 25,958 bytes; desktop poster 47,998 bytes. All
stated budgets pass. INP is a field metric; TBT is the lab responsiveness proxy.
Hashed JS/CSS still use only `public, must-revalidate, max-age=30` (QD-007).

## Defects

### High

#### QD-001 — Production checkout unavailable

Fresh request:

```text
GET https://api.sociobot.in/api/v1/products/quote-decision-log/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

The UI advertises “Buy unlimited — $19,” but it cannot be purchased. This is a
live billing-registration failure, not stale deployment: all artifacts match.

#### QD-002 — Imported decisions do not require consent evidence

A matching-version receipt without `consentText` and with changed answer/signer
was accepted and displayed, contrary to explicit consent and the audit-trail
job.

#### QD-003 — Invalid backup can make the log unusable

An empty versions array imports successfully, then the normal log raises an
uncaught snapshot error. Recovery requires manually visiting `#data` to remove
or replace data and is not explained in the failing path.

### Medium

- **QD-004:** Imported decision remains visually “waiting” until reload.
- **QD-005:** Whitespace-only required fields create a blank commercial record.
- **QD-006:** Mobile legal links are only 15 px high, below the 44 px baseline.

### Low

- **QD-007:** Hashed assets lack long-lived immutable caching.
- **QD-008:** CSP/Permissions-Policy are absent and manifest MIME is generic.

## Final decision

**FAIL.** Do not promote
`8972f8af4ac359220981b050c13b98aed58bd425`. Resolve QD-001 through QD-003 and
reverify; address QD-004 through QD-008 for full contract compliance.
