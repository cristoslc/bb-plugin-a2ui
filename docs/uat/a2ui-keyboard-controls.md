# UAT report

_Generated 2026-11-23T16:58:28.325Z by `npm run uat`._

## a2ui-keyboard-controls

Source: `tests/manual/a2ui/uat-keyboard-controls.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Tab reaches the checkbox and Space turns it on, and the bound boolean follows | pass | ok action press Tab (press Tab: focus moved from the page to button "Source"); ok action press Tab (press Tab: focus moved from button "Source" to button in "Notify me when it starts"); ok {"checked":{"label":"Notify me when it starts","value":false}}; ok action press Space (press Space: focus moved from button in "Notify me when it starts" to button in "Notify me when it starts"); ok {"checked":{"label":"Notify me when it starts","value":true}}; ok {"text":"Notify: true"}; ok {"no_page_errors":true} |
| Home and two ArrowRight presses move the focused slider to 2 and the bound Text reads 2 | pass | ok action press Tab (press Tab: focus moved from the page to button "Source"); ok action press Tab (press Tab: focus moved from button "Source" to button in "Notify me when it starts"); ok action press Tab (press Tab: focus moved from button in "Notify me when it starts" to input in "Volume0"); ok action press Home (press Home: focus moved from input in "Volume0" to input in "Volume0"); ok action press ArrowRight (press ArrowRight: focus moved from input in "Volume0" to input in "Volume1"); ok action press ArrowRight (press ArrowRight: focus moved from input in "Volume1" to input in "Volume2"); ok {"slider_value":{"label":"Volume","value":2}}; ok {"text":"Volume: 2"}; ok {"no_page_errors":true} |
| Tab walks past the first chip onto the second and Enter selects it, leaving the first unselected | pass | ok action press Tab (press Tab: focus moved from the page to button "Source"); ok action press Tab (press Tab: focus moved from button "Source" to button in "Notify me when it starts"); ok action press Tab (press Tab: focus moved from button in "Notify me when it starts" to input in "Volume0"); ok action press Tab (press Tab: focus moved from input in "Volume0" to button "Basic"); ok {"selected":{"label":"Plan","option":"Basic","value":false}}; ok action press Tab (press Tab: focus moved from button "Basic" to button "Pro"); ok action press Enter (press Enter: focus moved from button "Pro" to button "Pro"); ok {"selected":{"label":"Plan","option":"Pro","value":true}}; ok {"selected":{"label":"Plan","option":"Basic","value":false}}; ok {"no_page_errors":true} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-keyboard-controls at 1280x820 in dark](shots/uat-keyboard-controls.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-keyboard-controls.1280x820.dark.png`

![a2ui-keyboard-controls at 390x844 in dark](shots/uat-keyboard-controls.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-keyboard-controls.390x844.dark.png`

