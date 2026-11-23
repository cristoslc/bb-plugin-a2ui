# Architecture

## Context

bb is the host application. It renders thread transcripts and calls plugin code in two places: a server bundle in the daemon and an app bundle in the renderer process. This plugin is one of those plugins. It has no service of its own, makes no network requests, and stores no data.

```
agent reply ──> bb markdown renderer
                    │  sees ```a2ui
                    ▼
              app.tsx fence renderer  ──> shared/protocol.ts  (reduce)
                    │                          │
                    ▼                          ▼
              ui/render.tsx  ──> bb components + theme
                    │
                    │ action
                    ▼
              composer.insert ──> agent's next turn
```

## Containers

| Container | Entry | Responsibility |
| --- | --- | --- |
| bb daemon | `dist/server.js` from `server.ts` | Registers `a2ui_check` and `a2ui_catalog`; validates streams against the vendored catalog. |
| bb renderer | `dist/app.js` from `app.tsx` | Registers the `a2ui` code-fence renderer, draws surfaces, turns an action into composer text. |
| Shared module | `shared/` | Framing, reduction, bindings, checks, actions. Bundled into both sides from one source. |

## Data flow

1. The agent writes one JSON envelope per line inside an `a2ui` fence.
2. bb calls the fence component with `code` (the body so far), `status`, and `message`.
3. `parseStream` frames the body. A trailing unfinished line is pending while streaming and an error once the reply closes.
4. `reduceStream` applies `createSurface`, `updateComponents`, `updateDataModel` and `deleteSurface` to a list of surfaces, collecting diagnostics.
5. `SurfaceView` walks from the `root` component, resolving `@path` bindings against the surface data model plus any edits the reader made in this card.
6. An action becomes text through `formatActionMessage` and is inserted into the thread composer. The agent sees an ordinary user message.

## Why this shape

The plugin reuses bb's own fence slot, so it needs no new host API: a language claim is enough. The reducer is pure and transport-free, so the same code answers `a2ui_check` on the server and `reduceStream` in the renderer, and the tests exercise exactly the paths that ship. See `adr/0001-code-fence-renderer.md`.

## Boundaries

- No code from the fence is evaluated. The renderer draws what the catalog defines and reports what it does not.
- Media URLs are limited to `http` and `https`.
- Writes go to the composer, never straight to the agent. The reader sees what will be sent.
- Validation lives in two places by design: protocol errors in `shared/protocol.ts`, catalog conformance in `server/validate.ts`. Only the latter is allowed to know the catalog contents.
