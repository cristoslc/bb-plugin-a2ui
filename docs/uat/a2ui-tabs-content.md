# UAT report

_Generated 2026-11-23T13:17:45.758Z by `npm run uat`._

## a2ui-tabs-content

Source: `tests/manual/a2ui/uat-tabs-content.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The first tab is selected and only the overview panel is shown | pass | ok {"text":"Overview panel: the route crosses three valleys."}; ok {"text":"Overview panel: start before dawn to reach the ridge by noon."}; ok {"text_not":"Details panel: carry two liters of water per person."}; ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(1)","name":"aria-selected","equals":"true"}}; ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(2)","name":"aria-selected","equals":"false"}} |
| A real click on the second tab shows only the details panel and moves aria-selected | pass | ok {"text":"Details panel: carry two liters of water per person."}; ok {"text":"Details panel: the last spring is four kilometers from the pass."}; ok {"text_not":"Overview panel: the route crosses three valleys."}; ok {"text_not":"Overview panel: start before dawn to reach the ridge by noon."}; ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(1)","name":"aria-selected","equals":"false"}}; ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(2)","name":"aria-selected","equals":"true"}} |
| Clicking the first tab again brings the overview panel back and moves aria-selected | pass | ok {"text":"Overview panel: the route crosses three valleys."}; ok {"text_not":"Details panel: carry two liters of water per person."}; ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(1)","name":"aria-selected","equals":"true"}}; ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(2)","name":"aria-selected","equals":"false"}} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-tabs-content at 1280x820 in dark](shots/uat-tabs-content.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-tabs-content.1280x820.dark.png`

![a2ui-tabs-content at 390x844 in dark](shots/uat-tabs-content.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-tabs-content.390x844.dark.png`

