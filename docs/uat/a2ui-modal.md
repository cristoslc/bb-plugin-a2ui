# UAT report

_Generated 2026-11-23T13:11:54.561Z by `npm run uat`._

## a2ui-modal

Source: `tests/manual/a2ui/uat-modal.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| At 1280x820 the panel is at least 200 tall, inside the viewport, and the close button owns its center | pass | ok {"visible":{"selector":"[role=\"dialog\"]","min_height":200}}; ok {"hit_test":{"selector":"button[aria-label=\"Close\"]","at":"center"}} |
| At 1280x820 the close button removes the panel and its content | pass | ok {"count":{"selector":"[role=\"dialog\"]","equals":0}}; ok {"count":{"selector":"button[aria-label=\"Close\"]","equals":0}}; ok {"text_not":"Reservation summary"} |
| At 390x844 the panel is at least 200 tall, inside the viewport, and the close button owns its center | pass | ok {"visible":{"selector":"[role=\"dialog\"]","min_height":200}}; ok {"hit_test":{"selector":"button[aria-label=\"Close\"]","at":"center"}} |
| At 390x844 the close button removes the panel and its content | pass | ok {"count":{"selector":"[role=\"dialog\"]","equals":0}}; ok {"count":{"selector":"button[aria-label=\"Close\"]","equals":0}}; ok {"text_not":"Reservation summary"} |
| The open panel is the final state, so the screenshots at both widths show it | pass | ok {"visible":{"selector":"[role=\"dialog\"]","min_height":200}} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-modal at 1280x820 in dark](shots/uat-modal.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-modal.1280x820.dark.png`

![a2ui-modal at 390x844 in dark](shots/uat-modal.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-modal.390x844.dark.png`

