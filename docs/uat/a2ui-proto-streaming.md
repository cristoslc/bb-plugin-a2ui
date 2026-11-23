# UAT report

_Generated 2026-11-23T13:01:39.462Z by `npm run uat`._

## a2ui-proto-streaming

Source: `tests/manual/a2ui/uat-proto-streaming.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A streaming reply draws its complete messages and one surface | pass | ok {"text":"Draft plan"}; ok {"text":"Three stops so far."}; ok {"text":"1 surface"}; ok {"text_not":"waiting for a surface"}; ok {"text_not":"MALFORMED_MESSAGE"} |
| The same half-written tail reports no error while the fence streams | pass | ok {"text_not":"not valid JSON"}; ok {"text_not":"and 1 more"}; ok {"text":"1 surface"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-streaming at 1280x820 in dark](shots/uat-proto-streaming.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-streaming.1280x820.dark.png`

![a2ui-proto-streaming at 390x844 in dark](shots/uat-proto-streaming.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-streaming.390x844.dark.png`

