# UAT report

_Generated 2026-11-23T13:23:27.204Z by `npm run uat`._

## a2ui-action-invalid

Source: `tests/manual/a2ui/uat-action-invalid.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The missing event name shows the renderer error and the composer stays empty | pass | ok {"text":"An event action needs a non-empty \"name\"."}; ok {"composer_empty":{}}; ok {"text_not":"[a2ui action]"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-action-invalid at 1280x820 in dark](shots/uat-action-invalid.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-action-invalid.1280x820.dark.png`

![a2ui-action-invalid at 390x844 in dark](shots/uat-action-invalid.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-action-invalid.390x844.dark.png`

