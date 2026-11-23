# Vendored A2UI catalog

`basic.v1.json` is the A2UI v1.0 Basic Catalog, copied verbatim from the
[`a2ui-project/a2ui`](https://github.com/a2ui-project/a2ui) repository at
commit `24d1bf9c830071f74c9c908433e73cc6cbe0aa33`
(`catalogs/basic/v1/catalog.json`, dated 2026-11-11).

- Catalog id: `https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`
- License: Apache 2.0 (same as the upstream A2UI project)

This copy is the single source of truth for three things in the plugin:

1. `catalog/generated.ts`, which the `a2ui_check` and `a2ui_catalog` tools read.
2. `skills/a2ui/CATALOG.md`, the component index agents read.
3. The renderer coverage test, which fails when the catalog gains a component
   the renderer cannot draw.

To refresh it, replace the file and run `npm run catalog:build`.
