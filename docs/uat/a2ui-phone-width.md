# UAT report

_Generated 2026-11-23T13:24:22.069Z by `npm run uat`._

## a2ui-phone-width

Source: `tests/manual/a2ui/uat-phone-width.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| At 390x844 the card and its text, date and range inputs are inside the viewport | pass | ok {"visible":{"selector":"[class*=\"bg-background/60\"]","min_height":20}}; ok {"visible":{"selector":"input[type=\"text\"]","min_height":16}}; ok {"visible":{"selector":"input[type=\"date\"]","min_height":16}}; ok {"visible":{"selector":"input[type=\"range\"]","min_height":10}}; ok {"visible":{"selector":"button:has([data-uat-markdown])","min_height":20}}; ok {"style":{"selector":"[class*=\"bg-background/60\"]","property":"width","equals":"332px"}}; ok {"style":{"selector":"input[type=\"text\"]","property":"width","equals":"306px"}}; ok {"style":{"selector":"input[type=\"date\"]","property":"width","equals":"306px"}}; ok {"style":{"selector":"input[type=\"range\"]","property":"width","equals":"306px"}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-phone-width at 1280x820 in dark](shots/uat-phone-width.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-phone-width.1280x820.dark.png`

![a2ui-phone-width at 390x844 in dark](shots/uat-phone-width.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-phone-width.390x844.dark.png`

