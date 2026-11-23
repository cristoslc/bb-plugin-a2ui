# UAT report

_Generated 2026-11-23T13:24:22.069Z by `npm run uat`._

## a2ui-a11y-description

Source: `tests/manual/a2ui/uat-a11y-description.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Image exposes its description as alt, AudioPlayer and Video expose theirs as aria-label | pass | ok {"count":{"selector":"img","equals":1}}; ok {"attr":{"selector":"img","name":"alt","equals":"Harbor at dawn"}}; ok {"attr":{"selector":"audio[src=\"https://example.com/media/harbor-notes.mp3\"]","name":"aria-label","equals":"Notes recorded at the harbor"}}; ok {"attr":{"selector":"video[src=\"https://example.com/media/harbor-clip.mp4\"]","name":"aria-label","equals":"Harbor walkthrough"}} |
| An AudioPlayer and a Video without a description carry no aria-label and no empty label is left behind | pass | ok {"count":{"selector":"audio","equals":2}}; ok {"count":{"selector":"audio[aria-label]","equals":1}}; ok {"count":{"selector":"audio[aria-label=\"\"]","equals":0}}; ok {"count":{"selector":"video","equals":2}}; ok {"count":{"selector":"video[aria-label]","equals":1}}; ok {"count":{"selector":"video[aria-label=\"\"]","equals":0}}; ok {"count":{"selector":"[aria-label=\"\"]","equals":0}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-a11y-description at 1280x820 in dark](shots/uat-a11y-description.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-a11y-description.1280x820.dark.png`

![a2ui-a11y-description at 390x844 in dark](shots/uat-a11y-description.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-a11y-description.390x844.dark.png`

