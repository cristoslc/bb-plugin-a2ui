# UAT report

_Generated 2026-11-23T04:20:11.854Z by `npm run uat`._

## a2ui-binding

Source: `tests/manual/a2ui/uat-binding.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Moving the slider writes the bound data model and the bound text follows | pass | ok {"slider_value":{"label":"Days","value":7}}; ok {"text":"Days: 7"} |
| The button inserts the formatted action message into the composer | pass | ok {"composer_exact":"[a2ui action] bookTrip (surface trip)\n\nBook the trip\n\ncontext:\n```json\n{\n  \"days\": 7\n}\n```\n\ndata model:\n```json\n{\n  \"days... |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-binding at 1280x820 in dark](shots/uat-binding.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-binding.1280x820.dark.png`

![a2ui-binding at 390x844 in dark](shots/uat-binding.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-binding.390x844.dark.png`

