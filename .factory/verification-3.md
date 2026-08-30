# Independent product verification 3 — FAIL

Verified 2026-08-30 UTC for work order `quote-decision-log-verify-3`.

- Candidate: `96daeab61e7831fcd0a0027ef9a2cb083956a188`
- Branch: `main`; `origin/main` matched the candidate before verification
- Production: <https://quote-decision-log.sociobot.in>
- Contract: researched brief, original builder work order, `AGENTS.md`, and
  the supplied claims, demo, plain-words, accessibility, PWA, privacy,
  performance, paid-unlock, design, and site-structure requirements
- Result: **FAIL**

The deployed files exactly match the candidate and the core quote workflow is
useful. Normal review, send, decision, receipt, export, delete, paid checkout,
rate limiting, and offline behavior work. Release is nevertheless blocked by
two explicit acceptance gates: `.factory/claims.json` does not exist, and the
product has no one-click sample-data demo. The cold first screen also does not
plainly identify tiny agencies as the intended user.

## Mandatory first checks

### Claims gate — FAIL

The first repository command checked `.factory/claims.json` before installing
dependencies or inspecting the product. It exited 2 with:

```text
BLOCKER: .factory/claims.json missing
```

There were therefore no claim commands to run through the required demo entry
point. This is release-blocking under the acceptance contract. It also leaves
visitor-facing claims unlisted and without claim-tagged sandbox tests,
including “Works offline,” “Private on this device,” JSON/CSV export, local
IndexedDB storage, immutable SHA-256 fingerprints, and the five-quote free
allowance.

### Cold first-read and demo gate — FAIL

Cold production load returned 200 and rendered:

- headline: “Every quote makes the right stops.”
- explanation: “Review the exact version before it leaves. Record the
  client’s answer when it returns. Keep the whole trail on your device.”
- first action: “Create your first quote”

What it appears to do is route a quote through review, sending, and a recorded
client answer. The target user is not stated in the first screen; “Built for
careful small teams” appears later and still does not name tiny agencies. The
headline is a transit metaphor rather than the job in the user’s words. The
first action requires manual entry.

There is no “Try it with sample data” action. Both `/?demo=1` and `/demo`
return the ordinary empty product with no sample records, demo banner, reset,
or separate storage namespace. `.factory/demo.md` is also absent. This alone
fails the mandatory first-read/demo acceptance rule. The required
`.factory/copy-audit.md` is absent as well.

## Clean-checkout gates

The supplied workspace was clean and exactly at the candidate before testing.
Node was 22.23.2 and npm was 10.9.8.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 61 packages installed; 0 vulnerabilities |
| `npm test` | PASS | Vitest: 2 files, 10/10 tests |
| `npm run typecheck` | PASS | `tsc -b`, no diagnostics |
| `npm run lint` | PASS | repository lint alias `tsc -b`, no diagnostics |
| `npm run build` | PASS | exact `tsc -b && vite build`; `dist/` emitted |
| `npm run test:e2e` | PASS | isolated run: 19 passed, 5 intentional skips in 1.2 minutes |

One browser run was discarded because the verifier accidentally started two
Playwright runners against one preview-server lifecycle; the second received
`ERR_CONNECTION_REFUSED`. No runner remained, and the classified isolated
rerun above passed.

The production build emitted 45.19 KB raw JS (14.30 KB gzip), 21.73 KB raw CSS
(5.76 KB gzip), a 25.96 KB mobile hero, and a 48.00 KB desktop hero. These are
inside the 200 KB JS, 50 KB CSS, and 300 KB mobile-hero budgets.

## Deployment identity and headers

Production matches the candidate. All 16 publicly served build files were
downloaded and SHA-256 compared with `dist/`; all 16 matched. The host-only
`staticwebapp.config.json` was correctly excluded from public-file comparison.
Representative matches:

