# UAT report

_Generated 2026-11-23T13:01:46.462Z by `npm run uat`._

## a2ui-proto-format-values

Source: `tests/manual/a2ui/uat-proto-format-values.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The number, currency, date and plural formatters draw their expected text | pass | ok {"text":"1,234.5"}; ok {"text":"$1,234.50"}; ok {"text":"November 23, 2026"}; ok {"text":"entry"}; ok {"text":"entries"}; ok {"text":"1 surface"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-format-values at 1280x820 in dark](shots/uat-proto-format-values.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-format-values.1280x820.dark.png`

![a2ui-proto-format-values at 390x844 in dark](shots/uat-proto-format-values.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-format-values.390x844.dark.png`

