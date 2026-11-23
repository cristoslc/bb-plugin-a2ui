# UAT report

_Generated 2026-11-23T13:23:27.204Z by `npm run uat`._

## a2ui-action-user-message

Source: `tests/manual/a2ui/uat-action-user-message.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The userMessage line appears between the header and the context block | pass | ok {"composer_exact":"[a2ui action] reserveRoom (surface rooms)\n\nHold room 12B until Friday\n\ncontext:\n```json\n{\n  \"room\": \"12B\"\n}\n```"} |
| The same action without userMessage jumps from the header to the context | pass | ok {"composer_exact":"[a2ui action] reserveRoom (surface rooms)\n\ncontext:\n```json\n{\n  \"room\": \"12B\"\n}\n```"}; ok {"text_not":"Hold room 12B until Friday"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-action-user-message at 1280x820 in dark](shots/uat-action-user-message.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-action-user-message.1280x820.dark.png`

![a2ui-action-user-message at 390x844 in dark](shots/uat-action-user-message.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-action-user-message.390x844.dark.png`

