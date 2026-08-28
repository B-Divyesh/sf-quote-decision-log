# Independent product verification — FAIL

Verified on 2026-08-28 UTC.

- Candidate: `8972f8af4ac359220981b050c13b98aed58bd425`
- Branch/base: `main` at the candidate commit
- Production URL: <https://quote-decision-log.sociobot.in>
- Acceptance contract: `.factory/brief.json`, the supplied factory work order,
  and the PWA, accessibility, performance, privacy, and paid-unlock requirements
- Result: **FAIL**

The deployed product is the candidate and the core free workflow is substantially
implemented, but the release does not meet the contract. The live paid checkout
is unavailable, imported decision records do not require the promised consent
evidence, and a structurally invalid backup can leave the main quote log
unusable. These are release-blocking findings.

## Clean checkout and repository gates

All repository gates were run in a detached clean worktree at the exact candidate
commit (`/tmp/qd-verify.F903BQ`), using Node 22.23.2 and npm 10.9.8.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 59 packages installed; npm reported 0 vulnerabilities. |
| `npm test` | PASS | Vitest 3.2.7: 1 file, 5/5 tests passed. |
| Type check / exact build: `npm run build` | PASS | `tsc -b && vite build`; Vite 6.4.3 completed and emitted `dist/`. |
| `npm run test:e2e` | PASS | Playwright 1.58.2: 7 passed, 1 intentional desktop duplicate skipped. Desktop and Pixel 5 projects ran. |
| Lint | N/A | The repository has no lint script or separate lint configuration. Strict TypeScript checks run in the build. |
| Dependency versions | PASS | Playwright 1.58.2, axe Playwright 4.10.2, TypeScript 5.9.3, Vite 6.4.3, Vitest 3.2.7. |

One earlier run from the non-clean main workspace timed out waiting for service
worker control. It was not reproduced in the required clean worktree, the live
offline test, or the isolated update test, so it is not classified as a product
defect.

## Deployment identity

Production matches the candidate. I downloaded every one of the 16 files in the
clean `dist/` at its corresponding production path and compared SHA-256 digests:
16 compared, 0 mismatches. This includes the HTML, hashed JS and CSS, both hero
images, icons, source map, manifest, service worker, offline fallback, robots,
privacy, and terms files.

Representative exact matches:

- `index.html`: `755108c300e661ca…`
- JS `index-BMuvYD3G.js`: `40840c5e6f121fb7…`
- CSS `index-D5MF_Uhn.css`: `9c456f41096ea670…`
- `sw.js`: `06a4725aa8e96203…`
- `manifest.webmanifest`: `04854a11f23935fe…`

The root and all tested pages returned HTTPS 200. `/opt/fleet/lib/verify-url.sh`
reported a 949 ms network-idle load, no console/page errors, a title, `lang=en`,
one `h1`, a main landmark, no missing image alt text, and no unlabeled buttons.

## End-to-end product evidence

Independent browser checks ran against production, not mocked application code.

### Normal workflow — PASS with one stale-view defect

- Created and persisted a representative EUR quote with Unicode client data,
  multiline scope, terms, email, expiry, and cents.
- Required all three checklist items and a two-or-more-character reviewer name.
- Recorded send-ready, reviewer, version, and SHA-256 quote fingerprint.
- Editing the approved amount created version 2, changed the fingerprint, and
  cleared the review and send state as required.
- Created a client URL whose quote payload exists only after `#client/`; none of
  the three client-page HTTP requests contained the URL fragment.
- Marked the reviewed version sent.
- Opened the link in an isolated 390 px client context, verified the quote
  fingerprint, required the consent checkbox, recorded a decline with typed
  name and timestamp, and downloaded a JSON receipt.
- Imported the receipt in the agency context. The data persisted and appeared
  after reload, but did not appear immediately; see QD-004.
- Editing after a decision retained the earlier receipt in retired-version
  history. JSON backup and CSV export included the quote/version/decision data.
- Refresh persistence, invalid-fingerprint rejection, invalid-JSON feedback,
  delete cancellation, confirmed delete-all, and return to the empty state all
  worked.

### Keyboard, boundaries, and recovery

