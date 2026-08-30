# Quote Decision demo

Open [`/demo`](https://quote-decision-log.sociobot.in/demo) or
[`?demo=1`](https://quote-decision-log.sociobot.in/?demo=1), or choose **Try it
with sample data** on the landing page.

The demo starts with two realistic sample quotes:

- `QD-2047` for Cedar & Kite, accepted after internal review with an exported
  client decision record;
- `QD-2048` for Harrow & Vale, ready for an agency review before it is sent.

The demo stores its quotes in the browser's `demo:quote-decision-log`
IndexedDB database. The normal product uses `quote-decision-log`; demo mode
does not read or write it. The visible **Demo — sample data, nothing is saved**
banner has **Reset demo** to restore the two samples and **Start for real** to
leave the sandbox. Leaving the demo discards no real data; its separate demo
data remains available only until the next reset or browser-site-data cleanup.

All claim tests use this seeded demo. It has the same quote review, receipt,
export, offline, and free-limit behavior as the real product.
