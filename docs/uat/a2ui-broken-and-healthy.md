# UAT report

_Generated 2026-11-23T16:48:45.446Z by `npm run uat`._

## a2ui-broken-and-healthy

Source: `tests/manual/a2ui/uat-broken-and-healthy.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The duplicate surface reports INTEGRITY_ERROR and the valid surface still draws | pass | ok {"text":"Alpha ledger ready"}; ok {"text":"Beta ledger ready"}; ok {"text":"2 surfaces"}; ok {"text":"INTEGRITY_ERROR"}; ok {"diagnostic":{"code":"INTEGRITY_ERROR","message_contains":"Surface \"alpha\" already exists"}}; ok {"text_not":"no surface"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-broken-and-healthy at 1280x820 in dark](shots/uat-broken-and-healthy.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-broken-and-healthy.1280x820.dark.png`

![a2ui-broken-and-healthy at 390x844 in dark](shots/uat-broken-and-healthy.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-broken-and-healthy.390x844.dark.png`