- A separate keyboard-only path used focus plus Enter/Space/typing to create,
  review, mark send-ready, prepare the link, and mark sent. There was no keyboard
  trap. Primary controls and the skip link had a visible 3 px focus outline.
- Initial SPA focus moved to `main`; the skip link could be focused and used.
- Empty required values, invalid email, negative amount, incomplete review, and
  a one-character reviewer were rejected. A zero-value quote was accepted.
- Whitespace-only required text was accepted; see QD-005.
- A quote expiring on 2026-08-27 was readable on 2026-08-28 but correctly showed
  expired and provided no decision form.
- Five quotes filled the free allowance; the sixth route displayed `5/5` and
  the paywall. Export and deletion remained available at the limit.
- A receipt with the right quote/version but a different fingerprint was
  rejected. A receipt with the right fingerprint but missing consent evidence
  and edited decision fields was accepted; see QD-002.
- An invalid JSON backup produced recoverable feedback. A schema-envelope-valid
  backup containing a quote with an empty `versions` array was accepted and then
  raised `Cannot read properties of undefined (reading 'snapshot')`; see QD-003.
- An invalid production license was rejected with clear feedback.

## PWA and offline behavior

| Check | Result | Evidence |
| --- | --- | --- |
| Manifest parse | PASS | Chromium reported no manifest parsing errors. |
| Installability | PASS | Chromium `Page.getInstallabilityErrors`: empty list. |
| Service worker control | PASS | A reload was controlled by the production service worker. |
| Offline reload | PASS | With the context offline, reload served the app shell and displayed the offline banner. |
| Offline errors | PASS | No page errors in the offline smoke test. |
| Update lifecycle | PASS | An isolated server changed the SW cache version; the existing page showed “A fresh version is ready,” had a waiting worker, accepted “Update now,” changed controllers, removed old caches, and reloaded without errors. |
| Local persistence | PASS | Quote state survived reload; data remained in IndexedDB and exports were available offline-first. |

The service worker uses versioned shell/asset caches and network-first navigation
with cached app fallback. The host caching policy is still below the contract;
see QD-007.

## Accessibility and responsive behavior

- Axe scans found 0 serious/critical violations on the desktop empty state,
  quote form, quote detail, review screen, data/license screen (rechecked after
  entrance motion settled), 390 px client page, expired-client state, privacy,
  and terms pages.
- Lighthouse accessibility was 100 on all three production runs.
- Semantic smoke checks passed: title, language, single `h1`, `main`, labels,
  alt text, and button names.
- Keyboard-only workflow, visible focus, native validation, required consent,
  and destructive confirmation passed.
- At 390 px the client page had no horizontal overflow. Form controls and their
  effective label targets met 44 px, but the client footer legal links did not;
  see QD-006.
- `prefers-reduced-motion: reduce` produced a 0.01 ms (`1e-05s`) animation and
  `scroll-behavior: auto`; nothing looped.
- Desktop and 390 px screenshots were visually inspected. The custom
  transit-poster hierarchy remained legible and the mobile layout stacked as
  designed; no clipped task content was observed.

## Privacy, requests, and browser policies

- Anonymous production load made only same-origin requests and set no cookies.
- Client quote details remained in the URL fragment and were absent from all
  observed HTTP requests.
- No third-party fonts, scripts, analytics, or trackers loaded.
- License verification contacted the documented Sociobot API only after an
  explicit restore action. Production invalid-token verification returned HTTP
  200 with `{ "valid": false, "reason": "invalid" }` and appropriate CORS.
- Privacy and terms pages accurately disclose IndexedDB/localStorage, client
  link sharing, billing verification, export, and deletion.
- Root/assets use Brotli when requested. Present response policies include HSTS
  (`max-age=10886400; includeSubDomains; preload`),
  `Referrer-Policy: strict-origin-when-cross-origin`, and
  `X-Content-Type-Options: nosniff`.
- CSP and Permissions-Policy are absent; see QD-008.

## Performance and budgets

