# UAT report

_Generated 2026-11-23T16:48:45.446Z by `npm run uat`._

## a2ui-two-actions

Source: `tests/manual/a2ui/uat-two-actions.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Approve then Reject leaves both exact messages in the composer, in that order | pass | ok {"text":"Review the request"}; ok {"composer_exact":"[a2ui action] decide (surface review)\n\ncontext:\n```json\n{\n  \"decision\": \"approve\"\n}\n```\n\n[a2ui action] decide (surface review... |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-two-actions at 1280x820 in dark](shots/uat-two-actions.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-two-actions.1280x820.dark.png`

![a2ui-two-actions at 390x844 in dark](shots/uat-two-actions.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-two-actions.390x844.dark.png`

