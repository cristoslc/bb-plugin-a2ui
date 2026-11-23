# UAT report

_Generated 2026-11-23T13:17:44.014Z by `npm run uat`._

## a2ui-audio

Source: `tests/manual/a2ui/uat-audio.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The audio element carries its exact src and shows native controls | pass | ok {"count":{"selector":"audio","equals":1}}; ok {"attr":{"selector":"audio","name":"src","equals":"https://example.com/media/harbor-notes.mp3"}}; ok {"attr":{"selector":"audio","name":"controls","equals":""}}; ok {"text":"Harbor audio notes"}; ok {"text_not":"This renderer only loads http and https audio."} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-audio at 1280x820 in dark](shots/uat-audio.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-audio.1280x820.dark.png`

![a2ui-audio at 390x844 in dark](shots/uat-audio.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-audio.390x844.dark.png`

