# UAT report

_Generated 2026-11-23T16:49:47.104Z by `npm run uat`._

## a2ui-update-keeps-modal

Source: `tests/manual/a2ui/uat-update-keeps-modal.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A pushed update leaves the open panel and its content on screen | pass | ok {"count":{"selector":"button[aria-label=\"Close\"]","equals":1}}; ok {"text":"Reservation confirmed"}; ok {"text":"Reservation summary"}; ok {"text":"Two guests on Dec 24."}; ok {"count":{"selector":"button[aria-label=\"Close\"]","equals":1}}; ok {"count":{"selector":"[data-uat-fence] > div","equals":1}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-update-keeps-modal at 1280x820 in dark](shots/uat-update-keeps-modal.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-update-keeps-modal.1280x820.dark.png`

![a2ui-update-keeps-modal at 390x844 in dark](shots/uat-update-keeps-modal.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-update-keeps-modal.390x844.dark.png`

