# UAT report

_Generated 2026-11-23T13:17:44.014Z by `npm run uat`._

## a2ui-layout

Source: `tests/manual/a2ui/uat-layout.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Row computes flex-direction row with space-between and center, and its three children stay in order | pass | ok {"style":{"selector":".flex-row.justify-between","property":"flex-direction","equals":"row"}}; ok {"style":{"selector":".flex-row.justify-between","property":"justify-content","equals":"space-between"}}; ok {"style":{"selector":".flex-row.justify-between","property":"align-items","equals":"center"}}; ok {"style":{"selector":".flex-row.justify-between > div:nth-child(1)","property":"flex-grow","equals":"3"}}; ok {"style":{"selector":".flex-row.justify-between > div:nth-child(2)","property":"flex-grow","equals":"1"}}; ok {"style":{"selector":".flex-row.justify-between > div:nth-child(3)","property":"flex-grow","equals":"2"}}; ok {"text":"Row child alpha"}; ok {"text":"Row child beta"}; ok {"text":"Row child gamma"} |
| Column computes flex-direction column with center on both axes, and its three children stay in order | pass | ok {"style":{"selector":".flex-col.justify-center","property":"flex-direction","equals":"column"}}; ok {"style":{"selector":".flex-col.justify-center","property":"justify-content","equals":"center"}}; ok {"style":{"selector":".flex-col.justify-center","property":"align-items","equals":"center"}}; ok {"style":{"selector":".flex-col.justify-center > div:nth-child(1)","property":"flex-grow","equals":"1"}}; ok {"style":{"selector":".flex-col.justify-center > div:nth-child(2)","property":"flex-grow","equals":"3"}}; ok {"style":{"selector":".flex-col.justify-center > div:nth-child(3)","property":"flex-grow","equals":"2"}}; ok {"text":"Column child delta"}; ok {"text":"Column child epsilon"}; ok {"text":"Column child zeta"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-layout at 1280x820 in dark](shots/uat-layout.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-layout.1280x820.dark.png`

![a2ui-layout at 390x844 in dark](shots/uat-layout.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-layout.390x844.dark.png`

