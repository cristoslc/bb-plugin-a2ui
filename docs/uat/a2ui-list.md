# UAT report

_Generated 2026-11-23T13:17:44.014Z by `npm run uat`._

## a2ui-list

Source: `tests/manual/a2ui/uat-list.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A vertical List computes flex-direction column and keeps its two children in order | pass | ok {"style":{"selector":".flex-col.gap-2","property":"flex-direction","equals":"column"}}; ok {"style":{"selector":".flex-col.gap-2 > div:nth-child(1)","property":"flex-grow","equals":"1"}}; ok {"style":{"selector":".flex-col.gap-2 > div:nth-child(2)","property":"flex-grow","equals":"2"}}; ok {"text":"Vertical item one"}; ok {"text":"Vertical item two"} |
| A horizontal List computes flex-direction row and keeps its two children in order | pass | ok {"style":{"selector":".flex-row.overflow-x-auto","property":"flex-direction","equals":"row"}}; ok {"style":{"selector":".flex-row.overflow-x-auto > div:nth-child(1)","property":"flex-grow","equals":"3"}}; ok {"style":{"selector":".flex-row.overflow-x-auto > div:nth-child(2)","property":"flex-grow","equals":"1"}}; ok {"text":"Horizontal item one"}; ok {"text":"Horizontal item two"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-list at 1280x820 in dark](shots/uat-list.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-list.1280x820.dark.png`

![a2ui-list at 390x844 in dark](shots/uat-list.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-list.390x844.dark.png`

