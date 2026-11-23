# UAT report

_Generated 2026-11-23T13:01:52.421Z by `npm run uat`._

## a2ui-proto-duplicate-surface

Source: `tests/manual/a2ui/uat-proto-duplicate-surface.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Recreating a live surface shows INTEGRITY_ERROR and keeps the first one | pass | ok {"text":"First draw"}; ok {"text":"1 surface"}; ok {"diagnostic":{"code":"INTEGRITY_ERROR","message_contains":"Surface \"panel\" already exists"}} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-duplicate-surface at 1280x820 in dark](shots/uat-proto-duplicate-surface.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-duplicate-surface.1280x820.dark.png`

![a2ui-proto-duplicate-surface at 390x844 in dark](shots/uat-proto-duplicate-surface.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-duplicate-surface.390x844.dark.png`

