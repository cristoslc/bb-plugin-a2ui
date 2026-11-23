# UAT report

_Generated 2026-11-23T13:01:50.733Z by `npm run uat`._

## a2ui-proto-checks-logic

Source: `tests/manual/a2ui/uat-proto-checks-logic.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The and, or and not checks each show a message and block the send | pass | ok {"text":"Both names are required."}; ok {"text":"Give a phone or an email address."}; ok {"text":"Blocked accounts cannot continue."}; ok {"button_blocked":{"label":"Continue","message":"Resolve every check before sending."}}; ok {"composer_empty":true} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-checks-logic at 1280x820 in dark](shots/uat-proto-checks-logic.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-checks-logic.1280x820.dark.png`

![a2ui-proto-checks-logic at 390x844 in dark](shots/uat-proto-checks-logic.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-checks-logic.390x844.dark.png`

