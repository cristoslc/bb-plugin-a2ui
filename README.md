# bb-plugin-a2ui

Draws [A2UI v1.0](https://a2ui.org/specification/v1.0-a2ui/) surfaces in bb chat. The agent writes declarative JSON, the reply becomes a card the reader can fill in and click.

An `a2ui` fence holds one JSON envelope per line:

````
```a2ui
{"version":"1.0","createSurface":{"surfaceId":"order","sendDataModel":true}}
{"version":"1.0","updateComponents":{"surfaceId":"order","components":[
  {"id":"root","component":"Card","child":"body"},
  {"id":"body","component":"Column","children":["qty","go"]},
  {"id":"qty","component":"Slider","label":"Quantity","min":1,"max":9,"value":{"@path":"/qty"}},
  {"id":"goLabel","component":"Text","text":"Order"},
  {"id":"go","component":"Button","variant":"primary","child":"goLabel",
   "action":{"event":{"name":"order","context":{"qty":{"@path":"/qty"}}}}}
]}}
{"version":"1.0","updateDataModel":{"surfaceId":"order","path":"/","value":{"qty":2}}}
```
````

The reader moves the slider and presses Order. The plugin inserts this into the composer:

```
[a2ui action] order (surface order)

context:
{ "qty": 3 }

data model:
{ "qty": 3 }
```

The agent answers that message like any other, often with an `updateComponents` fence that changes the same surface.

## What is supported

- All four surface messages: `createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`, streamed line by line so a surface fills in while the reply is still arriving.
- Every component in the vendored A2UI v1.0 Basic Catalog: `Text`, `Image`, `Icon`, `Video`, `AudioPlayer`, `Row`, `Column`, `List`, `Card`, `Tabs`, `Modal`, `Divider`, `Button`, `TextField`, `CheckBox`, `ChoicePicker`, `Slider`, `DateTimeInput`.
- Data bindings (`{"@path": "..."}`), list templates with `@index` and relative paths, two-way input binding, and `sendDataModel`.
- Catalog functions: `required`, `regex`, `length`, `numeric`, `email`, `and`, `or`, `not`, `formatString`, `formatNumber`, `formatCurrency`, `formatDate`, `pluralize`, and `openUrl` as a button action.
- `@checks` on inputs. The renderer blocks a button while any check on the surface fails and shows the rule's message.

## What is not supported

- `callRendererFunction`, `agentFunctionResponse`, and renderer-initiated `callAgentFunction`. A chat fence has no return channel; the renderer reports a warning and ignores them.
- Inline catalogs and per-component `@catalogId`. The renderer draws the Basic Catalog for every surface and warns when a surface declares another catalog.
- Function calls inside `formatString`'s `${...}` expressions. Paths and `@index` work; anything else is an error.
- Executable code. Nothing from the fence is evaluated as JavaScript.

## Install and develop

```
cd ~/code/bb-plugin-a2ui
npm install
bb plugin build
bb plugin install . --yes
bb plugin dev          # rebuild and reload on save
```

To see a surface, send yourself a reply containing an `a2ui` fence with at least a `createSurface` line, or ask an agent to draw one; the bundled skill teaches it.

## Refresh the catalog

Replace `catalog/basic.v1.json` with the current file from `a2ui-project/a2ui`, then:

```
npm run catalog:build
npm run check
```

That regenerates the tool's catalog module and the agent-facing component index. A component the renderer cannot draw fails typecheck.

## Tests

```
npm run check   # tsc --noEmit && vitest run
```

The suite covers framing, reduction, pointers, bindings, checks, actions, and the catalog-aware validator. The test command is also declared in `AGENTS.md`.

## Layout

| Path | What lives there |
| --- | --- |
| `app.tsx` | the fence renderer, header, diagnostics |
| `server.ts` | `a2ui_check` and `a2ui_catalog` agent tools |
| `server/validate.ts` | catalog-aware validation behind `a2ui_check` |
| `shared/protocol.ts` | framing, surfaces, bindings, checks, actions |
| `shared/action-message.ts` | the message an action inserts |
| `ui/render.tsx` | one renderer per Basic Catalog component |
| `catalog/` | vendored catalog and its generated module |
| `skills/a2ui/` | agent instructions and the generated catalog index |
| `docs/` | architecture, workflows, UX notes, ADRs, plans |
