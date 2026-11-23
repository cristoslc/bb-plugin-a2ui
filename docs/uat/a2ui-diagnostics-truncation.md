# UAT report

_Generated 2026-11-23T13:24:22.069Z by `npm run uat`._

## a2ui-diagnostics-truncation

Source: `tests/manual/a2ui/uat-diagnostics-truncation.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The list shows six diagnostic rows plus one "and 2 more" line | pass | ok {"count":{"selector":"[data-uat-fence] li","equals":7}}; ok {"text":"and 2 more"}; ok {"diagnostic":{"code":"MALFORMED_MESSAGE","message_contains":"Line 1 is not valid JSON"}}; ok {"text":"Line 6 is not valid JSON"}; ok {"text_not":"Line 7 is not valid JSON"}; ok {"text_not":"Line 8 is not valid JSON"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-diagnostics-truncation at 1280x820 in dark](shots/uat-diagnostics-truncation.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-diagnostics-truncation.1280x820.dark.png`

![a2ui-diagnostics-truncation at 390x844 in dark](shots/uat-diagnostics-truncation.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-diagnostics-truncation.390x844.dark.png`

