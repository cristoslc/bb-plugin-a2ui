# ADR-0001: Draw A2UI through a code-fence renderer

- Status: adopted
- Date: 2026-11-22

## Context

bb has no A2UI renderer. The marketplace carries chat-UI plugins with their own markup languages (Iris, Generative UI, OpenUI, Impromptu UI), but none consumes the A2UI v1.0 wire format. A2UI ships renderers for React, Lit, Angular, Flutter, SwiftUI and Compose, and a `@a2ui/react` package, but those expect a host application that owns the surface lifecycle, not a chat transcript.

We need a first surface for bb that is small, safe, and honest about what it does not support.

## Options considered

**A. Iris-style fence renderer with a native catalog renderer.** Claim the `a2ui` fenced language with `experimental_codeFenceRenderer`, reduce the stream in a shared pure module, and draw the Basic Catalog with bb's own components. Cost: we write and maintain 18 component renderers and the binding layer. Reversible: the plugin can be disabled without touching bb.

**B. Wrap `@a2ui/react` inside the fence.** Mount the upstream React renderer and let it own the surface. Cost: a second React tree with its own theme and catalog, a package at 0.15.0 against a 1.0 spec, and a sandbox boundary between bb's theme and A2UI's. Reversible: swap the renderer behind the same reducer.

**C. Render A2UI inside a sandboxed HTML frame.** Emit a page that boots a renderer and postMessage actions out. Cost: an iframe per surface, duplicated theme bridging, and a second runtime to keep current. Reversible: replace the page.

## Decision

Option A. The fence slot is the only bb extension point that receives a streaming markdown block without inventing a new host API. A native renderer keeps the card in bb's theme, keeps the bundle free of a second framework, and lets the action path use the documented composer API. The reducer is transport-free, so the validation tool and the renderer share exactly one implementation.

Option B stays available: `ui/render.tsx` draws a surface from `A2uiSurface`, so an upstream renderer can replace it behind the same state.

## Consequences

- Eighteen component renderers and a binding evaluator are ours to maintain, and a catalog addition fails typecheck until drawn.
- The renderer supports a fixed function list. Unsupported functions are errors, not silent blanks.
- No `callRendererFunction`, because a fence has no return channel. Actions go through the composer.
- The vendored catalog is the single source of truth; the generated module and the skill index are derived from it.
