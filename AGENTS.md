# AGENTS.md

Project guidance for agents. Global rules in `~/.agents/AGENTS.md` still apply; this file adds what is specific to `bb-plugin-a2ui`. Start with `PURPOSE.md`, then `docs/agents-detail/project-navigation.md`.

## What this is

A bb plugin that renders [A2UI v1.0](https://a2ui.org/specification/v1.0-a2ui/) message streams in chat. An assistant reply carries an `a2ui` fenced block whose body is one JSON envelope per line. `app.tsx` registers a code-fence renderer; `shared/protocol.ts` reduces the stream into surfaces; `ui/render.tsx` draws them with bb's own components.

## Test command

```
npm run check
```

That is `tsc --noEmit` plus `vitest run`. Run it before every commit and quote the result in the PR body.

## Ground rules

- `catalog/basic.v1.json` is vendored upstream data. Never hand-edit it. Replace it from `a2ui-project/a2ui` and run `npm run catalog:build`, which regenerates `catalog/generated.ts` and `skills/a2ui/CATALOG.md`.
- The renderer never evaluates agent-supplied code. Every expression goes through `shared/protocol.ts`, which resolves JSON Pointers and a fixed function list. A new function is added there with a test.
- Fail loud. An unsupported message, function, component or URL scheme produces a visible diagnostic or error chip. Never fall back silently.
- `ui/render.tsx` must keep one renderer per Basic Catalog component. The `satisfies Record<CatalogComponentName, ComponentRenderer>` clause makes a missing renderer a typecheck failure.
- Actions reach the agent only through the composer, formatted by `shared/action-message.ts`. Keep the agent-facing shape stable; the skill documents it.
- Copy is US English, no em dashes, no exclamation marks.

## Layout

- `server.ts` registers the `a2ui_check` and `a2ui_catalog` agent tools.
- `server/validate.ts` is the catalog-aware validation pass behind `a2ui_check`.
- `shared/` is protocol and message formatting, imported by both bundles and the tests.
- `ui/` is the renderer. `components/ui/` is vendored shadcn source you own.
- `skills/a2ui/` is what agents read: the rules plus the generated catalog index.

## Dev loop

```
bb plugin build
bb plugin install . --yes
bb plugin dev
```

`bb plugin dev` rebuilds and reloads on save. To see a surface, send a reply whose body is a fence with at least a `createSurface` line.

## Leak gate

This project rejects commits that contain secrets. The gate is two files:

- `.pre-commit-config.yaml` pins the gitleaks hook at v8.30.0.
- `.gitleaksignore` allowlists false positives. Every row carries a `# Reason:` line directly above it; a row without a reason is a bug, not a shortcut.

Run `pre-commit install` once after cloning. `pre-commit run --all-files` scans on demand.

## Encryption at rest

All personalized or user-specific files MUST be age-encrypted before commit. The inherited policy, including what counts as personalized, is `~/.agents/agents-md-detail/encryption-at-rest.md`. This project currently stores no personalized files; when it does, list each encrypted path and its plaintext source here.
