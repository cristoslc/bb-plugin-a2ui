# UAT report

_Generated 2026-11-23T13:28:54.674Z by `npm run uat`._

## a2ui-action-openurl-refused

Source: `tests/manual/a2ui/uat-action-openurl-refused.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Clicking the unsafe link shows the refusal text and writes nothing to the composer | pass | ok {"text":"openUrl only accepts http and https URLs."}; ok {"popup_count":{"equals":0}}; ok {"composer_empty":{}}; ok {"text_not":"[a2ui action]"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-action-openurl-refused at 1280x820 in dark](shots/uat-action-openurl-refused.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-action-openurl-refused.1280x820.dark.png`

![a2ui-action-openurl-refused at 390x844 in dark](shots/uat-action-openurl-refused.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-action-openurl-refused.390x844.dark.png`

