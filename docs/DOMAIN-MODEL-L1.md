# Domain model, level 1

The domain here is a protocol, not a business. These are the words the code and the skill use, so a reader can follow either.

## Surface

A surface is one piece of UI an agent owns. It has an id, a component tree and a data model. Creating a surface twice with the same id is an error; deleting it removes its tree and its data.

## Component

A component is a node in that tree: a type name, an id, and properties. Components never nest inline. They name each other by id, and the component with id `root` is where drawing starts. The flat list plus id references is what lets an agent send three components now and the rest a moment later.

## Catalog

The catalog is the closed set of component types and functions a renderer accepts. This plugin draws the A2UI v1.0 Basic Catalog. Anything outside it is reported, not guessed at.

## Data model and binding

The data model is a JSON document the surface reads from. A property can be a literal, or a binding `{"@path": "/contact/email"}`. Inside a list template, a path without a leading slash resolves against the current item, and `{"@call": "@index"}` gives its position. Inputs write back to the same model.

## Action

An action is what happens when the reader presses a button. It is either an event sent to the agent (`name`, optional `userMessage`, optional `context`) or a local function such as `openUrl`. In chat the event becomes a composer message, and the agent's reply is the next part of the conversation.

## Check

A check is a rule attached to an input with `@checks`. Its condition is a function such as `required` or `email`; when it fails, its message is shown and the surface's buttons stop.

## Envelope

An envelope is one protocol message: `version`, exactly one of `createSurface`, `updateComponents`, `updateDataModel` or `deleteSurface`, and its payload. A stream is envelopes in order, one per line in the fence.

## Renderer

The renderer is the thing that turns a stream into pixels. This plugin is one. It is deliberately narrow: it draws the catalog, resolves bindings and checks, and reports everything else.
