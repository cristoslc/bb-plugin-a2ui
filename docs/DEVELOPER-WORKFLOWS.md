# Developer workflows

## Setup

```
git clone <remote> bb-plugin-a2ui
cd bb-plugin-a2ui
npm install
pre-commit install       # wires the gitleaks hook; required after every clone
bb plugin build
bb plugin install . --yes
```

`bb plugin install .` registers this directory in place. Editing source does not update bb until you rebuild and reload.

## Build and dev loop

```
bb plugin build          # writes dist/app.js, dist/app.css, dist/server.js
bb plugin dev            # rebuild and reload on save
bb plugin reload a2ui    # one-off reload after a manual build
```

`dist/` is ignored by git. A git-installed plugin needs a built `dist/`; `bb plugin build` is part of publishing, not part of the clone.

## Test

```
npm run check
```

This is the project test command: `tsc --noEmit && vitest run`. It must pass before every commit.

## Catalog refresh

`catalog/basic.v1.json` is vendored from `a2ui-project/a2ui`. Replace the file, then:

```
npm run catalog:build
npm run check
```

The generator writes `catalog/generated.ts` and `skills/a2ui/CATALOG.md`. A new Basic Catalog component without a renderer fails `tsc`, by design.

## Live check

Send a reply whose body is an `a2ui` fence with at least:

```
{"version":"1.0","createSurface":{"surfaceId":"t","components":[{"id":"root","component":"Text","text":"Hello"}]}}
```

Expected: a card titled A2UI, one surface, the text Hello. If the plugin is missing or throws, bb falls back to plain code block rendering; the raw fence is the fallback, never a blank card.

## Release

There is no deploy target. This is a plugin package: bump `version` in `package.json`, rebuild, commit, tag `vX.Y.Z`, and install the tag. There is no staging environment to promote through, which is the documented exemption from the two-stage pipeline rule.

## Hooks

`.pre-commit-config.yaml` pins gitleaks at v8.30.0. A fresh clone runs `pre-commit install`; without it, commits are unscanned. Do not add a second secret scanner.
