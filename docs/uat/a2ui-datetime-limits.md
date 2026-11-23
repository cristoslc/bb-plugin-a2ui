# UAT report

_Generated 2026-11-23T13:24:22.069Z by `npm run uat`._

## a2ui-datetime-limits

Source: `tests/manual/a2ui/uat-datetime-limits.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The date input carries min 2026-12-01 and max 2027-01-31 and shows the bound date | pass | ok {"count":{"selector":"input[type=\"date\"]","equals":1}}; ok {"attr":{"selector":"input[type=\"date\"]","name":"type","equals":"date"}}; ok {"attr":{"selector":"input[type=\"date\"]","name":"min","equals":"2026-12-01"}}; ok {"attr":{"selector":"input[type=\"date\"]","name":"max","equals":"2027-01-31"}}; ok {"input_value":{"label":"Leave date","value":"2026-12-24"}}; ok {"text":"Leave on 2026-12-24"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-datetime-limits at 1280x820 in dark](shots/uat-datetime-limits.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-datetime-limits.1280x820.dark.png`

![a2ui-datetime-limits at 390x844 in dark](shots/uat-datetime-limits.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-datetime-limits.390x844.dark.png`

