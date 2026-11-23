# UAT report

_Generated 2026-11-23T13:01:41.211Z by `npm run uat`._

## a2ui-proto-surfaces

Source: `tests/manual/a2ui/uat-proto-surfaces.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A reply with two surfaces draws both texts and counts two surfaces | pass | ok {"text":"Weather in Lisbon"}; ok {"text":"Packing list for Porto"}; ok {"text":"2 surfaces"}; ok {"text_not":"1 surface"}; ok {"text_not":"no surface"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-surfaces at 1280x820 in dark](shots/uat-proto-surfaces.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-surfaces.1280x820.dark.png`

![a2ui-proto-surfaces at 390x844 in dark](shots/uat-proto-surfaces.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-surfaces.390x844.dark.png`

