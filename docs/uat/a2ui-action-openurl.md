# UAT report

_Generated 2026-11-23T13:28:54.674Z by `npm run uat`._

## a2ui-action-openurl

Source: `tests/manual/a2ui/uat-action-openurl.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The button hands the exact URL to window.open and the composer stays empty | pass | ok {"popup_count":{"equals":1}}; ok {"popup_url":{"equals":"https://example.com/a2ui/handbook"}}; ok {"composer_empty":{}}; ok {"text_not":"openUrl only accepts http and https URLs."} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-action-openurl at 1280x820 in dark](shots/uat-action-openurl.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-action-openurl.1280x820.dark.png`

![a2ui-action-openurl at 390x844 in dark](shots/uat-action-openurl.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-action-openurl.390x844.dark.png`

