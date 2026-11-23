# UAT report

_Generated 2026-11-23T21:38:24.455Z by `npm run uat`._

## a2ui-roundtrip-form

Source: `tests/manual/a2ui/uat-roundtrip-form.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| The filled form sends its exact message, then the pushed reply changes the heading and the model without losing the typed values | pass | ok {"composer_exact":"[a2ui action] submitRequest (surface contact)\n\nSubmit the request\n\ncontext:\n```json\n{\n  \"name\": \"Ada\"\n}\n```\n\ndata model:\n`...; ok {"text":"Request received"}; ok {"text_not":"Send a message"}; ok {"text":"Status: received"}; ok {"text":"1 surface"}; ok {"count":{"selector":"[data-uat-fence] > div","equals":1}}; ok {"input_value":{"label":"Your name","value":"Ada"}}; ok {"input_value":{"label":"Topic","value":"Access"}} |
| The suite never reaches the network | pass | ok no undeclared external requests |

### Screenshots

![a2ui-roundtrip-form at 1280x820 in dark](shots/uat-roundtrip-form.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-roundtrip-form.1280x820.dark.png`

![a2ui-roundtrip-form at 390x844 in dark](shots/uat-roundtrip-form.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-roundtrip-form.390x844.dark.png`

