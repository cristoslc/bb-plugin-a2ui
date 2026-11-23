# UAT report

_Generated 2026-11-23T13:17:45.758Z by `npm run uat`._

## a2ui-choice-multiple

Source: `tests/manual/a2ui/uat-choice-multiple.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Clicking two chips leaves both active and the bound list holds both values | pass | ok {"selected":{"label":"Workshop extras","option":"Espresso bar","value":true}}; ok {"selected":{"label":"Workshop extras","option":"Quiet room","value":true}}; ok {"selected":{"label":"Workshop extras","option":"Late checkout","value":false}}; ok {"text":"Extras bound: espresso-bar,quiet-room"} |
| Clicking an active chip removes only that value and leaves the other bound | pass | ok {"selected":{"label":"Workshop extras","option":"Espresso bar","value":false}}; ok {"selected":{"label":"Workshop extras","option":"Quiet room","value":true}}; ok {"text":"Extras bound: quiet-room"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-choice-multiple at 1280x820 in dark](shots/uat-choice-multiple.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-choice-multiple.1280x820.dark.png`

![a2ui-choice-multiple at 390x844 in dark](shots/uat-choice-multiple.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-choice-multiple.390x844.dark.png`

