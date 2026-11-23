# User experience

## What the reader sees

A card in the reply, bordered like the rest of bb, with a small header: the A2UI mark, the version, the surface count, and a Source button. The body is the surface. Under it, any diagnostics the stream produced, in red for errors and muted for warnings.

The Source button shows the exact fence body. It exists so a reader can copy a broken surface to the agent instead of describing it.

## Promises

- **The answer stays readable.** The agent writes a sentence or two above the card; the card carries the detail.
- **Input is visible before it is sent.** An action goes into the composer, not straight to the agent. The reader can edit or delete it.
- **A broken surface says why.** Missing component, unknown component, bad path, unsupported function: each has a named diagnostic with the line that caused it.
- **Nothing runs.** No fence content is executed as code.

## Interaction patterns

- Inputs write into the surface data model as the reader types, so one action can carry several fields.
- A button is blocked while any `@checks` rule fails. The first failing message appears above the surface and beside the field.
- Validation messages appear after the reader tries an action, not before, so an untouched empty field is not red on arrival.
- `Tabs` and `Modal` keep their state locally; a streaming update does not reset an open tab unless the component is replaced.
- A `Modal` panel opens above the card instead of inside it, so a short trigger cannot clip it. A tall surface scrolls within the panel.

## Accessibility

- Every input renders a real `<label>` or an `aria-label` from the catalog's `label` property.
- `Icon` is decorative (`aria-hidden`) unless the catalog component is the whole control; a `Button` carries its child's text.
- Diagnostics use `role="alert"` for the blocking message.
- Icon names the renderer does not map are shown as visible text rather than dropped, so the meaning is not lost silently.

## Phones

Surfaces use flex layouts with wrapping tab strips and full-width inputs. A card wider than the thread scrolls inside its own box rather than widening the transcript.
