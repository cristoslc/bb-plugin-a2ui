# UAT report

_Generated 2026-11-23T16:49:47.104Z by `npm run uat`._

## a2ui-update-keeps-tab

Source: `tests/manual/a2ui/uat-update-keeps-tab.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The second tab stays selected and keeps its panel after a pushed update | pass | ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(2)","name":"aria-selected","equals":"true"}}; ok {"text":"Field guide chapters, revised"}; ok {"text":"Details panel: carry two liters of water per person."}; ok {"text_not":"Overview panel: the route crosses three valleys."}; ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(1)","name":"aria-selected","equals":"false"}}; ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(2)","name":"aria-selected","equals":"true"}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-update-keeps-tab at 1280x820 in dark](shots/uat-update-keeps-tab.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-update-keeps-tab.1280x820.dark.png`

![a2ui-update-keeps-tab at 390x844 in dark](shots/uat-update-keeps-tab.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-update-keeps-tab.390x844.dark.png`

