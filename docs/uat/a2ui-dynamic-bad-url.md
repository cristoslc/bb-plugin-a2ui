# UAT report

_Generated 2026-11-23T16:48:45.446Z by `npm run uat`._

## a2ui-dynamic-bad-url

Source: `tests/manual/a2ui/uat-dynamic-bad-url.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A data-bound javascript image URL draws the refusal text and no image | pass | ok {"text":"Receipt preview"}; ok {"text":"This renderer only loads http and https images."}; ok {"text":"Upload a new photo to continue."}; ok {"count":{"selector":"img","equals":0}}; ok {"text_not":"javascript:"}; ok {"text":"1 surface"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-dynamic-bad-url at 1280x820 in dark](shots/uat-dynamic-bad-url.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-dynamic-bad-url.1280x820.dark.png`

![a2ui-dynamic-bad-url at 390x844 in dark](shots/uat-dynamic-bad-url.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-dynamic-bad-url.390x844.dark.png`

