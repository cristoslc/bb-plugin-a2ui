# UAT report

_Generated 2026-11-23T13:01:42.964Z by `npm run uat`._

## a2ui-proto-data

Source: `tests/manual/a2ui/uat-proto-data.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| An updateDataModel message replaces the text bound to that path | pass | ok {"text":"Next stop"}; ok {"text":"Porto"}; ok {"text_not":"Lisbon"}; ok {"text":"1 surface"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-data at 1280x820 in dark](shots/uat-proto-data.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-data.1280x820.dark.png`

![a2ui-proto-data at 390x844 in dark](shots/uat-proto-data.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-data.390x844.dark.png`

