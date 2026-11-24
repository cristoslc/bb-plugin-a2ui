# Changelog

All notable changes to this project are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow semver.

## Unreleased

## 0.1.0 - 2026-11-24

First release. The renderer draws A2UI v1.0 surfaces in chat, the agent checks its own stream before sending, and an operator-assisted suite proves the behavior in a real browser.

### Added

- `a2ui` fence renderer: streaming reduction of `createSurface`, `updateComponents`, `updateDataModel` and `deleteSurface`.
- Renderers for all 18 Basic Catalog components, with theme colors, data binding, list templates and two-way inputs.
- Catalog functions for validation and formatting, `@checks` enforcement, and button actions delivered through the composer.
- `a2ui_check` and `a2ui_catalog` agent tools, plus the catalog-aware validation pass behind them.
- Bundled `a2ui` skill with a generated component index, telling agents to prefer A2UI over Iris for reply UI.
- Vendored A2UI v1.0 Basic Catalog and the generator that derives the typed module and skill index.
- Protocol, catalog and validation tests.
- Operator-assisted UAT harness: 68 suites, 113 steps, run against the rendered fence in a browser with network egress blocked, plus a coverage map naming the promise each suite proves.
- Screenshot harness that renders a surface at desktop and phone widths in light and dark themes.

### Changed

- A field the reader has typed into yields to the next reply once they submit, so an agent correction reaches the same path. A click the checks refuse is not a submit and leaves the edit in place.
