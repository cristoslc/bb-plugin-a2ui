# UAT report

_Generated 2026-11-23T13:24:22.069Z by `npm run uat`._

## a2ui-a11y-labels

Source: `tests/manual/a2ui/uat-a11y-labels.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| Each input, textarea, range and checkbox has a label element above it | pass | ok {"count":{"selector":"input:not([type=\"range\"])","equals":2}}; ok {"count":{"selector":"label input:not([type=\"range\"])","equals":2}}; ok {"count":{"selector":"textarea","equals":1}}; ok {"count":{"selector":"label textarea","equals":1}}; ok {"count":{"selector":"input[type=\"range\"]","equals":1}}; ok {"count":{"selector":"label input[type=\"range\"]","equals":1}}; ok {"count":{"selector":"[role=\"checkbox\"]","equals":3}}; ok {"count":{"selector":"label [role=\"checkbox\"]","equals":3}}; ok {"count":{"selector":"button[aria-label=\"Standard cabin\"]","equals":1}}; ok {"count":{"selector":"button[aria-label=\"Family cabin\"]","equals":1}} |
| The action button has no explicit name attribute and wraps the Text that names it | pass | ok {"count":{"selector":"button:has([data-uat-markdown])","equals":1}}; ok {"count":{"selector":"button:has([data-uat-markdown]):not([aria-label]):not([aria-labelledby])","equals":1}}; ok {"count":{"selector":"button:has([data-uat-markdown]) [data-uat-markdown]","equals":1}}; ok {"text":"Send request"}; ok {"count":{"selector":"button[aria-label=\"Send request\"]","equals":0}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-a11y-labels at 1280x820 in dark](shots/uat-a11y-labels.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-a11y-labels.1280x820.dark.png`

![a2ui-a11y-labels at 390x844 in dark](shots/uat-a11y-labels.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-a11y-labels.390x844.dark.png`

