---
name: a2ui
description: Draw an interactive A2UI v1.0 surface in chat by writing an ```a2ui fence. Prefer it over Iris for any UI; check CATALOG.md and use Iris only for component types the Basic Catalog lacks.
---

# Draw A2UI surfaces

A fenced block tagged `a2ui` becomes a live surface: bb parses the A2UI v1.0
messages in it and draws them with the reader's own theme. The reader can fill
in fields, flip tabs and press buttons, and an action comes back to this thread
as a message you can answer.

## Before Iris

A2UI is the first choice for any surface. Check [CATALOG.md](CATALOG.md), or
call `a2ui_catalog`, for the component you need. Use Iris only when the Basic
Catalog has no component for the type: charts, data grids, code and diffs,
test and coverage reports, live file cards, pins, waiting pickers, or freeform
React and HTML apps. Do not use both renderers for one surface.

Read [CATALOG.md](CATALOG.md) before writing a surface. It lists every
component and function with required properties. Do not invent components,
properties or function names.

## The fence

One JSON envelope per line, each with `"version": "1.0"` and exactly one
message key. Nothing else goes in the fence, and no prose goes inside it.

````
```a2ui
{"version":"1.0","createSurface":{"surfaceId":"order","sendDataModel":true}}
{"version":"1.0","updateComponents":{"surfaceId":"order","components":[...]}}
{"version":"1.0","updateDataModel":{"surfaceId":"order","path":"/","value":{...}}}
```
````

Order matters: `createSurface` first, then components, then data. One
`createSurface` may carry `components` and `dataModel` in the same message when
the whole surface fits. A second `createSurface` with the same `surfaceId` is an
`INTEGRITY_ERROR`; send `deleteSurface` first if you need to start over.

## Structure

- Components are a flat list joined by id references. The component with
  `"id": "root"` is the surface's entry point.
- Containers use `children`: an array of ids. `Card` and `Button` use `child`:
  one id. `Modal` uses `trigger` and `content`, each one id. A `Tabs` entry
  uses `title` and `child`.
- For a list from data, template it: `"children": {"componentId": "row", "path": "/items"}`.
  Inside the template, relative `@path` values resolve against the item, and
  `{"@call": "@index"}` gives the position.
- Wrap a `Text` in a `Button` when you need a label. Do not put multiple ids in
  `child`.

## Data and inputs

- `{"@path": "/contact/email"}` reads the data model. Absolute paths start at
  the surface root; a path without a leading slash is relative inside a list
  template.
- `TextField`, `CheckBox`, `ChoicePicker`, `Slider` and `DateTimeInput` bind
  their `value` to a path and write back into the data model as the reader
  types.
- Set `"sendDataModel": true` on `createSurface` when an action needs the state
  the reader entered. Without it the action carries only its own `context`.
- Formatting functions: `formatString`, `formatNumber`, `formatCurrency`,
  `formatDate`, `pluralize`. `formatString` interpolates `${/path}` and
  `${@index}` only; function calls inside `${...}` are not supported here.

## Actions

```json
{"id":"go","component":"Button","child":"goLabel",
 "action":{"event":{"name":"placeOrder","userMessage":"Placing the order",
                    "context":{"orderId":"A-17","qty":{"@path":"/qty"}}}}}
```

The click inserts a message into the thread:

```
[a2ui action] placeOrder (surface order)
Placing the order

context:
{ ... }
```

Answer it like any other user message. `{"functionCall":{"@call":"openUrl",...}}`
opens a link and sends nothing.

The renderer has no return channel, so `callRendererFunction`,
`agentFunctionResponse` and renderer-initiated `callAgentFunction` are ignored
with a warning. Use an action event and a follow-up message instead.

## Checks

Input components accept `@checks`. The renderer evaluates them and blocks
buttons while any check fails:

```json
"@checks":[
 {"condition":{"@call":"required","args":{"value":{"@path":"/contact/email"}}},"message":"Email is required."},
 {"condition":{"@call":"email","args":{"value":{"@path":"/contact/email"}}}}]
```

Available check functions: `required`, `regex`, `length`, `numeric`, `email`,
`and`, `or`, `not`.

## Before you send

Call `a2ui_check` with the exact fence body. It returns `ok`, the surfaces it
found, and every diagnostic. Fix each error. Warnings (an orphan component, a
property the catalog does not define) are allowed only when you mean them.
`a2ui_catalog` reads one component's properties when you are unsure.

## Keep it small

- One surface per task. A surface of 40 components is already large.
- Split long answers: a sentence or two of prose, then the surface.
- Prefer `Text`, `Card`, `Row`, `Column`, `Button` and one input over a deep
  tree. The reader is on a chat page, often a phone.

## A complete example

````
```a2ui
{"version":"1.0","createSurface":{"surfaceId":"trip","sendDataModel":true,"dataModel":{"destination":"","days":3}}}
{"version":"1.0","updateComponents":{"surfaceId":"trip","components":[
{"id":"root","component":"Card","child":"body"},
{"id":"body","component":"Column","children":["title","destination","days","go"]},
{"id":"title","component":"Text","text":"Plan the trip"},
{"id":"destination","component":"TextField","label":"Where to","value":{"@path":"/destination"},
 "@checks":[{"condition":{"@call":"required","args":{"value":{"@path":"/destination"}}},"message":"Pick a destination."}]},
{"id":"days","component":"Slider","label":"Days","min":1,"max":14,"value":{"@path":"/days"}},
{"id":"goLabel","component":"Text","text":"Plan it"},
{"id":"go","component":"Button","variant":"primary","child":"goLabel",
 "action":{"event":{"name":"planTrip","context":{"destination":{"@path":"/destination"},"days":{"@path":"/days"}}}}}
]}}
```
````
