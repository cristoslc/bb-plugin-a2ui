# UAT report

_Generated 2026-11-23T13:23:27.204Z by `npm run uat`._

## a2ui-binding-shared

Source: `tests/manual/a2ui/uat-binding-shared.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Typing in the first field writes the path the second field reads | pass | ok {"input_value":{"label":"Pickup point","value":"Lobby desk"}}; ok {"input_value":{"label":"Pickup echo","value":"Lobby desk"}}; ok {"text":"Lobby desk"} |
| Typing in the second field writes the same path and the first field follows | pass | ok {"input_value":{"label":"Pickup point","value":"North gate"}}; ok {"input_value":{"label":"Pickup echo","value":"North gate"}}; ok {"text":"North gate"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-binding-shared at 1280x820 in dark](shots/uat-binding-shared.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-binding-shared.1280x820.dark.png`

![a2ui-binding-shared at 390x844 in dark](shots/uat-binding-shared.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-binding-shared.390x844.dark.png`

