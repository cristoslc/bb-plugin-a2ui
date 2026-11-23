// Catalog-aware validation for `a2ui_check`.
//
// The protocol reducer catches framing and state errors. This pass reads the
// vendored Basic Catalog and reports what the spec's prompt-generate-validate
// loop needs: unknown components, missing required properties, dangling child
// references, unknown functions and template paths that are not arrays.
import {
  CATALOG_COMPONENTS,
  CATALOG_FUNCTION_NAMES,
  CATALOG_ID,
} from "../catalog/generated";
import {
  isJsonObject,
  readPointer,
  resolveDynamic,
  safeMediaUrl,
  walkSurface,
  type A2uiState,
  type A2uiSurface,
  type A2uiComponent,
  type Diagnostic,
  type Json,
} from "../shared/protocol";

const COMMON_PROPS = new Set(["id", "component", "weight"]);

/** Properties the renderer loads through `safeMediaUrl`. */
const MEDIA_URL_PROPERTIES: Readonly<Record<string, readonly string[]>> = {
  Image: ["url"],
  Video: ["url", "posterUrl"],
  AudioPlayer: ["url"],
};

export function validateState(state: A2uiState): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (state.surfaces.length === 0) {
    diagnostics.push({
      severity: "error",
      code: "NO_SURFACE",
      message: "No surface was created. Start with a createSurface message.",
    });
    return diagnostics;
  }
  for (const surface of state.surfaces) diagnostics.push(...validateSurface(surface));
  return diagnostics;
}

function validateSurface(surface: A2uiSurface): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const where = `surface "${surface.surfaceId}"`;

  if (surface.catalogId !== null && surface.catalogId !== CATALOG_ID) {
    diagnostics.push({
      severity: "warning",
      code: "CATALOG_ID",
      message: `${where} declares catalog ${surface.catalogId}. This renderer draws the Basic Catalog (${CATALOG_ID}); components outside it will not render.`,
    });
  }

  if (!surface.components.has("root")) {
    diagnostics.push({
      severity: "error",
      code: "MISSING_ROOT",
      message: `${where} has no component with id "root". One component must be "root".`,
    });
  }

  const { reachable, missing } = walkSurface(surface);
  for (const id of missing) {
    diagnostics.push({
      severity: "error",
      code: "DANGLING_CHILD",
      message: `${where} references component "${id}", which it never defines.`,
    });
  }

  for (const component of surface.components.values()) {
    diagnostics.push(...validateComponent(surface, component));
    for (const problem of scanFunctions(component)) {
      diagnostics.push({
        severity: "error",
        code: "UNKNOWN_FUNCTION",
        message: `${where} component "${component.id}" calls unsupported function "${problem}".`,
      });
    }
  }

  for (const id of surface.components.keys()) {
    if (!reachable.has(id) && id !== "root") {
      diagnostics.push({
        severity: "warning",
        code: "ORPHAN_COMPONENT",
        message: `${where} defines component "${id}" but nothing reaches it from root.`,
      });
    }
  }

  return diagnostics;
}

function validateComponent(surface: A2uiSurface, component: A2uiComponent): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const catalog = CATALOG_COMPONENTS[component.component];
  if (catalog === undefined) {
    diagnostics.push({
      severity: "error",
      code: "UNKNOWN_COMPONENT",
      message: `Surface "${surface.surfaceId}" uses component "${component.component}", which is not in the Basic Catalog. Known: ${Object.keys(CATALOG_COMPONENTS).join(", ")}.`,
    });
    return diagnostics;
  }

  for (const property of catalog.required) {
    if (property === "component") continue;
    if (!(property in component)) {
      diagnostics.push({
        severity: "error",
        code: "MISSING_PROPERTY",
        message: `Component "${component.id}" (${component.component}) needs "${property}".`,
      });
    }
  }

  const known = new Set([...catalog.properties, ...COMMON_PROPS]);
  for (const property of Object.keys(component)) {
    if (property.startsWith("@") || known.has(property)) continue;
    diagnostics.push({
      severity: "warning",
      code: "UNKNOWN_PROPERTY",
      message: `Component "${component.id}" (${component.component}) sets "${property}", which the Basic Catalog does not define. The renderer ignores it.`,
    });
  }

  const children = component.children;
  if (isJsonObject(children) && typeof children.path === "string") {
    const value = readPointer(surface.dataModel, children.path);
    if (value !== undefined && !Array.isArray(value)) {
      diagnostics.push({
        severity: "error",
        code: "BAD_TEMPLATE_PATH",
        message: `Component "${component.id}" templates children from ${children.path}, but that path holds ${typeName(value)}, not an array.`,
      });
    }
  }

  diagnostics.push(...validateMediaUrls(surface, component));
  diagnostics.push(...validateTabs(component));
  diagnostics.push(...validateAction(surface, component));
  diagnostics.push(...validateChildShape(component, catalog.required, catalog.properties));

  return diagnostics;
}

