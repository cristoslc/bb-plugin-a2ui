# UAT report

_Generated 2026-11-23T16:58:28.325Z by `npm run uat`._

## a2ui-keyboard-journey

Source: `tests/manual/a2ui/uat-keyboard-journey.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Tab reaches both fields and the submit button, typing fills them, and Enter sends the exact message with no click | pass | ok action press Tab (press Tab: focus moved from the page to button "Source"); ok action press Tab (press Tab: focus moved from button "Source" to input in "Full name"); ok action type_focused "Ada Lovelace" (type_focused "Ada Lovelace" into input in "Full name"); ok action press Tab (press Tab: focus moved from input in "Full name" to input in "Email"); ok action type_focused "ada@example.com" (type_focused "ada@example.com" into input in "Email"); ok action press Tab (press Tab: focus moved from input in "Email" to button "Send ticket"); ok {"input_value":{"label":"Full name","value":"Ada Lovelace"}}; ok {"input_value":{"label":"Email","value":"ada@example.com"}}; ok {"composer_empty":true}; ok action press Enter (press Enter: focus moved from button "Send ticket" to button "Send ticket"); ok {"composer_exact":"[a2ui action] sendTicket (surface ticket)\n\nSend the ticket\n\ncontext:\n```json\n{\n  \"name\": \"Ada Lovelace\",\n  \"email\": \"ada@ex...; ok {"no_page_errors":true} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-keyboard-journey at 1280x820 in dark](shots/uat-keyboard-journey.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-keyboard-journey.1280x820.dark.png`

![a2ui-keyboard-journey at 390x844 in dark](shots/uat-keyboard-journey.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-keyboard-journey.390x844.dark.png`

