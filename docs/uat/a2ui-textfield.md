# UAT report

_Generated 2026-11-23T13:17:45.758Z by `npm run uat`._

## a2ui-textfield

Source: `tests/manual/a2ui/uat-textfield.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| longText draws a three-row textarea and real typing writes the bound value | pass | ok {"count":{"selector":"textarea","equals":1}}; ok {"attr":{"selector":"textarea[placeholder=\"Write the closing paragraph here\"]","name":"rows","equals":"3"}}; ok {"input_value":{"label":"Draft notes","value":"The museum closes at six on Sundays."}}; ok {"text":"Notes bound: The museum closes at six on Sundays."} |
| obscured draws type=password and real typing writes the bound value | pass | ok {"attr":{"selector":"input[type=\"password\"]","name":"type","equals":"password"}}; ok {"input_value":{"label":"Vault phrase","value":"amber-lantern-42"}}; ok {"text":"Phrase bound: amber-lantern-42"} |
| number draws type=number and real typing writes the bound value | pass | ok {"attr":{"selector":"input[type=\"number\"]","name":"type","equals":"number"}}; ok {"input_value":{"label":"Badge count","value":"42"}}; ok {"text":"Badge bound: 42"} |
| A placeholder is present on the native input as its placeholder attribute | pass | ok {"attr":{"selector":"input[placeholder=\"Choose a phrase only you know\"]","name":"placeholder","equals":"Choose a phrase only you know"}} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-textfield at 1280x820 in dark](shots/uat-textfield.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-textfield.1280x820.dark.png`

![a2ui-textfield at 390x844 in dark](shots/uat-textfield.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-textfield.390x844.dark.png`

