# UAT report

_Generated 2026-11-23T13:23:27.204Z by `npm run uat`._

## a2ui-binding-absolute

Source: `tests/manual/a2ui/uat-binding-absolute.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A Text inside a list template binds the root headline, not the item headline | pass | ok {"text":"Winter schedule"}; ok {"text_not":"Oslo stop"}; ok {"text_not":"Bergen stop"} |
| An action context resolves an absolute path to the edited root value | pass | ok {"composer_exact":"[a2ui action] saveBooking (surface tripPlan)\n\nSave the winter plan\n\ncontext:\n```json\n{\n  \"headline\": \"Winter schedule\",\n  \"tr... |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-binding-absolute at 1280x820 in dark](shots/uat-binding-absolute.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-binding-absolute.1280x820.dark.png`

![a2ui-binding-absolute at 390x844 in dark](shots/uat-binding-absolute.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-binding-absolute.390x844.dark.png`

