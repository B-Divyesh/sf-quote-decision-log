# Quote Decision — repair 7 handoff

## Result

**PASS locally; ready for deployment.** This repair resolves QD-009 from
independent verification 12 for candidate
`a0660accb4191737e8edfac24f19e2597d6fb926`.

At 390×844 with a 200% emulated OS text scale and a true offline `/demo`
reload, the notice now occupies normal mobile document flow above the demo
banner. The notice measured `0–63.19 px`; the required Demo disclosure
measured `96.19–112.19 px`. A center-point hit test returned `.demo-banner`,
not the offline notice. The final visual evidence is
[`offline-demo-390-text-200.png`](qa-evidence/repair-7/offline-demo-390-text-200.png).

## Changes made

- Replaced the narrow-screen fixed offline notice with a normal-flow notice.
  It has a 44 px minimum height and can grow when its text wraps, so it cannot
  cover the persistent demo disclosure.
- Added the exact `@claim:offline-reload` browser regression: an isolated
  390×844 context, CDP-emulated 200% OS text scale, service-worker control,
  offline reload, geometry assertion, and center hit-test assertion.
- Updated the offline claim sandbox description with that exact test path.
- Fixed service-worker cache entries for compressed static responses. Cached
  bodies are decoded by Cache Storage, so `Content-Encoding`, `Content-Length`,
  and `Vary` are removed before storage. This prevents a true offline reload
  from failing to load the cached JavaScript bundle under compressed serving.
  Cache names advance to `qd-shell-v13` and `qd-assets-v13` for a clean update.

## Verification

Ran from a clean dependency install (`npm ci`, 0 vulnerabilities):

```sh
npm test                 # 12/12 Vitest tests passed
npm run typecheck        # passed
npm run lint             # passed
npm run build            # passed; dist/ created
npm run test:e2e         # 80 cases: 49 passed, 31 expected project skips
npm run test:performance # passed at the 390 px mobile budget
```

The targeted offline claim passed after the service-worker repair. A separate
fresh-browser probe completed a real offline reload with `navigator.onLine`
false, the seeded Cedar & Kite demo visible, and no failed requests or console
errors. The local URL verifier passed at `/demo` (527 ms network-idle load,
title, `lang=en`, one `h1`, `main`, complete image alt text, labelled buttons,
and no console/page errors); its evidence is in
[`qa-evidence/repair-7/verify-url`](qa-evidence/repair-7/verify-url).
Playwright Axe coverage passed with no serious or critical findings (3 passed,
1 expected project skip). The full browser suite also rechecks desktop and
390 px mobile flows, keyboard review, privacy/request policy, response policy,
service-worker update, PWA offline behavior, and local data isolation.

## Run and deploy

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
swa deploy ./dist --env production
```

Demo: <https://quote-decision-log.sociobot.in/demo>

## Known gaps

None in this repair scope. A real checkout is deliberately not completed
during QA, to avoid creating a charge; the hosted product-specific handoff is
covered by the existing browser suite.