/** Every URL property must hold an http or https URL, resolved where possible. */
function validateMediaUrls(surface: A2uiSurface, component: A2uiComponent): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const property of MEDIA_URL_PROPERTIES[component.component] ?? []) {
    if (!(property in component)) continue;
    // The renderer treats an empty poster as no poster, so an empty value is not an error there.
    const emptyAllowed = property === "posterUrl";
    const problem = urlProblem(surface, component[property], emptyAllowed);
    if (problem === null) continue;
    diagnostics.push({
      severity: "error",
      code: "BAD_URL_SCHEME",
      message: `Component "${component.id}" (${component.component}) sets "${property}" to ${problem}, but this renderer only loads http and https URLs.`,
    });
  }
  return diagnostics;
}

/** Returns a display form of the bad URL, or null when there is nothing to judge. */
function urlProblem(surface: A2uiSurface, value: unknown, emptyAllowed = false): string | null {
  if (value === undefined || value === null) return null;
  const resolved = resolveDynamic(value, { dataModel: surface.dataModel });
  if (!resolved.ok) return null;
  const result = resolved.value;
  if (result === undefined || result === null) return null;
  if (typeof result === "string") {
    if (result.trim() === "" && emptyAllowed) return null;
    if (safeMediaUrl(result) !== null) return null;
    return JSON.stringify(result);
  }
  return typeName(result);
}

/** Every tab entry needs a title and one child id, or it draws blank. */
function validateTabs(component: A2uiComponent): Diagnostic[] {
  if (component.component !== "Tabs" || !("tabs" in component)) return [];
  const tabs = component.tabs;
  if (!Array.isArray(tabs)) {
    return [
      {
        severity: "error",
        code: "BAD_TAB_ENTRY",
        message: `Component "${component.id}" (Tabs) needs "tabs" to be an array of entries with a title and a child.`,
      },
    ];
  }
  const diagnostics: Diagnostic[] = [];
  tabs.forEach((tab, index) => {
    const position = index + 1;
    if (!isJsonObject(tab)) {
      diagnostics.push({
        severity: "error",
        code: "BAD_TAB_ENTRY",
        message: `Component "${component.id}" (Tabs) has a tab ${position} that is ${shapeName(tab)}, not an object with a title and a child.`,
      });
      return;
    }
    const title = tab.title;
    if (!(typeof title === "string" && title.trim() !== "") && !isDynamic(title)) {
      diagnostics.push({
        severity: "error",
        code: "BAD_TAB_ENTRY",
        message: `Component "${component.id}" (Tabs) has a tab ${position} without a string "title". The renderer would draw a nameless tab.`,
      });
    }
    if (typeof tab.child !== "string" || tab.child.trim() === "") {
      diagnostics.push({
        severity: "error",
        code: "BAD_TAB_ENTRY",
        message: `Component "${component.id}" (Tabs) has a tab ${position} without a string "child". The renderer would draw an empty panel.`,
      });
    }
  });
  return diagnostics;
}

