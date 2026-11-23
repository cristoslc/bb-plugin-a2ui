# UAT report

_Generated 2026-11-23T16:48:45.446Z by `npm run uat`._

## a2ui-real-booking

Source: `tests/manual/a2ui/uat-real-booking.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Submitting the empty form shows both checks and sends nothing | pass | ok {"text":"Full name is required."}; ok {"text":"Enter a working email address."}; ok {"button_blocked":{"label":"Request this room","message":"Fix the highlighted fields before sending."}}; ok {"composer_empty":true} |
| Typing valid values clears both checks and sends the exact booking message | pass | ok {"input_value":{"label":"Full name","value":"Ada Lovelace"}}; ok {"input_value":{"label":"Email","value":"ada@example.com"}}; ok {"input_value":{"label":"Notes","value":"Late arrival, quiet room"}}; ok {"text_not":"Full name is required."}; ok {"text_not":"Enter a working email address."}; ok {"composer_exact":"[a2ui action] bookRoom (surface booking)\n\nBook the room\n\ncontext:\n```json\n{\n  \"name\": \"Ada Lovelace\",\n  \"email\": \"ada@examp... |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-real-booking at 1280x820 in dark](shots/uat-real-booking.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-real-booking.1280x820.dark.png`

![a2ui-real-booking at 390x844 in dark](shots/uat-real-booking.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-real-booking.390x844.dark.png`

