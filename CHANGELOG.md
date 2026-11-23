# Changelog

All notable changes to this project are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow semver.

## Unreleased

### Added

- `a2ui` fence renderer: streaming reduction of `createSurface`, `updateComponents`, `updateDataModel` and `deleteSurface`.
- Renderers for all 18 Basic Catalog components, with theme colors, data binding, list templates and two-way inputs.
- Catalog functions for validation and formatting, `@checks` enforcement, and button actions delivered through the composer.
- `a2ui_check` and `a2ui_catalog` agent tools, plus the catalog-aware validation pass behind them.
- Bundled `a2ui` skill with a generated component index.
- Vendored A2UI v1.0 Basic Catalog and the generator that derives the typed module and skill index.
- Protocol, catalog and validation tests.
