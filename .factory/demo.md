# Quote Decision demo

Open [`/demo`](https://quote-decision-log.sociobot.in/demo) or
[`?demo=1`](https://quote-decision-log.sociobot.in/?demo=1), or choose **Try it
with sample data** on the landing page.

The demo starts with two realistic sample quotes:

- `QD-2047` for Cedar & Kite, accepted after internal review with an exported
  client decision record;
- `QD-2048` for Harrow & Vale, ready for an agency review before it is sent.

The demo stores its quotes in the browser's `demo:quote-decision-log`
IndexedDB database and client receipts in
`demo:quote-decision-client-receipts`. The normal product uses
`quote-decision-log` and `quote-decision-client-receipts`; demo mode does not
read or write them. The visible **Demo — sample data, nothing is saved**
banner has **Reset demo** to restore the two samples and **Start for real** to
leave the sandbox. Leaving the demo discards no real data; its separate demo
data remains available only until the next reset or browser-site-data cleanup.

Every claim test starts from this seeded demo entry point. Tests for real-data
deletion and client receipts then use **Start for real** and a separate clean
client context. This proves demo actions cannot read or change real records.