/** A Button action must resolve to an event or a function call on click. */
function validateAction(surface: A2uiSurface, component: A2uiComponent): Diagnostic[] {
  if (component.component !== "Button" || !("action" in component)) return [];
  const action = component.action;
  if (!isJsonObject(action)) {
    return [badAction(component, `"action" must be an object carrying "event" or "functionCall". A click would send nothing.`)];
  }
  if ("event" in action) {
    const event = action.event;
    if (!isJsonObject(event) || typeof event.name !== "string" || event.name.trim() === "") {
      return [badAction(component, `the event action needs a non-empty "name". A click would send nothing.`)];
    }
    return [];
  }
  if ("functionCall" in action) {
    const call = action.functionCall;
    if (!isJsonObject(call) || typeof call["@call"] !== "string" || call["@call"] === "") {
      return [badAction(component, `the functionCall action needs a non-empty "@call". A click would send nothing.`)];
    }
    if (call["@call"] === "openUrl") return validateOpenUrl(surface, component, call);
    return [];
  }
  return [badAction(component, `"action" carries neither "event" nor "functionCall". A click would send nothing.`)];
}

function validateOpenUrl(surface: A2uiSurface, component: A2uiComponent, call: Json): Diagnostic[] {
  if (!isJsonObject(call) || !isJsonObject(call.args) || !("url" in call.args)) {
    return [badAction(component, `openUrl needs an "args" object with a "url".`)];
  }
  const problem = urlProblem(surface, call.args.url);
  if (problem === null) return [];
  return [
    {
      severity: "error",
      code: "BAD_URL_SCHEME",
      message: `Component "${component.id}" (Button) opens ${problem} with openUrl, but this renderer only accepts http and https URLs.`,
    },
  ];
}

function badAction(component: A2uiComponent, detail: string): Diagnostic {
  return {
    severity: "error",
    code: "BAD_ACTION",
    message: `Component "${component.id}" (Button) has an action the renderer refuses: ${detail}`,
  };
}

/** `child` is one id, and `children` is an id array or a template object. */
function validateChildShape(
  component: A2uiComponent,
  required: readonly string[],
  properties: readonly string[],
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (required.includes("child") && "child" in component) {
    const child = component.child;
    if (typeof child !== "string" || child.trim() === "") {
      diagnostics.push({
        severity: "error",
        code: "BAD_CHILD_SHAPE",
        message: `Component "${component.id}" (${component.component}) needs "child" to be one component id string, but it is ${shapeName(child)}. The renderer would draw no child.`,
      });
    }
  }
  if (properties.includes("children") && "children" in component) {
    const children = component.children;
    if (!isChildList(children)) {
      diagnostics.push({
        severity: "error",
        code: "BAD_CHILD_SHAPE",
        message: `Component "${component.id}" (${component.component}) needs "children" to be an array of id strings or a template object with "componentId" and "path", but it is ${shapeName(children)}.`,
      });
    }
  }
  return diagnostics;
}

function isChildList(value: unknown): boolean {
  if (Array.isArray(value)) return value.every((entry) => typeof entry === "string" && entry !== "");
  return isJsonObject(value) && typeof value.componentId === "string" && typeof value.path === "string";
}

function isDynamic(value: unknown): boolean {
  return isJsonObject(value) && ("@path" in value || "@call" in value);
}

/** A short description of a malformed value for the diagnostic message. */
function shapeName(value: unknown): string {
  if (Array.isArray(value)) {
    return value.every((entry) => typeof entry === "string") ? "an array of ids" : "an array that includes a non-string entry";
  }
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (isJsonObject(value)) return "an object that is not a template";
  return typeof value;
}

function scanFunctions(value: Json | A2uiComponent, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const entry of value) scanFunctions(entry as Json, found);
    return found;
  }
  if (!isJsonObject(value)) return found;
  const name = value["@call"];
  const known: readonly string[] = CATALOG_FUNCTION_NAMES;
  if (typeof name === "string" && name !== "@index" && !known.includes(name)) {
    found.push(name);
  }
  for (const entry of Object.values(value)) scanFunctions(entry as Json, found);
  return found;
}

function typeName(value: Json): string {
  if (Array.isArray(value)) return "an array";
  if (value === null) return "null";
  return typeof value;
}
