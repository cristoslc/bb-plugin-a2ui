# UAT report

_Generated 2026-11-23T17:04:21.792Z by `npm run uat`._

## a2ui-focus-survives-update

Source: `tests/manual/a2ui/uat-focus-survives-update.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A field keeps focus across a pushed update, then typing the rest completes the string in the field and its bound Text | pass | ok {"focused":{"label":"Display name"}}; ok {"input_value":{"label":"Display name","value":"Gr"}}; ok {"focused":{"label":"Display name"}}; ok {"input_value":{"label":"Display name","value":"Gr"}}; ok action type_focused "ace" (type_focused "ace" into input in "Display name"); ok {"input_value":{"label":"Display name","value":"Grace"}}; ok {"text":"Hello Grace"}; ok {"text":"New note from the agent."}; ok {"no_page_errors":true} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-focus-survives-update at 1280x820 in dark](shots/uat-focus-survives-update.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-focus-survives-update.1280x820.dark.png`

![a2ui-focus-survives-update at 390x844 in dark](shots/uat-focus-survives-update.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-focus-survives-update.390x844.dark.png`

