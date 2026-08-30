# Quote Decision repair 4 handoff

## Result

This repair resolves QD-019, QD-020, and QD-021 from independent verification
4 at commit `ecaea96576e3cee35172ec5b88b623a0b558159d`, for candidate
`9496007210c09e549418bac3fae4b970e81b7a7f`. It preserves the researched quote
workflow, local-first PWA artifact, visual system, billing integration, and
static deployment class.

## Reproduction before repair

The new Playwright regression first ran against the unfixed candidate in a
genuinely separate 390×844 browser context. The context contained zero agency
quotes. Recording an acceptance downloaded a valid schema-2 receipt, but both
the immediate state and a reload showed:

```text
Accepted by Ada Client heading: absent
Download receipt again button: absent
decision form count: 1
```

The verifier measured the focused app skip link at 43px high. The share screen
used the unconditional statement that no network request was needed, even
though a cold browser must first fetch the app shell.

## Repairs

- **QD-019 — separate-client receipt retention:** valid client receipts now
  persist in `quote-decision-client-receipts`, independently of the sender's
  `quote-decision-log`. Demo receipts use
  `demo:quote-decision-client-receipts`, so demo and real data remain isolated.
  The client page restores the exact accepted or declined state after reload,
  offers **Download receipt again**, and lets the client delete the local copy.
- **QD-020 — accurate network wording and claim coverage:** the send screen now
  says to send the self-contained link through the agency's own email or
  message. It no longer claims a cold browser needs no network request.
  `.factory/claims.json` now lists the retained-client-decision claim, and the
  client-link test rejects the old wording. Offline copy remains accurately
  qualified as working after the first visit.
- **QD-021 — mobile skip target:** app and legal skip links now have a 44px
  minimum height and an inline-flex layout. The 390px browser measured the app
  skip link at 202.58×44px on the repaired build.
- The PWA cache moved to `qd-shell-v4` / `qd-assets-v4`, the manifest start URL
  moved to `?v=3`, and the visible build version is v1.0.2.
- README, demo documentation, privacy copy, copy audit, and the claims manifest
  document the separate receipt namespace and accurate network behavior.

## Exact regression coverage

- `@claim:client-decision-retention` creates a normal sender quote, opens the
  private link in a new clean browser context at 390×844, proves the normal
  quote database has zero rows, records and validates the downloaded receipt,
  then asserts the exact completion state immediately and after reload. It
  downloads the restored receipt again and proves it is byte-for-byte equal.
- The same test proves one receipt exists in the dedicated client database and
  that every client request is a same-origin GET with no body, URL fragment, or
  signer name.
- `@claim:client-link` asserts the corrected send-screen wording and the
  absence of the inaccurate network sentence.
- The mobile-target regression measures the app skip link on `/`, `/demo`,
  `/new`, and `/data`, plus existing data and legal targets, at a minimum of
  44×44px.
- All 12 claim IDs have exactly one matching `@claim:<id>` test tag.

## Local verification — 2026-08-30 UTC

```text
npm ci                              PASS — 61 packages, 0 vulnerabilities
npm test                            PASS — 10/10 Vitest tests
npm run typecheck                   PASS — no diagnostics
npm run lint                        PASS — no diagnostics
npm run build                       PASS — dist/ emitted
npm run test:e2e                    PASS — 35 passed, 21 expected project skips
12 individual claim commands        PASS — 12 passed, 12 expected project skips
factory verify-url.sh               PASS — 713ms, no console/page errors
Playwright Axe                      PASS — 0 serious/critical findings
```

The browser suite covers desktop and mobile, keyboard-only review, empty/form/
data/demo/legal/client accessibility, privacy requests, the clean separate
client, offline reload, service-worker update activation, data recovery,
license state, response-policy configuration, and the complete quote workflow.
The factory smoke check confirmed a title, `lang=en`, one `h1`, one `main`, alt
text, labeled buttons, and no console errors.

One final full-suite attempt ended after the pinned Chromium process itself
segfaulted while creating the mobile project for a test that is skipped on
mobile. The run had 35 application tests passing and no failed assertion. The
exact unmodified command was rerun and completed with 35 passed and 21 expected
skips, matching the earlier clean full-suite pass.

The standalone `@axe-core/cli` was attempted as requested, but its Selenium
launcher could not find a compatible system Chrome binary. The pinned
Playwright 1.58.2 Axe integration ran in the provided Chromium across the
required states and passed.

Visual inspection covered 1440×900 desktop, the 390px landing page, and the
390px retained receipt after reload. The client page had zero horizontal
overflow, displayed **Accepted by Ada Client**, hid the decision form, and
showed **Download receipt again** with no console errors.

Fresh Lighthouse 12.8.2 mobile result:

| Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT | Transfer |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 100 | 100 | 100 | 1.05s | 1.58s | 0 | 0ms | 79,902B |

Final production asset sizes remain inside every budget:

| Asset | Raw | Gzip / budget |
| --- | ---: | ---: |
| JavaScript | 53.57kB | 16.55kB / 200kB |
| CSS | 23.10kB | 6.00kB / 50kB |
| Mobile hero | 25.96kB | 25.96kB / 300kB |
| Fonts | 0B | 0B / 120kB |

This static PWA has no package consumer, CLI, backend, sign-in, or server-side
state, so package-consumer, server concurrency/health, Entra identity, and
SQLite checks do not apply.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

## Deployment and live verification

Repair commit `d339c62e10d96cebee855b2f667cfa47ed48a58e` was pushed to `main` and
deployed only to the permitted `sf-quote-decision-log` Static Web App with:

```sh
/opt/fleet/lib/deploy-static.sh quote-decision-log dist
```

Azure deployment `59232a72-5900-4958-952c-757cd2cb5ad8` succeeded. The custom
domain <https://quote-decision-log.sociobot.in> returned HTTPS 200. No other
service, database, key vault, or cloud resource was read or changed.

Post-deploy evidence:

```text
factory verify-url.sh               PASS — 660ms, no console/page errors
critical live browser claims        PASS — 5/5
production file identity            PASS — 20/20 byte-for-byte matches
/demo                               PASS — HTTP 200
unknown route                       PASS — designed HTTP 404
billing checkout                    PASS — HTTP 303 to hosted checkout
```

The five live tests covered the genuinely separate-client receipt retention,
correct client-link copy, local-device privacy, one-click isolated demo, and
offline reload. The root and service worker send `Cache-Control: no-cache`;
hashed JavaScript sends `public, max-age=31536000, immutable`; the manifest is
`application/manifest+json`. HSTS, the restrictive CSP, Permissions-Policy,
`Referrer-Policy: no-referrer`, and `X-Content-Type-Options: nosniff` are live.

## Known gaps

No known product gap remains from verification 4. The standalone Axe CLI
launcher limitation is documented above; the supported in-browser Axe checks
pass.
