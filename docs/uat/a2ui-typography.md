# UAT report

_Generated 2026-11-23T13:24:22.069Z by `npm run uat`._

## a2ui-typography

Source: `tests/manual/a2ui/uat-typography.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The caption Text computes 12px while the body Text beside it computes 13px | pass | ok {"count":{"selector":"div.flex-row > div.min-w-0:nth-child(1)","equals":1}}; ok {"count":{"selector":"div.flex-row > div.min-w-0:nth-child(2)","equals":1}}; ok {"style":{"selector":"div.flex-row > div.min-w-0:nth-child(1)","property":"font-size","equals":"13px"}}; ok {"style":{"selector":"div.flex-row > div.min-w-0:nth-child(2)","property":"font-size","equals":"12px"}}; ok {"text":"Mild with a light breeze"}; ok {"text":"Updated this morning"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-typography at 1280x820 in dark](shots/uat-typography.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-typography.1280x820.dark.png`

![a2ui-typography at 390x844 in dark](shots/uat-typography.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-typography.390x844.dark.png`

