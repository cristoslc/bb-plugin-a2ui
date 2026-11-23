# UAT report

_Generated 2026-11-23T13:01:22.723Z by `npm run uat`._

## a2ui-proto-format-string

Source: `tests/manual/a2ui/uat-proto-format-string.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| formatString replaces both path placeholders with the data model | pass | ok {"text":"Hello Ada, you have 3 tasks."}; ok {"text_not":"${/name}"}; ok {"text":"1 surface"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-format-string at 1280x820 in dark](shots/uat-proto-format-string.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-format-string.1280x820.dark.png`

![a2ui-proto-format-string at 390x844 in dark](shots/uat-proto-format-string.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-format-string.390x844.dark.png`

