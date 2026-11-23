# Project navigation

## Starting points

- `PURPOSE.md` — one paragraph on the outcome.
- `README.md` — user-facing landing page.
- `AGENTS.md` — project rules and the test command.
- `docs/` — architecture, workflows, UX, domain vocabulary, ADRs.

## Where things live

- `app.tsx`, `ui/` — the fence renderer and the component renderers.
- `server.ts`, `server/` — agent tools and catalog validation.
- `shared/` — protocol and action message, used by both bundles and the tests.
- `catalog/` — vendored A2UI catalog and the generated module. Never hand-edit the JSON.
- `skills/a2ui/` — what agents read: rules plus the generated catalog index.
- `tests/` — vitest suites for framing, reduction, bindings, checks, actions and catalog validation.

## Conventions

- The test command is `npm run check`.
- One renderer per catalog component; a gap is a typecheck failure.
- Never evaluate fence content as code.
- Unsupported input produces a visible diagnostic, never a silent fallback.
- Copy is US English, no em dashes.
