# UAT report

_Generated 2026-11-23T16:48:45.446Z by `npm run uat`._

## a2ui-long-text-phone

Source: `tests/manual/a2ui/uat-long-text-phone.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| At 390x844 the paragraph wraps across several lines and stays inside the viewport | pass | ok {"visible":{"selector":".flex-col.gap-2 > div:nth-child(2) [data-uat-markdown]","min_height":200}}; ok {"visible":{"selector":"[class*=\"bg-background/60\"]","min_height":250}}; ok {"style":{"selector":".flex-col.gap-2 > div:nth-child(2) [data-uat-markdown]","property":"width","equals":"306px"}}; ok {"text":"the same boats that left in the dark return with the day catch."}; ok {"text":"A note from the harbor"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-long-text-phone at 1280x820 in dark](shots/uat-long-text-phone.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-long-text-phone.1280x820.dark.png`

![a2ui-long-text-phone at 390x844 in dark](shots/uat-long-text-phone.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-long-text-phone.390x844.dark.png`

