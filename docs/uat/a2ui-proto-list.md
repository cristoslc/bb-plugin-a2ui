# UAT report

_Generated 2026-11-23T13:01:44.704Z by `npm run uat`._

## a2ui-proto-list

Source: `tests/manual/a2ui/uat-proto-list.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The List template draws three rows with per-item names and positions | pass | ok {"text":"Mug"}; ok {"text":"Lamp"}; ok {"text":"Rug"}; ok {"text":"Row 0"}; ok {"text":"Row 1"}; ok {"text":"Row 2"}; ok {"text_not":"Waiting for /items"}; ok {"text":"1 surface"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-list at 1280x820 in dark](shots/uat-proto-list.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-list.1280x820.dark.png`

![a2ui-proto-list at 390x844 in dark](shots/uat-proto-list.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-list.390x844.dark.png`

