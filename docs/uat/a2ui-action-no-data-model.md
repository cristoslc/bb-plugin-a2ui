# UAT report

_Generated 2026-11-23T13:23:27.204Z by `npm run uat`._

## a2ui-action-no-data-model

Source: `tests/manual/a2ui/uat-action-no-data-model.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| With sendDataModel false the message ends after the context block | pass | ok {"composer_exact":"[a2ui action] submitSurvey (surface survey)\n\ncontext:\n```json\n{\n  \"seat\": \"aisle\"\n}\n```"} |
| With sendDataModel true the whole model follows the context block | pass | ok {"composer_exact":"[a2ui action] submitSurvey (surface survey)\n\ncontext:\n```json\n{\n  \"seat\": \"aisle\"\n}\n```\n\ndata model:\n```json\n{\n  \"seat\":... |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-action-no-data-model at 1280x820 in dark](shots/uat-action-no-data-model.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-action-no-data-model.1280x820.dark.png`

![a2ui-action-no-data-model at 390x844 in dark](shots/uat-action-no-data-model.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-action-no-data-model.390x844.dark.png`

