# UAT report

_Generated 2026-11-23T21:38:24.455Z by `npm run uat`._

## a2ui-submit-releases-edits

Source: `tests/manual/a2ui/uat-submit-releases-edits.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The typed value survives the click, and the next reply writes over it in the same field | pass | ok {"input_value":{"label":"Display name","value":"Grace"}}; ok {"text":"Saved as Grace"}; ok {"composer_exact":"[a2ui action] saveProfile (surface profile)\n\nSave the profile\n\ncontext:\n```json\n{\n  \"name\": \"Grace\"\n}\n```\n\ndata model:\n```...; ok {"input_value":{"label":"Display name","value":"Grace"}}; ok {"input_value":{"label":"Display name","value":"Ada Lovelace"}}; ok {"text":"Saved as Ada Lovelace"}; ok {"count":{"selector":"[data-uat-fence] > div","equals":1}} |
| A click the checks refuse sends nothing and the edit still outranks a later reply | pass | ok {"text":"Use at least five characters."}; ok {"composer_empty":true}; ok {"input_value":{"label":"Display name","value":"Gr"}}; ok {"text":"Updated by the agent"}; ok {"count":{"selector":"[data-uat-fence] > div","equals":1}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-submit-releases-edits at 1280x820 in dark](shots/uat-submit-releases-edits.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-submit-releases-edits.1280x820.dark.png`

![a2ui-submit-releases-edits at 390x844 in dark](shots/uat-submit-releases-edits.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-submit-releases-edits.390x844.dark.png`

