# A2UI v1.0 Basic Catalog

Generated from `catalog/basic.v1.json`. Do not edit by hand; run `npm run catalog:build`.

Catalog id: `https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json`

## Components

| Component | Required | Other properties | What it does |
| --- | --- | --- | --- |
| `Text` | `component`, `text` | `text`, `variant`, `weight` | Body or caption text |
| `Image` | `component`, `url` | `url`, `description`, `fit`, `variant`, `weight` | An image from an http or https URL. |
| `Icon` | `component`, `name` | `name`, `weight` | A system icon by name, or an inline SVG path. |
| `Video` | `component`, `url` | `url`, `posterUrl`, `weight` | A video player. |
| `AudioPlayer` | `component`, `url` | `url`, `description`, `weight` | An audio player. |
| `Row` | `component`, `children` | `children`, `justify`, `align`, `weight` | Lays its children out horizontally. |
| `Column` | `component`, `children` | `children`, `justify`, `align`, `weight` | Lays its children out vertically. |
| `List` | `component`, `children` | `children`, `direction`, `align`, `weight` | A vertical or horizontal list of children. |
| `Card` | `component`, `child` | `child`, `weight` | A bordered container around one child. |
| `Tabs` | `component`, `tabs` | `tabs`, `weight` | Tabbed panels, each with a title and a child. |
| `Modal` | `component`, `trigger`, `content` | `trigger`, `content`, `weight` | A trigger that opens a content panel. |
| `Divider` | `component` | `axis`, `weight` | A horizontal or vertical rule. |
| `Button` | `component`, `child`, `action` | `@checks`, `child`, `variant`, `action`, `weight` | A clickable control around a Text child, with an action. |
| `TextField` | `component`, `label`, `value` | `@checks`, `label`, `value`, `placeholder`, `variant`, `weight` | A text, number, password or long-text input. |
| `CheckBox` | `component`, `label`, `value` | `@checks`, `label`, `value`, `weight` | A labelled on/off input. |
| `ChoicePicker` | `component`, `options`, `value` | `@checks`, `label`, `variant`, `options`, `value`, `displayStyle`, `filterable`, `weight` | A single-select or multi-select list of options. |
| `Slider` | `component`, `value`, `max` | `@checks`, `label`, `min`, `max`, `value`, `steps`, `weight` | A numeric input between min and max. |
| `DateTimeInput` | `component`, `value` | `@checks`, `value`, `enableDate`, `enableTime`, `min`, `max`, `label`, `weight` | A date and time input in ISO 8601. |

Every component also accepts `id`, `weight`, `@checks` (on input
components), `@accessibility`, `@metadata`, and `@catalogId`.

## Functions

| Function | What it does |
| --- | --- |
| `required` | Checks that the value is not null, undefined, or empty. |
| `regex` | Checks that the value matches a regular expression string. |
| `length` | Checks string length constraints. |
| `numeric` | Checks numeric range constraints. |
| `email` | Checks that the value is a valid email address. |
| `formatString` | Performs string interpolation of data model values and other functions in the catalog functions list and returns the resulting string |
| `formatNumber` | Formats a number with the specified grouping and decimal precision. |
| `formatCurrency` | Formats a number as a currency string. |
| `formatDate` | Formats a timestamp into a string using a pattern. |
| `pluralize` | Returns a localized string based on the Common Locale Data Repository (CLDR) plural category of the count (zero, one, two, few, many, other) |
| `openUrl` | Opens the specified URL in a browser or handler (requires user activation) |
| `and` | Performs a logical AND operation on a list of boolean values. |
| `or` | Performs a logical OR operation on a list of boolean values. |
| `not` | Performs a logical NOT operation on a boolean value. |
