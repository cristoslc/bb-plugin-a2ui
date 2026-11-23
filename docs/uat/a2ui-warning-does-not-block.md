# UAT report

_Generated 2026-11-23T13:24:22.069Z by `npm run uat`._

## a2ui-warning-does-not-block

Source: `tests/manual/a2ui/uat-warning-does-not-block.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The duplicate warning is listed, the surface draws the last Text, and no alert blocks it | pass | ok {"diagnostic":{"code":"DUPLICATE_COMPONENT","message_contains":"appears twice"}}; ok {"text":"Service notice"}; ok {"text":"Second version of the notice"}; ok {"text_not":"First version of the notice"}; ok {"count":{"selector":"button:has([data-uat-markdown])","equals":1}}; ok {"count":{"selector":"[role=\"alert\"]","equals":0}} |
| Clicking the button with a duplicate warning present puts the exact action into the composer | pass | ok {"composer_exact":"[a2ui action] acknowledgeNotice (surface warn)\n\nAcknowledge the notice\n\ncontext:\n```json\n{}\n```"}; ok {"count":{"selector":"[role=\"alert\"]","equals":0}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-warning-does-not-block at 1280x820 in dark](shots/uat-warning-does-not-block.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-warning-does-not-block.1280x820.dark.png`

![a2ui-warning-does-not-block at 390x844 in dark](shots/uat-warning-does-not-block.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-warning-does-not-block.390x844.dark.png`

