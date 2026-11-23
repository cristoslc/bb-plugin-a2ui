# UAT report

_Generated 2026-11-23T13:02:15.043Z by `npm run uat`._

## a2ui-proto-checks-basic

Source: `tests/manual/a2ui/uat-proto-checks-basic.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Every failing single-value check shows its message and blocks the send | pass | ok {"text":"Name is required."}; ok {"text":"Code must be three capital letters."}; ok {"text":"PIN must be four to six characters."}; ok {"text":"Amount must be five to nine."}; ok {"text":"Enter an email address."}; ok {"button_blocked":{"label":"Create account","message":"Fix the highlighted fields before sending."}}; ok {"composer_empty":true} |
| Moving the slider into range clears the numeric message and still blocks | pass | ok {"text_not":"Amount must be five to nine."}; ok {"slider_value":{"label":"Amount","value":7}}; ok {"text":"Name is required."}; ok {"button_blocked":{"label":"Create account","message":"Fix the highlighted fields before sending."}}; ok {"composer_empty":true} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-checks-basic at 1280x820 in dark](shots/uat-proto-checks-basic.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-checks-basic.1280x820.dark.png`

![a2ui-proto-checks-basic at 390x844 in dark](shots/uat-proto-checks-basic.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-checks-basic.390x844.dark.png`

