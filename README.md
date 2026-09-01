# Quote Decision

Quote Decision helps tiny agencies review a quote before sending it and keep a
clear client decision trail. It keeps quote records in this browser and can
work offline after the first visit.

Try the shipped sample workspace at
<https://quote-decision-log.sociobot.in/demo>. It starts with two realistic
quotes in a separate demo database. Use **Reset demo** to restore them or
**Start for real** to open your own empty quote log.

## What it does

- keeps quote data in browser IndexedDB on the device;
- shows a named review before a quote is send-ready;
- puts the reviewed quote in a link you can send to the client;
- exports portable JSON decision receipts;
- retains a client's own receipt on that device for later download;
- exports the whole log as JSON and a summary as CSV;
- shows an unchangeable ID for each saved quote version;
- works offline after the first visit;
- supports five free quotes and displays a $19 one-time unlimited option.

Quote Decision is not a payment tool, document editor, or regulated electronic
signature service. A decision receipt records explicit click consent and a
typed name only.

Every visitor-facing product claim is listed with its exact browser test in
[`.factory/claims.json`](.factory/claims.json). The sample sandbox is described
in [`.factory/demo.md`](.factory/demo.md).

## Develop

Requires Node.js 20 or later.

```sh
npm ci
npm run dev
```

Data is specific to the browser origin. The normal quote log uses
`quote-decision-log` IndexedDB. The demo uses `demo:quote-decision-log` and
does not read or write the normal database. Client receipts use the separate
`quote-decision-client-receipts` database, with a separate demo namespace.

## Verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:performance
```

`npm run build` creates `dist/` with `dist/index.html` at its root. The browser
suite checks desktop and 390 px mobile layouts. It also checks keyboard use,
privacy, demo, offline, updates, recovery, and the main quote flow.

## Privacy and data

Quotes and client receipts remain in separate browser IndexedDB databases. License tokens and their cached daily
verification result use localStorage. There are no analytics, advertising
trackers, remote fonts, or runtime CDNs. Client links contain the quote in the
URL fragment, so the app server does not receive the fragment. Anyone who has
the link can read its contents.

Use **Data and license** to export JSON or CSV, import a backup, or delete
local quotes. A client can download or delete the local receipt from its link.
Read the complete [privacy policy](public/privacy/index.html) and
[terms](public/terms/index.html) before purchase.

## Deploy

Publish `dist/` to the static host. `public/staticwebapp.config.json` configures
application routes and the 404 page. It also sets security and cache headers.
The service worker requires HTTPS in production.

## Design and license

The product-specific visual system and generated-art provenance are documented
in [`.factory/design.md`](.factory/design.md). The social preview is derived
from the same original dispatch-gate artwork. Source art is retained in
`assets/src/`.

MIT. See [LICENSE](LICENSE).
