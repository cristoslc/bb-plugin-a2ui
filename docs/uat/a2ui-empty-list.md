# UAT report

_Generated 2026-11-23T16:48:45.446Z by `npm run uat`._

## a2ui-empty-list

Source: `tests/manual/a2ui/uat-empty-list.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The empty template draws no row, shows no waiting text, and keeps the title and footer | pass | ok {"text":"Your cart is empty"}; ok {"text":"Add an item to begin."}; ok {"text_not":"Waiting for /items"}; ok {"count":{"selector":".flex-col.gap-2 > .flex-col.gap-2 > div","equals":0}}; ok {"count":{"selector":"[data-uat-markdown]","equals":2}}; ok {"text":"1 surface"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-empty-list at 1280x820 in dark](shots/uat-empty-list.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-empty-list.1280x820.dark.png`

![a2ui-empty-list at 390x844 in dark](shots/uat-empty-list.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-empty-list.390x844.dark.png`

