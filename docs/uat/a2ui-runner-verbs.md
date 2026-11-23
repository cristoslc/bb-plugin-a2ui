# UAT report

_Generated 2026-11-23T13:04:48.644Z by `npm run uat`._

## a2ui-runner-verbs

Source: `tests/manual/a2ui/uat-runner-verbs.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Text, number, date and checkbox fields report the value a real interaction left | pass | ok {"input_value":{"label":"Full name","value":"Amelia Chen"}}; ok {"input_value":{"label":"Guests","value":4}}; ok {"input_value":{"label":"Arrival date","value":"2026-12-24"}}; ok {"checked":{"label":"Window seat","value":true}} |
| A single picker and a chip picker report the option that was clicked | pass | ok {"selected":{"label":"Cabin","option":"Business","value":true}}; ok {"selected":{"label":"Cabin","option":"Economy","value":false}}; ok {"selected":{"option":"Breakfast","value":true}} |
| Clicking a tab swaps the panel and moves the selected state | pass | ok {"text":"The details panel"}; ok {"text_not":"The overview panel"}; ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(2)","name":"aria-selected","equals":"true"}}; ok {"attr":{"selector":"button[role=\"tab\"]:nth-child(1)","name":"aria-selected","equals":"false"}} |
| A modal trigger opens the panel and the close button is present | pass | ok {"text":"Reservation summary"}; ok {"text":"Two guests on Dec 24."}; ok {"count":{"selector":"button[aria-label=\"Close\"]","equals":1}} |
| The close button removes the modal content | pass | ok {"count":{"selector":"button[aria-label=\"Close\"]","equals":0}}; ok {"text_not":"Reservation summary"} |
| An openUrl button hands its URL to window.open and the source toggle flips | pass | ok {"popup_url":{"equals":"https://example.com/a2ui-guide"}}; ok {"text":"Hide source"}; ok {"text":"\"createSurface\""} |
| A second source toggle hides the source and brings the surface back | pass | ok {"text_not":"Hide source"}; ok {"text_not":"\"createSurface\""}; ok {"text":"Field guide"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-runner-verbs at 1280x820 in dark](shots/uat-runner-verbs.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-runner-verbs.1280x820.dark.png`

![a2ui-runner-verbs at 390x844 in dark](shots/uat-runner-verbs.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-runner-verbs.390x844.dark.png`