- `index.html`: `57f0584039370563b9f5cb26b39c424560bd45168b735a96543ceffb4b391ae4`
- `assets/index-D7f_gC9W.js`:
  `82e79f96c80e48e40914cf47f18f00f3bf7b8528e885f2fcf4b7113bc4d9a828`
- `assets/index-Ca24nuYc.css`:
  `c2a396125481decdfecf53fb89b8526d532bfe4e463d39c522deb29de87af079`
- `sw.js`: `f037cf1e1fe5faefd6f6c02bd4906fa3aa1cb36119dee9984b77250db734b980`

Live response headers passed the security and cache checks:

- root and `index.html`: `Cache-Control: no-cache`
- hashed JS: `public, max-age=31536000, immutable`
- service worker: `no-cache`
- HSTS, CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  no-referrer`, and restrictive `Permissions-Policy` are present
- CSP limits default/script/font/worker sources to self and permits only the
  documented Sociobot API hosts in `connect-src`

## End-to-end product evidence

An independent production flow used separate fresh browser profiles for the
agency and client, rather than relying only on the repository tests.

1. Whitespace-only client, project, and scope values were rejected with
   field-specific recovery text; the route remained `#new`.
2. A representative Unicode quote for “Café North & Pine” was saved at the
   lower amount boundary of EUR 0.01 with scope, assumptions, and expiry.
3. Missing review checks were blocked by native validity. All three checks and
   reviewer “Mira Chen” produced the send-ready record.
4. The private link carried a 687-character URL fragment. No request contained
   the fragment or client name.
5. A separate 390 px client profile verified the fingerprint. Missing consent
   blocked submission. Explicit acceptance by “Ada Client” downloaded a
   schema-2 receipt with exact consent text and a 64-character receipt digest.
6. The agency profile imported that file, showed “Accepted by Ada Client,” and
   retained it after reload.
7. CSV contained one header and one quote row. JSON contained one schema-1
   quote with its accepted decision.

Across that flow, all 14 observed requests were same-origin, there were no
console or page errors, no cookies were required, and Axe found zero serious or
critical violations on the agency data screen and mobile client screen.

Other boundary and recovery evidence:

- the E2E suite rejects unsafe cent values, a 501-character reviewer, a
  501-character client signer, missing consent, structurally invalid backups,
  altered receipts, and unreadable stored records;
- five live quotes fill the free allowance; quote six shows `FREE EDITION ·
  5/5`, while export remains enabled;
- cancelling “Delete all quotes” preserves the quote, while confirming it
  restores the empty state;
- unit coverage confirms expiry after sending and preserves an explicit
  decision over expiry.

This is a PWA, not a library, CLI, or product backend. Consumer-package, CLI,
server concurrency, server persistence, health/build-identity, and sign-in
checks do not apply. The product does not require sign-in.

## Privacy, billing, and rate limiting

The ordinary quote and client flows contacted only
`https://quote-decision-log.sociobot.in`. Quote content stayed in IndexedDB or
the URL fragment. The only observed cross-origin app request was an explicit
license verification to the documented Sociobot billing API. Privacy and terms
describe IndexedDB/localStorage, fragment links, receipts, billing, and lack of
analytics.

The production checkout returned HTTP 303 to
`checkout.dodopayments.com`. An invalid verification token returned HTTP 200
with `{ "valid": false, "reason": "invalid" }`.

A fresh single-client burst against only this product’s verify endpoint
returned 200 for requests 1–30. Request 31 returned HTTP 429 with
`Retry-After: 3`, `X-RateLimit-After: 3`, and body `Too Many Requests! Wait for
3s`. The observed allowance is therefore 30 requests per burst before the
31st is limited.

## PWA and performance

Live Chromium installed and controlled the page with `qd-shell-v3`. The cache
contained the app shell, manifest, four icons, HTML, hashed JS, and hashed CSS.
After the context went offline, reload showed the app and the visible offline
banner. A quote created offline remained present after offline navigation and
reload. The isolated repository test also exercised a changed worker, displayed
“A fresh version is ready,” activated it, and removed the old cache.

Lighthouse 12.8.2 mobile results on production:

