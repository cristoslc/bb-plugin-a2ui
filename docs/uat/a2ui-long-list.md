# UAT report

_Generated 2026-11-23T16:48:45.446Z by `npm run uat`._

## a2ui-long-list

Source: `tests/manual/a2ui/uat-long-list.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| All 50 rows draw from Row 01 to Row 50, and both ends are visible | pass | ok {"text":"Row 01"}; ok {"text":"Row 25"}; ok {"text":"Row 50"}; ok {"text_not":"Waiting for /items"}; ok {"style":{"selector":".flex-col.gap-2","property":"flex-direction","equals":"column"}}; ok {"count":{"selector":".flex-col.gap-2 > div","equals":50}}; ok {"visible":{"selector":".flex-col.gap-2 > div:nth-child(1)","min_height":16}}; ok {"visible":{"selector":".flex-col.gap-2 > div:nth-child(50)","min_height":16}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-long-list at 1280x820 in dark](shots/uat-long-list.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-long-list.1280x820.dark.png`

![a2ui-long-list at 390x844 in dark](shots/uat-long-list.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-long-list.390x844.dark.png`