Production Lighthouse 12.8.2 mobile runs:

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 92 | 100 | 100 | 100 | 0.99 s | 1.24 s | 0 | 345 ms |
| 2 | 100 | 100 | 100 | 100 | 0.90 s | 1.20 s | 0 | 50 ms |
| 3 | 99 | 100 | 100 | 100 | 0.90 s | 1.28 s | 0 | 103 ms |

The three-run median is performance 99, LCP 1.24 s, CLS 0, and TBT 103 ms.
Observed transfer was 46.9–74.4 KB. The exact build emitted:

- Initial JS: 37,851 bytes raw / 12.24 KB gzip (budget: 200 KB)
- CSS: 21,328 bytes raw / 5.66 KB gzip (budget: 50 KB)
- Fonts: 0 bytes (system stacks)
- Mobile hero: 25,958 bytes (budget: 300 KB)
- Desktop hero: 47,998 bytes

All size and Lighthouse score budgets pass. INP is a field metric and was not
available for a new deployment; TBT is reported as the lab responsiveness proxy.

## Defects

### High

#### QD-001 — Production checkout is unavailable

`GET https://api.sociobot.in/api/v1/products/quote-decision-log/checkout`
returns HTTP 404 with:

```json
{"error":"enabled factory product","status":404}
```

The UI advertises “Buy unlimited — $19” and the five-quote boundary links to
this endpoint, so a user cannot purchase the advertised one-time unlock. This
confirms the earlier deployment/configuration gap from fresh production
evidence; it is not a candidate/deployment mismatch.

#### QD-002 — Imported decisions do not require consent evidence

Starting with a genuine declined receipt, I removed `consentText`, changed the
decision to `accepted`, and changed the signer name while retaining the valid
quote/version fingerprint. Import accepted the file and replaced the displayed
genuine decision with “Accepted by Edited Import.”

The fingerprint proves which quote version was referenced, but validation does
not require the explicit-consent record and does not provide decision-record
integrity. This contradicts the brief’s explicit-consent requirement and the
product’s decision-audit purpose. The UI’s non-regulated-signature disclaimer
does not remove the need to reject a receipt that lacks its required consent
field.

#### QD-003 — Structurally invalid backup is persisted and makes the log unusable

An import with the documented top-level schema/product and one quote containing
`currentVersion: 1` but `versions: []` was reported imported. Returning to the
quote log raised:

```text
Cannot read properties of undefined (reading 'snapshot')
```

The normal dashboard did not render. Validation checks only the bundle envelope,
not quote/version fields. Recovery requires opening `#data` directly and
deleting data or replacing the record, which is not communicated in the error
path.

### Medium

#### QD-004 — Valid receipt import remains visually “waiting” until reload

Importing a valid client receipt from the send screen persists the decision and
shows a success toast, but assigns the already-current quote hash. No hash-change
event occurs, so “Marked as sent / waiting” remains visible. Reloading displays
the decision. This creates an ambiguous completion state in the core return
flow.

#### QD-005 — Whitespace-only required quote fields are accepted

Client name, project, and scope containing only spaces pass required-field
validation and create a visually blank commercial record. The fields should be
trimmed and checked before save, with field-level recovery guidance.

#### QD-006 — Client footer legal links miss the 44 px mobile target requirement

At a 390 px viewport, effective targets measured approximately 47×15 px for
Privacy and 38×15 px for Terms. Other client form controls met the target after
counting their clickable labels.

### Low

#### QD-007 — Hashed assets are not cached immutably

The HTML, service worker, images, and hashed JS/CSS all return
`Cache-Control: public, must-revalidate, max-age=30`. Hashed build assets should
use long-lived immutable caching; HTML/service-worker revalidation can remain
short. Correctness and measured load budgets currently pass.

#### QD-008 — Response-policy hardening and manifest MIME are incomplete

Production does not send Content-Security-Policy or Permissions-Policy. The
manifest is served as `application/octet-stream` rather than
`application/manifest+json`. Chromium still parsed the manifest and reported
zero installability errors, so this is hardening/interoperability rather than a
current functional failure.

## Final decision

**FAIL.** Do not promote this candidate as complete. Resolve QD-001 through
QD-003 and rerun verification. QD-004 through QD-008 should also be addressed
to satisfy the stated usability, touch-target, caching, and response-policy
contract.
