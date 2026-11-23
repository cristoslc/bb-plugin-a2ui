# UAT report

_Generated 2026-11-23T16:49:11.286Z by `npm run uat`._

## a2ui-unicode

Source: `tests/manual/a2ui/uat-unicode.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A name with accents, an emoji and CJK characters reaches the composer exactly | pass | ok {"text":"Café Zürich 🚀 東京"}; ok {"input_value":{"label":"Your name","value":"Renée Ångström 🚀 李雷"}}; ok {"composer_exact":"[a2ui action] greet (surface greeting)\n\nSend greeting\n\ncontext:\n```json\n{\n  \"name\": \"Renée Ångström 🚀 李雷\",\n  \"greeting\": \"... |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-unicode at 1280x820 in dark](shots/uat-unicode.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-unicode.1280x820.dark.png`

![a2ui-unicode at 390x844 in dark](shots/uat-unicode.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-unicode.390x844.dark.png`

