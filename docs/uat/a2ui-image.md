# UAT report

_Generated 2026-11-23T13:17:44.014Z by `npm run uat`._

## a2ui-image

Source: `tests/manual/a2ui/uat-image.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The Image element carries its exact src, its description as alt, and object-fit cover | pass | ok {"count":{"selector":"img[alt=\"Harbor at dawn\"]","equals":1}}; ok {"attr":{"selector":"img[alt=\"Harbor at dawn\"]","name":"src","equals":"https://example.com/media/harbor-dawn.png"}}; ok {"attr":{"selector":"img[alt=\"Harbor at dawn\"]","name":"alt","equals":"Harbor at dawn"}}; ok {"style":{"selector":"img[alt=\"Harbor at dawn\"]","property":"object-fit","equals":"cover"}}; ok {"text":"Photo of the week"}; ok {"text_not":"This renderer only loads http and https images."} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-image at 1280x820 in dark](shots/uat-image.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-image.1280x820.dark.png`

![a2ui-image at 390x844 in dark](shots/uat-image.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-image.390x844.dark.png`

