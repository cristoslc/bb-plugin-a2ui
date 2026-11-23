# UAT report

_Generated 2026-11-23T13:17:44.014Z by `npm run uat`._

## a2ui-video

Source: `tests/manual/a2ui/uat-video.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The video element carries its exact src and poster and shows native controls | pass | ok {"count":{"selector":"video","equals":1}}; ok {"attr":{"selector":"video","name":"src","equals":"https://example.com/media/harbor-clip.mp4"}}; ok {"attr":{"selector":"video","name":"poster","equals":"https://example.com/media/harbor-poster.jpg"}}; ok {"attr":{"selector":"video","name":"controls","equals":""}}; ok {"text":"Harbor walkthrough"}; ok {"text_not":"This renderer only loads http and https videos."} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-video at 1280x820 in dark](shots/uat-video.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-video.1280x820.dark.png`

![a2ui-video at 390x844 in dark](shots/uat-video.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-video.390x844.dark.png`

