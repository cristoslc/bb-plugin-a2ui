# UAT report

_Generated 2026-11-23T04:20:11.854Z by `npm run uat`._

## a2ui-draw

Source: `tests/manual/a2ui/uat-draw.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A static surface draws its text under the light token set | pass | ok {"text":"Quarterly review"}; ok {"text":"Revenue grew 12 percent while churn held flat."}; ok {"text":"North America: 48 percent"}; ok {"text":"1 surface"}; ok {"theme":{"expected":"light"}} |
| The same surface keeps its text under the dark token set | pass | ok {"text":"Quarterly review"}; ok {"text":"Europe: 31 percent"}; ok {"text":"1 surface"}; ok {"theme":{"expected":"dark"}} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-draw at 1280x820 in dark](shots/uat-draw.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-draw.1280x820.dark.png`

![a2ui-draw at 390x844 in dark](shots/uat-draw.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-draw.390x844.dark.png`