| Category/metric | Result |
| --- | --- |
| Performance | 95 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 0.9 s |
| LCP | 1.1 s |
| Speed Index | 1.0 s |
| Total blocking time | 270 ms |
| CLS | 0 |
| Total transfer | 47 KiB |

The manifest has a versioned start URL, standalone display, theme/background
colors, 192/512 icons, and a maskable icon. Reduced-motion media matched and
collapsed animation/transition durations to 0.01 ms. At 200% text on a 390 px
viewport, the create form remained available without horizontal overflow.

## Accessibility and structure

Semantic smoke checks pass: `lang=en`, route-appropriate single `h1`, one
`main`, labels, native controls, visible 3 px brass focus, and no Axe
serious/critical findings. The complete keyboard review workflow passes when
controls are focused explicitly. Three additional gaps remain:

1. On every cold app load, route rendering programmatically focuses `<main>`.
   In three of three fresh desktop contexts, the first Tab moved directly to
   “Create your first quote,” bypassing the skip link, wordmark, and primary
   navigation. The existing test hides this by calling `.focus()` on the skip
   link first.
2. At 390 px, the Data screen Terms link measured 38.3×15 px. Privacy/Terms
   page back and contact links measured 19 px high. These do not meet the
   required 44×44 px touch target.
3. Hash application routes keep the same document title and canonical URL.
   `/#home`, `/#new`, and `/#data` all use “Quote Decision — review before you
   send.” There are no Open Graph, Twitter, or apple-touch tags; no
   `sitemap.xml`; no designed 404 (`/404.html` and unknown paths return the
   home app with 200); and legal pages do not use the standard site header and
   footer. These conflict with the supplied site-structure contract.

With service workers explicitly blocked by the Playwright context, the page
still renders but emits `Cannot read properties of undefined (reading
'waiting')` from registration. Normal service-worker-enabled cold loads emitted
no errors. This is recorded as a low-severity resilience issue rather than a
normal-load failure.

## Defects by severity

### Critical / release-blocking

**QD-012 — Required claims manifest and claim tests are absent.**

`.factory/claims.json` is missing, so no visitor claim has the required
one-to-one tagged sandbox test and the mandatory first gate cannot run.

**QD-013 — Mandatory one-click sample demo and plain first screen are absent.**

There is no sample-data action, demo sandbox, demo banner, reset/start-real
controls, demo namespace, or `.factory/demo.md`. `/demo` and `?demo=1` show the
ordinary empty product. The metaphor headline and body do not identify tiny
agencies in the first screen.

### Medium

**QD-014 — Cold-load focus bypasses the skip link and primary navigation.**

The app focuses `<main>` during initial routing. Natural first-Tab order begins
inside main, while the automated keyboard test only passes by focusing the
skip link programmatically.

**QD-015 — Several mobile links miss the 44 px touch-target baseline.**

The Data-screen Terms link is 38.3×15 px; legal-page links are 19 px high.

**QD-016 — An invalid returned license leaves contradictory paid-state copy.**

After verification stores `valid:false`, the notice says “License no longer
active,” but the same screen continues to say “Unlimited is active” until a
rerender. The underlying verdict is false, but the visible state is misleading.

**QD-017 — Required routing/discovery metadata and real 404 are incomplete.**

App places use hash routes with one title/canonical, social metadata and
apple-touch icon are absent, `sitemap.xml` returns 404, unknown URLs return the
home page with 200, and legal routes lack the standard skeleton.

### Low

**QD-018 — Blocking service workers produces an uncaught registration error.**

The UI remains usable, but service-worker registration assumes a registration
object and does not handle the blocked case.

## Acceptance decision

**FAIL.** Do not release this candidate. Add the required isolated sample-data
demo and `.factory/demo.md`; create `.factory/claims.json` with one observable
demo-based test per claim; rewrite the first screen in plain job/user/action
language; then fix the keyboard, touch-target, license-state, and site-structure
defects and rerun all gates.
