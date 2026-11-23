A bb plugin that draws A2UI surfaces in chat. Agents send declarative JSON, the reply becomes a card you can read, fill in and click, and your input comes back to the agent as a normal message.

It covers the A2UI v1.0 Basic Catalog: text, images, media, rows, columns, lists, cards, tabs, modals, dividers, buttons, text fields, checkboxes, choice pickers, sliders and date inputs. Inputs bind to the surface's data model, validation rules block a submit with their own message, and colors follow your bb theme.

Before sending, an agent can check its stream with the plugin's `a2ui_check` tool, which names the exact problem: a missing root component, an unknown component, a required property left out, a dangling child reference, a function the renderer does not have.

Surfaces stream: a reply that is still being written fills in as its messages arrive. Nothing the agent sends runs as code; the renderer resolves paths and a fixed list of catalog functions only.
