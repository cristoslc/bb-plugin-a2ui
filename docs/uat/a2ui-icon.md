# UAT report

_Generated 2026-11-23T13:17:44.014Z by `npm run uat`._

## a2ui-icon

Source: `tests/manual/a2ui/uat-icon.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| locationOn draws the MapPin icon element and never prints the raw name | pass | ok {"count":{"selector":"[data-uat-icon=\"MapPin\"]","equals":1}}; ok {"attr":{"selector":"[data-uat-icon=\"MapPin\"]","name":"data-uat-icon","equals":"MapPin"}}; ok {"attr":{"selector":"[data-uat-icon=\"MapPin\"]","name":"aria-hidden","equals":"true"}}; ok {"text_not":"locationOn"} |
| An unmapped icon name draws the fallback chip with the name in text | pass | ok {"text":"sparkleTrail"}; ok {"attr":{"selector":"span[title]","name":"title","equals":"Icon not in this renderer's map"}}; ok {"count":{"selector":"[data-uat-icon=\"sparkleTrail\"]","equals":0}} |
| An svgPath icon draws one svg whose path carries the given d | pass | ok {"count":{"selector":"svg","equals":1}}; ok {"attr":{"selector":"svg","name":"viewBox","equals":"0 0 24 24"}}; ok {"attr":{"selector":"svg path","name":"d","equals":"M12 2L2 22h20z"}}; ok {"text":"Harbor toolbar"} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-icon at 1280x820 in dark](shots/uat-icon.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-icon.1280x820.dark.png`

![a2ui-icon at 390x844 in dark](shots/uat-icon.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-icon.390x844.dark.png`

