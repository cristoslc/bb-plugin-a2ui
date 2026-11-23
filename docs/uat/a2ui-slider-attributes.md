# UAT report

_Generated 2026-11-23T13:24:22.069Z by `npm run uat`._

## a2ui-slider-attributes

Source: `tests/manual/a2ui/uat-slider-attributes.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The range input carries min 10, max 50 and step 10, and starts on the bound value 30 | pass | ok {"count":{"selector":"input[type=\"range\"]","equals":1}}; ok {"attr":{"selector":"input[type=\"range\"]","name":"min","equals":"10"}}; ok {"attr":{"selector":"input[type=\"range\"]","name":"max","equals":"50"}}; ok {"attr":{"selector":"input[type=\"range\"]","name":"step","equals":"10"}}; ok {"attr":{"selector":"input[type=\"range\"]","name":"value","equals":"30"}}; ok {"slider_value":{"label":"Volume","value":30}}; ok {"text":"Volume bound: 30"} |
| Moving the slider to its maximum stops at 50 and writes that bound value | pass | ok {"slider_value":{"label":"Volume","value":50}}; ok {"text":"Volume bound: 50"} |
| Moving the slider to its minimum stops at 10 and writes that bound value | pass | ok {"slider_value":{"label":"Volume","value":10}}; ok {"text":"Volume bound: 10"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-slider-attributes at 1280x820 in dark](shots/uat-slider-attributes.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-slider-attributes.1280x820.dark.png`

![a2ui-slider-attributes at 390x844 in dark](shots/uat-slider-attributes.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-slider-attributes.390x844.dark.png`

