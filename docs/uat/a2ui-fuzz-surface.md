# UAT report

_Generated 2026-11-23T16:58:28.325Z by `npm run uat`._

## a2ui-fuzz-surface

Source: `tests/manual/a2ui/uat-fuzz-surface.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Forty seeded rounds touch every control kind, nothing throws, and the card still draws one surface with its title | pass | ok {"count":{"selector":"button[role=\"checkbox\"]","equals":2}}; ok {"count":{"selector":"input[type=\"range\"]","equals":2}}; ok {"count":{"selector":"input[type=\"text\"]","equals":2}}; ok action fuzz {"rounds":40,"seed":20261123} (fuzz: 40 rounds, seed 20261123, 9 button, 12 checkbox, 10 range, 9 text); ok {"no_page_errors":true}; ok {"text":"Fuzz playground"}; ok {"text":"1 surface"}; ok {"count":{"selector":"[data-uat-fence] > div","equals":1}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-fuzz-surface at 1280x820 in dark](shots/uat-fuzz-surface.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-fuzz-surface.1280x820.dark.png`

![a2ui-fuzz-surface at 390x844 in dark](shots/uat-fuzz-surface.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-fuzz-surface.390x844.dark.png`

