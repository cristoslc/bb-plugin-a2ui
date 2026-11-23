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
  walkSurface,
  type A2uiState,
  type A2uiSurface,
  type A2uiComponent,
  type Diagnostic,
  type Json,
} from "../shared/protocol";

const COMMON_PROPS = new Set(["id", "component", "weight"]);

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

  return diagnostics;
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
