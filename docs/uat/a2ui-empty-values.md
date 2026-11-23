# UAT report

_Generated 2026-11-23T16:48:45.446Z by `npm run uat`._

## a2ui-empty-values

Source: `tests/manual/a2ui/uat-empty-values.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| An empty string, a missing path and a null value draw empty Text with no undefined or null | pass | ok {"text":"Empty values render as empty text"}; ok {"text":"Three values stayed empty."}; ok {"count":{"selector":"[data-uat-markdown]:empty","equals":4}}; ok {"count":{"selector":"[data-uat-markdown]","equals":6}}; ok {"text_not":"undefined"}; ok {"text_not":"null"}; ok {"text":"1 surface"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-empty-values at 1280x820 in dark](shots/uat-empty-values.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-empty-values.1280x820.dark.png`

![a2ui-empty-values at 390x844 in dark](shots/uat-empty-values.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-empty-values.390x844.dark.png`

