# UAT report

_Generated 2026-11-23T13:01:54.441Z by `npm run uat`._

## a2ui-proto-media-url

Source: `tests/manual/a2ui/uat-proto-media-url.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A javascript image URL draws the refusal text instead of an image | pass | ok {"text":"Receipt preview"}; ok {"text":"This renderer only loads http and https images."}; ok {"text_not":"javascript:"}; ok {"text":"1 surface"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-media-url at 1280x820 in dark](shots/uat-proto-media-url.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-media-url.1280x820.dark.png`

![a2ui-proto-media-url at 390x844 in dark](shots/uat-proto-media-url.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-media-url.390x844.dark.png`

