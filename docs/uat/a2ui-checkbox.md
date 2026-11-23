# UAT report

_Generated 2026-11-23T13:17:45.758Z by `npm run uat`._

## a2ui-checkbox

Source: `tests/manual/a2ui/uat-checkbox.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Clicking the unchecked box turns it on and writes true into the bound boolean | pass | ok {"checked":{"label":"Send me the monthly digest","value":true}}; ok {"text":"Digest flag: true"} |
| Clicking the checked box turns it off and writes false into the bound boolean | pass | ok {"checked":{"label":"Send me the monthly digest","value":false}}; ok {"text":"Digest flag: false"} |
| After the box is on, the button sends its true value with the exact composer text | pass | ok {"checked":{"label":"Send me the monthly digest","value":true}}; ok {"composer_exact":"[a2ui action] savePreferences (surface prefs)\n\nSave preferences\n\ncontext:\n```json\n{\n  \"newsletter\": true\n}\n```\n\ndata model:\n... |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-checkbox at 1280x820 in dark](shots/uat-checkbox.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-checkbox.1280x820.dark.png`

![a2ui-checkbox at 390x844 in dark](shots/uat-checkbox.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-checkbox.390x844.dark.png`

