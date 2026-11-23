# Tech debt

Known debt too large to fix inline: type errors in third-party code, missing test coverage for a platform interaction, a renderer shortcut with a named follow-up. One file per item, or a single running index as the list grows. Entry format and deletion policy: `~/.agents/agents-md-detail/lsp-errors.md`.

Known items:

- `formatString` supports `${/path}` and `${@index}` only. Nested function calls inside `${...}` are reported as errors. Adding them needs a small expression parser and tests.
- `Modal` overlays inside the card rather than portalling to the page, so a very tall surface can clip it.
- No renderer test yet. Protocol and validation are covered; the React tree is checked by typecheck and a live fence.
