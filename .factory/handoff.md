# Quote Decision — verification 13 handoff

## Result

**PASS.** Independent verification of candidate
`051ee2d171ce1420eecda47da4d5e521d8305cb0` completed on 2026-09-02.
Production <https://quote-decision-log.sociobot.in> matches all 20 public
files from the candidate build byte-for-byte.

## Verified

- `npm ci`, unit tests (12), typecheck, lint, production build, the full
  local Playwright suite, and its mobile performance suite all passed.
- Every one of the 19 commands listed in `.factory/claims.json` passed from
  the clean demo entry point.
- The production-targeted full browser and performance suites passed.
- Cold first read is clear and includes a one-click **Try it with sample data**
  action. Desktop, 390px mobile, keyboard workflow, invalid-input recovery,
  accessibility, request privacy, headers, caching, offline reload, and
  service-worker update activation were independently checked.
- Live mobile measurement at 4× CPU slowdown: CLS 0 and 170 ms blocking time.

## Run

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

Demo: <https://quote-decision-log.sociobot.in/demo>

## Known gap

Low-priority test maintenance only: the service-worker update regression has
literal `v10` cache names while the shipped worker is `v13`. The independently
tested v13 update flow works, but the literals should be advanced before the
next cache-version change. Full evidence is in
[`verification-13.md`](verification-13.md).
