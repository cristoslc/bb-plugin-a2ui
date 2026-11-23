# UAT report

_Generated 2026-11-23T13:17:45.758Z by `npm run uat`._

## a2ui-date-time

Source: `tests/manual/a2ui/uat-date-time.yaml` | theme dark

| Step | Result | Detail |
| --- | --- | --- |
| A date-only field is type=date, a time-only field is type=time, and both together is type=datetime-local | pass | ok {"attr":{"selector":"input[type=\"date\"]","name":"type","equals":"date"}}; ok {"attr":{"selector":"input[type=\"time\"]","name":"type","equals":"time"}}; ok {"attr":{"selector":"input[type=\"datetime-local\"]","name":"type","equals":"datetime-local"}} |
| Typing into the date-only field writes the bound date | pass | ok {"input_value":{"label":"Session date","value":"2027-01-02"}}; ok {"text":"Date bound: 2027-01-02"} |
| Typing into the time-only field writes the bound time | pass | ok {"input_value":{"label":"Session time","value":"07:30"}}; ok {"text":"Time bound: 07:30"} |
| Typing digits into the datetime field writes a new bound moment and keeps its time | pass | ok {"input_value":{"label":"Session moment","value":"2028-12-31T00:00"}}; ok {"text":"Moment bound: 2028-12-31T00:00"} |
| The suite never reaches the network | pass | ok no external requests |

### Screenshots

![a2ui-date-time at 1280x820 in dark](shots/uat-date-time.1280x820.dark.png)

1280x820, dark theme: `docs/uat/shots/uat-date-time.1280x820.dark.png`

![a2ui-date-time at 390x844 in dark](shots/uat-date-time.390x844.dark.png)

390x844, dark theme: `docs/uat/shots/uat-date-time.390x844.dark.png`

