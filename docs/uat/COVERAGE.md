# UAT coverage map

This map names the promise each operator-assisted suite proves. Every suite drives the real fence renderer in the screenshot harness with real DOM events, and the runner aborts every request that leaves the harness origin. A suite that proves a live update pushes a second fence body into the mounted card with `push_stream`, so the new reply has to render without losing what the reader typed, opened, or selected.

Steps counts the rows in that suite's generated report table. Each report ends with one network check row, so a suite with two scripted steps reports three rows. Reports live beside this file as `docs/uat/<suite>.md`.

## Suites

| Suite file | Promise proved | Steps |
| --- | --- | --- |
| `tests/manual/a2ui/uat-a11y-description.yaml` | An Image description becomes alt and an AudioPlayer description becomes aria-label; a Video description is ignored because the catalog does not define it. | 3 |
| `tests/manual/a2ui/uat-a11y-labels.yaml` | Every rendered input sits in a real label, and a Button takes its accessible name from the Text child it wraps. | 3 |
| `tests/manual/a2ui/uat-action-context.yaml` | An event action carries literal values and resolved data paths in its context, and the composer receives the exact message. | 2 |
| `tests/manual/a2ui/uat-action-invalid.yaml` | A Button whose event action has no name reports the renderer's error and sends nothing to the composer. | 2 |
| `tests/manual/a2ui/uat-action-no-data-model.yaml` | sendDataModel false omits the data model from the composer message, and true includes the whole model. | 3 |
| `tests/manual/a2ui/uat-action-openurl-refused.yaml` | An openUrl with a refused scheme calls window.open zero times, shows the refusal text, and leaves the composer empty. | 2 |
| `tests/manual/a2ui/uat-action-openurl.yaml` | An openUrl hands the declared https URL to window.open exactly once and writes nothing to the composer. | 2 |
| `tests/manual/a2ui/uat-action-user-message.yaml` | An event action with userMessage puts that line under the header, and one without it does not. | 3 |
| `tests/manual/a2ui/uat-audio.yaml` | An AudioPlayer draws a real audio element with the stream's src and native controls. | 2 |
| `tests/manual/a2ui/uat-binding-absolute.yaml` | An absolute path in a Text and in an action context resolves from the surface root, never from the enclosing list item. | 3 |
| `tests/manual/a2ui/uat-binding-relative.yaml` | Relative paths inside a list template resolve against the current item, including a field in a nested object. | 2 |
| `tests/manual/a2ui/uat-binding-shared.yaml` | Two fields bound to the same path stay in step, and a Text bound to that path follows the value. | 3 |
| `tests/manual/a2ui/uat-binding.yaml` | Inputs write the data model and actions reach the composer with the exact formatted text. | 3 |
| `tests/manual/a2ui/uat-broken-and-healthy.yaml` | One reply with a broken duplicate surface and a valid surface shows the error and still draws the valid one. | 2 |
| `tests/manual/a2ui/uat-card-divider.yaml` | A Card draws a border on all four sides, and a Divider with role separator is a one pixel line whose height or width names its axis. | 4 |
| `tests/manual/a2ui/uat-checkbox.yaml` | A CheckBox toggles through real clicks, its bound boolean follows in the data model, and an action carries it into the exact composer text. | 4 |
| `tests/manual/a2ui/uat-choice-multiple.yaml` | A multipleSelection ChoicePicker holds more than one value, writes both into the bound list, and removing one leaves the other. | 3 |
| `tests/manual/a2ui/uat-date-time.yaml` | DateTimeInput chooses its native control from enableDate and enableTime, and real typing writes each bound value. | 5 |
| `tests/manual/a2ui/uat-datetime-limits.yaml` | A date-only DateTimeInput puts the catalog min and max on the native date input as real attributes. | 2 |
| `tests/manual/a2ui/uat-diagnostics-truncation.yaml` | More than six diagnostics show the first six rows and one muted "and 2 more" line. | 2 |
| `tests/manual/a2ui/uat-diagnostics.yaml` | Broken streams fail visibly, and a failing check keeps its button blocked. | 3 |
| `tests/manual/a2ui/uat-draw.yaml` | A static A2UI surface draws in both themes. | 3 |
| `tests/manual/a2ui/uat-dynamic-bad-url.yaml` | An Image URL bound from the data model to a javascript: value is refused at draw time, with no image element. | 2 |
| `tests/manual/a2ui/uat-empty-list.yaml` | A list template over an empty array draws zero rows and never shows the waiting text. | 2 |
| `tests/manual/a2ui/uat-empty-values.yaml` | Empty strings, a missing path, null and literal empty values render as empty text, never undefined or null. | 2 |
| `tests/manual/a2ui/uat-focus-survives-update.yaml` | A field keeps focus across a pushed update, the caret stays after the typed text, and typing the rest completes the value in the field and its bound Text. | 2 |
| `tests/manual/a2ui/uat-fuzz-surface.yaml` | Forty seeded rounds touch four buttons, two checkboxes, two sliders and two text fields; nothing throws, and the card still draws one surface with its title. | 1 |
| `tests/manual/a2ui/uat-icon.yaml` | A mapped icon name draws the icon, an unmapped name stays visible as text, and an inline svgPath draws an svg with a path. | 4 |
| `tests/manual/a2ui/uat-image.yaml` | An https Image draws a real img element with the stream's URL, the description as alt, and the catalog fit as computed object-fit. | 2 |
| `tests/manual/a2ui/uat-keyboard-controls.yaml` | Space toggles the checkbox a Tab lands on, Home and the arrow keys move the slider with the bound Text following, and Tab then Enter selects a chip. | 3 |
| `tests/manual/a2ui/uat-keyboard-journey.yaml` | Tab, typing and Enter fill a form and submit it with the exact action message, using no mouse click. | 1 |
| `tests/manual/a2ui/uat-layout.yaml` | Row and Column compute their flex direction, keep their children in order, and their justify and align values reach computed style. | 3 |
| `tests/manual/a2ui/uat-list.yaml` | A vertical List computes column, a horizontal List computes row, and both paint their children in stream order. | 3 |
| `tests/manual/a2ui/uat-long-list.yaml` | A 50-item list draws all 50 children in order with both endpoints visible. | 2 |
| `tests/manual/a2ui/uat-long-text-phone.yaml` | A long paragraph at 390x844 wraps inside the viewport and stays fully visible. | 2 |
| `tests/manual/a2ui/uat-modal.yaml` | The Modal panel is fully visible whatever the trigger measures, at desktop and phone width. | 6 |
| `tests/manual/a2ui/uat-phone-width.yaml` | At a 390x844 viewport the card and every input stay fully inside the screen. | 2 |
| `tests/manual/a2ui/uat-proto-checks-basic.yaml` | The five single-value checks each fail on bad input, show their own message, and keep the button blocked with nothing sent. | 3 |
| `tests/manual/a2ui/uat-proto-checks-logic.yaml` | The and, or and not checks gate the same button, each showing its own message and sending nothing. | 2 |
| `tests/manual/a2ui/uat-proto-data.yaml` | updateDataModel rewrites the value a Text reads, and the old text disappears. | 2 |
| `tests/manual/a2ui/uat-proto-delete.yaml` | deleteSurface removes the drawn surface, its text leaves the page, and the header says no surface remains. | 2 |
| `tests/manual/a2ui/uat-proto-duplicate-surface.yaml` | A second createSurface for a live surface id is refused with INTEGRITY_ERROR, and the first surface keeps drawing. | 2 |
| `tests/manual/a2ui/uat-proto-empty.yaml` | A fence with no messages explains what to write instead of drawing a surface. | 2 |
| `tests/manual/a2ui/uat-proto-format-string.yaml` | formatString interpolates a data path into text. | 2 |
| `tests/manual/a2ui/uat-proto-format-values.yaml` | formatNumber, formatCurrency, formatDate and pluralize each draw their formatted text. | 2 |
| `tests/manual/a2ui/uat-proto-list.yaml` | A template list draws one row per data item, resolves relative paths against the item, and reads the position through @index. | 2 |
| `tests/manual/a2ui/uat-proto-media-url.yaml` | An Image with a javascript URL is refused in the page, so no image element and no script URL reach the reader. | 2 |
| `tests/manual/a2ui/uat-proto-streaming.yaml` | A reply that is still streaming draws its complete lines, keeps the half-written tail quiet, and shows one surface. | 3 |
| `tests/manual/a2ui/uat-proto-surfaces.yaml` | One reply can carry more than one surface, and the header counts them. | 2 |
| `tests/manual/a2ui/uat-proto-whole-json.yaml` | A fence body holding one pretty-printed JSON object, rather than JSON Lines, still draws its surface. | 2 |
| `tests/manual/a2ui/uat-race-submit.yaml` | A click that lands with no pause after typing sends the typed value in the action context and the data model, with no page errors. | 2 |
| `tests/manual/a2ui/uat-real-booking.yaml` | A booking form fails its checks, is corrected, and submits with the exact action message. | 3 |
| `tests/manual/a2ui/uat-roundtrip-form.yaml` | A filled form sends its exact action message, and a pushed reply changes the heading, writes a data path, and leaves the typed values in place on one card. | 2 |
| `tests/manual/a2ui/uat-runner-verbs.yaml` | Every assertion and action verb the runner advertises is driven against the real renderer at least once. | 8 |
| `tests/manual/a2ui/uat-slider-attributes.yaml` | A Slider carries the catalog min, max and step to the native range input, and the bound value stays inside that range. | 4 |
| `tests/manual/a2ui/uat-streaming-to-closed.yaml` | A streaming partial reply draws what arrived with no diagnostic, and a closed full reply replaces it with the complete surface and no diagnostic row. | 2 |
| `tests/manual/a2ui/uat-tabs-content.yaml` | Tabs shows its first panel by default, and a real click on the second tab replaces it with that tab's own content. | 4 |
| `tests/manual/a2ui/uat-textfield.yaml` | Every TextField variant draws the native control its name promises, a placeholder reaches the attribute, and typing writes the bound value. | 5 |
| `tests/manual/a2ui/uat-two-actions.yaml` | Two buttons each send their own message, and the composer holds both in click order. | 2 |
| `tests/manual/a2ui/uat-two-replies.yaml` | Two clicks across a pushed update, which renames and re-aims the second button, land both action messages in the composer in order. | 2 |
| `tests/manual/a2ui/uat-typography.yaml` | A caption Text is visibly smaller than a body Text in the same row, measured from computed font size. | 2 |
| `tests/manual/a2ui/uat-unicode.yaml` | Accented, emoji and CJK text render and reach the action context unchanged. | 2 |
| `tests/manual/a2ui/uat-update-keeps-edits.yaml` | A pushed update to another component leaves the value the reader typed in its field. | 2 |
| `tests/manual/a2ui/uat-update-keeps-modal.yaml` | A pushed update leaves an open Modal and its content on screen. | 2 |
| `tests/manual/a2ui/uat-update-keeps-tab.yaml` | A pushed update leaves the second tab selected and its panel on screen. | 2 |
| `tests/manual/a2ui/uat-video.yaml` | A Video draws a real video element with the stream's src, the posterUrl as its poster attribute, and native controls. | 2 |
| `tests/manual/a2ui/uat-warning-does-not-block.yaml` | A duplicate component is a warning, not a stop: its row is shown, the last definition draws, and the button still sends. | 3 |

## Promises proved by unit tests

Three catalog validation promises are proved in `tests/catalog.test.ts` rather than by a browser suite, because they are answered by the validator and never reach the rendered page:

- **Unknown component.** `UNKNOWN_COMPONENT` names the component and lists the catalog, so an agent knows what it may use.
- **Unknown function.** `UNKNOWN_FUNCTION` names a call the reducer cannot resolve, wherever it appears in a component.
- **Unknown property.** `UNKNOWN_PROPERTY` warns that the catalog does not define a property, so the renderer ignores it. This is the warning that explains why a Video description has no effect.

## Total

67 suites. They script 111 steps, and each report adds one network check row, for 178 report rows in all.
