# UAT report

_Generated 2026-11-23T16:49:47.104Z by `npm run uat`._

## a2ui-streaming-to-closed

Source: `tests/manual/a2ui/uat-streaming-to-closed.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A streaming partial reply draws what arrived, and a closed full reply replaces it with no diagnostic | pass | ok {"text":"no surface"}; ok {"text":"Draft plan"}; ok {"text":"Three stops so far."}; ok {"text":"1 surface"}; ok {"text_not":"MALFORMED_MESSAGE"}; ok {"text_not":"waiting for a surface"}; ok {"text":"Final plan"}; ok {"text":"Four stops are booked."}; ok {"text":"The last stop is the coach station."}; ok {"text_not":"Draft plan"}; ok {"text_not":"Three stops so far."}; ok {"text":"1 surface"}; ok {"count":{"selector":"[data-uat-fence] li","equals":0}}; ok {"count":{"selector":"[data-uat-fence] > div","equals":1}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-streaming-to-closed at 1280x820 in dark](shots/uat-streaming-to-closed.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-streaming-to-closed.1280x820.dark.png`

![a2ui-streaming-to-closed at 390x844 in dark](shots/uat-streaming-to-closed.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-streaming-to-closed.390x844.dark.png`

