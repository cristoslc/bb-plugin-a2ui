# UAT report

_Generated 2026-11-23T04:20:11.854Z by `npm run uat`._

## a2ui-diagnostics

Source: `tests/manual/a2ui/uat-diagnostics.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A version mismatch draws its named diagnostic instead of a surface | pass | ok {"text":"no surface"}; ok {"diagnostic":{"code":"VERSION_MISMATCH","message_contains":"Expected version \"1.0\""}} |
| A button whose check fails stays blocked and sends nothing | pass | ok {"text":"Pick a destination."}; ok {"button_blocked":{"label":"Plan it","message":"Pick a destination."}}; ok {"composer_empty":true} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-diagnostics at 1280x820 in dark](shots/uat-diagnostics.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-diagnostics.1280x820.dark.png`

![a2ui-diagnostics at 390x844 in dark](shots/uat-diagnostics.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-diagnostics.390x844.dark.png`

