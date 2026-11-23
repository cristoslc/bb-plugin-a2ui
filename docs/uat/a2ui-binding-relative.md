# UAT report

_Generated 2026-11-23T13:23:27.204Z by `npm run uat`._

## a2ui-binding-relative

Source: `tests/manual/a2ui/uat-binding-relative.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Each list item reads its own city and nested hotel name | pass | ok {"text":"Oslo harbor"}; ok {"text":"Fjord Inn"}; ok {"text":"Bergen harbor"}; ok {"text":"Bryggen House"}; ok {"text_not":"undefined"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-binding-relative at 1280x820 in dark](shots/uat-binding-relative.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-binding-relative.1280x820.dark.png`

![a2ui-binding-relative at 390x844 in dark](shots/uat-binding-relative.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-binding-relative.390x844.dark.png`

