# UAT report

_Generated 2026-11-23T13:17:44.014Z by `npm run uat`._

## a2ui-card-divider

Source: `tests/manual/a2ui/uat-card-divider.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The Card computes a one pixel solid border on all four sides and wraps exactly one child | pass | ok {"count":{"selector":"div.rounded-md.border > *","equals":1}}; ok {"style":{"selector":"div.rounded-md.border","property":"border-top-width","equals":"1px"}}; ok {"style":{"selector":"div.rounded-md.border","property":"border-right-width","equals":"1px"}}; ok {"style":{"selector":"div.rounded-md.border","property":"border-bottom-width","equals":"1px"}}; ok {"style":{"selector":"div.rounded-md.border","property":"border-left-width","equals":"1px"}}; ok {"style":{"selector":"div.rounded-md.border","property":"border-top-style","equals":"solid"}}; ok {"text":"Card interior label"} |
| A Divider without axis is a separator one pixel tall | pass | ok {"attr":{"selector":".h-px","name":"role","equals":"separator"}}; ok {"style":{"selector":".h-px","property":"height","equals":"1px"}} |
| A Divider with axis vertical is a separator one pixel wide | pass | ok {"attr":{"selector":".w-px","name":"role","equals":"separator"}}; ok {"style":{"selector":".w-px","property":"width","equals":"1px"}}; ok {"text":"Vertical rule label"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-card-divider at 1280x820 in dark](shots/uat-card-divider.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-card-divider.1280x820.dark.png`

![a2ui-card-divider at 390x844 in dark](shots/uat-card-divider.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-card-divider.390x844.dark.png`

