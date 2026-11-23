# UAT report

_Generated 2026-11-23T13:01:58.128Z by `npm run uat`._

## a2ui-proto-delete

Source: `tests/manual/a2ui/uat-proto-delete.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| After deleteSurface the surface text is gone and no surface remains | pass | ok {"text":"no surface"}; ok {"text_not":"Apartment for rent"}; ok {"text_not":"1 surface"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-proto-delete at 1280x820 in dark](shots/uat-proto-delete.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-proto-delete.1280x820.dark.png`

![a2ui-proto-delete at 390x844 in dark](shots/uat-proto-delete.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-proto-delete.390x844.dark.png`

