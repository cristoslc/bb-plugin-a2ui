# UAT report

_Generated 2026-11-23T16:49:47.104Z by `npm run uat`._

## a2ui-update-keeps-edits

Source: `tests/manual/a2ui/uat-update-keeps-edits.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| An update to a different component leaves the typed value in the field | pass | ok {"input_value":{"label":"Display name","value":"Grace"}}; ok {"input_value":{"label":"Display name","value":"Grace"}}; ok {"text":"New note from the agent."}; ok {"text_not":"Old note from the agent."}; ok {"count":{"selector":"[data-uat-fence] > div","equals":1}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-update-keeps-edits at 1280x820 in dark](shots/uat-update-keeps-edits.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-update-keeps-edits.1280x820.dark.png`

![a2ui-update-keeps-edits at 390x844 in dark](shots/uat-update-keeps-edits.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-update-keeps-edits.390x844.dark.png`

