// A2UI v1.0 protocol, transport-free.
//
// A chat reply carries the agent-to-renderer stream as JSON Lines inside an
// ```a2ui fence. This module turns that text into surfaces: it frames the
// stream, reduces the four surface messages, resolves data bindings and
// evaluates the catalog's validation functions. It has no React, no DOM and
// no Node imports so the fence renderer and the server tools share it.
//
// Spec: https://a2ui.org/specification/v1.0-a2ui/

export const A2UI_VERSION = "1.0";

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };

export interface Diagnostic {
  severity: "error" | "warning";
  /** A2UI spec code where the spec defines one, otherwise a local code. */
  code: string;
  message: string;
  /** 1-based line in the fence body, when the problem came from one message. */
  line?: number;
}

export interface A2uiComponent {
  id: string;
  component: string;
  [key: string]: unknown;
}

export interface A2uiSurface {
  surfaceId: string;
  catalogId: string | null;
  sendDataModel: boolean;
  components: Map<string, A2uiComponent>;
  dataModel: Json;
}

export interface A2uiState {
  surfaces: A2uiSurface[];
  diagnostics: Diagnostic[];
}

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const ENVELOPE_KEYS = [
  "createSurface",
  "updateComponents",
  "updateDataModel",
  "deleteSurface",
  "callRendererFunction",
  "agentFunctionResponse",
] as const;

type EnvelopeKey = (typeof ENVELOPE_KEYS)[number];

/** UAX #31 identifier rule the spec applies to component ids and names. */
const IDENTIFIER = /^[\p{XID_Start}_][\p{XID_Continue}]*$/u;

export function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER.test(value);
}

// ---------------------------------------------------------------------------
// Framing: JSON Lines, with a single whole JSON value accepted for convenience.

export interface ParsedStream {
  messages: unknown[];
  diagnostics: Diagnostic[];
  /** True when the tail looked like an unfinished message rather than noise. */
  pending: boolean;
}

export function parseStream(source: string, streaming: boolean): ParsedStream {
  const trimmed = source.trim();
  if (trimmed === "") return { messages: [], diagnostics: [], pending: streaming };

  // A complete array or object wins. This covers a pretty-printed message the
  // agent wrote across several lines, once it is whole.
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const whole = tryParse(trimmed);
    if (whole.ok) {
      const messages = Array.isArray(whole.value) ? whole.value : [whole.value];
      return { messages, diagnostics: [], pending: false };
    }
  }

  const lines = source.split(/\r?\n/);
  const messages: unknown[] = [];
  const diagnostics: Diagnostic[] = [];
  let parsedCount = 0;
  let pending = false;

  lines.forEach((raw, offset) => {
    const line = raw.trim();
    if (line === "") return;
    const result = tryParse(line);
    if (result.ok) {
      messages.push(result.value);
      parsedCount += 1;
      return;
    }
    if (streaming) {
      // A half-written line is not an error while the reply is still arriving.
      pending = true;
      return;
    }
    diagnostics.push({
      severity: "error",
      code: "MALFORMED_MESSAGE",
      message: `Line ${offset + 1} is not valid JSON: ${result.error}`,
      line: offset + 1,
    });
  });

  // While streaming, an agent that pretty-prints one message makes every line
  // unparseable. Treat that as a pending message, not a pile of errors.
  if (streaming && parsedCount === 0 && trimmed.startsWith("{")) pending = true;

  return { messages, diagnostics, pending };
}

function tryParse(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (cause) {
    return { ok: false, error: cause instanceof Error ? cause.message : String(cause) };
  }
}

// ---------------------------------------------------------------------------
// Reduction.

export function emptyState(): A2uiState {
  return { surfaces: [], diagnostics: [] };
}

export function reduceStream(source: string, streaming: boolean): A2uiState {
  const parsed = parseStream(source, streaming);
  const state: A2uiState = { surfaces: [], diagnostics: [...parsed.diagnostics] };
  for (const message of parsed.messages) applyMessage(state, message);
  return state;
}

export function applyMessage(state: A2uiState, message: unknown): void {
  if (!isJsonObject(message)) {
    state.diagnostics.push({
      severity: "error",
      code: "MALFORMED_MESSAGE",
      message: "Each message must be a JSON object.",
    });
    return;
  }
  if (message.version !== A2UI_VERSION) {
    state.diagnostics.push({
      severity: "error",
      code: "VERSION_MISMATCH",
      message: `Expected version "${A2UI_VERSION}", got ${JSON.stringify(message.version ?? null)}.`,
    });
    return;
  }
  const keys = ENVELOPE_KEYS.filter((key) => key in message);
  if (keys.length !== 1) {
    state.diagnostics.push({
      severity: "error",
      code: "MALFORMED_MESSAGE",
      message: `A message carries exactly one of ${ENVELOPE_KEYS.join(", ")}; this one carries ${keys.length}.`,
    });
    return;
  }
  const key = keys[0] as EnvelopeKey;
  const payload = message[key];
  if (!isJsonObject(payload)) {
    state.diagnostics.push({
      severity: "error",
      code: "MALFORMED_MESSAGE",
      message: `"${key}" must be an object.`,
    });
    return;
  }
  switch (key) {
    case "createSurface":
      createSurface(state, payload);
      return;
    case "updateComponents":
      updateComponents(state, payload);
      return;
    case "updateDataModel":
      updateDataModel(state, payload);
      return;
    case "deleteSurface":
      deleteSurface(state, payload);
      return;
    case "callRendererFunction":
    case "agentFunctionResponse":
      state.diagnostics.push({
        severity: "warning",
        code: "UNSUPPORTED_MESSAGE",
        message: `"${key}" needs a return channel to the agent. A chat fence has none, so this renderer ignores it. Use an action event instead.`,
      });
      return;
  }
}

function surfaceIdOf(state: A2uiState, payload: JsonObject, key: string): string | null {
  const surfaceId = payload.surfaceId;
  if (typeof surfaceId !== "string" || surfaceId === "") {
    state.diagnostics.push({
      severity: "error",
      code: "MALFORMED_MESSAGE",
      message: `"${key}" needs a non-empty surfaceId.`,
    });
    return null;
  }
  return surfaceId;
}

function findSurface(state: A2uiState, surfaceId: string): A2uiSurface | undefined {
  return state.surfaces.find((surface) => surface.surfaceId === surfaceId);
}

function createSurface(state: A2uiState, payload: JsonObject): void {
  const surfaceId = surfaceIdOf(state, payload, "createSurface");
  if (surfaceId === null) return;
  if (findSurface(state, surfaceId) !== undefined) {
    state.diagnostics.push({
      severity: "error",
      code: "INTEGRITY_ERROR",
      message: `Surface "${surfaceId}" already exists. Send deleteSurface before recreating it.`,
    });
    return;
  }
  const surface: A2uiSurface = {
    surfaceId,
    catalogId: typeof payload.catalogId === "string" ? payload.catalogId : null,
    sendDataModel: payload.sendDataModel === true,
    components: new Map(),
    dataModel: isJsonObject(payload.dataModel) || Array.isArray(payload.dataModel) ? (payload.dataModel as Json) : {},
  };
  if (payload.components !== undefined) applyComponentList(state, surface, payload.components);
  state.surfaces.push(surface);
}

function updateComponents(state: A2uiState, payload: JsonObject): void {
  const surfaceId = surfaceIdOf(state, payload, "updateComponents");
  if (surfaceId === null) return;
  const surface = findSurface(state, surfaceId);
  if (surface === undefined) {
    state.diagnostics.push({
      severity: "error",
      code: "INTEGRITY_ERROR",
      message: `updateComponents targets unknown surface "${surfaceId}".`,
    });
    return;
  }
  if (payload.components === undefined) {
    state.diagnostics.push({
      severity: "error",
      code: "MALFORMED_MESSAGE",
      message: '"updateComponents" needs a components array.',
    });
    return;
  }
  applyComponentList(state, surface, payload.components);
}

function applyComponentList(state: A2uiState, surface: A2uiSurface, list: unknown): void {
  if (!Array.isArray(list)) {
    state.diagnostics.push({
      severity: "error",
      code: "MALFORMED_MESSAGE",
      message: `Surface "${surface.surfaceId}" components must be an array.`,
    });
    return;
  }
  const seen = new Set<string>();
  for (const raw of list) {
    if (!isJsonObject(raw)) {
      state.diagnostics.push({
        severity: "error",
        code: "MALFORMED_MESSAGE",
        message: `Surface "${surface.surfaceId}" has a component that is not an object.`,
      });
      continue;
    }
    const id = raw.id;
    const name = raw.component;
    if (!isIdentifier(id)) {
      state.diagnostics.push({
        severity: "error",
        code: "MALFORMED_MESSAGE",
        message: `Component id ${JSON.stringify(id ?? null)} is not a valid UAX #31 identifier.`,
      });
      continue;
    }
    if (typeof name !== "string" || name === "") {
      state.diagnostics.push({
        severity: "error",
        code: "MALFORMED_MESSAGE",
        message: `Component "${id}" has no component type.`,
      });
      continue;
    }
    if (seen.has(id)) {
      state.diagnostics.push({
        severity: "warning",
        code: "DUPLICATE_COMPONENT",
        message: `Component "${id}" appears twice in one message; the last definition wins.`,
      });
    }
    seen.add(id);
    surface.components.set(id, { ...(raw as A2uiComponent), id, component: name });
  }
}

function updateDataModel(state: A2uiState, payload: JsonObject): void {
  const surfaceId = surfaceIdOf(state, payload, "updateDataModel");
  if (surfaceId === null) return;
  const surface = findSurface(state, surfaceId);
  if (surface === undefined) {
    state.diagnostics.push({
      severity: "error",
      code: "INTEGRITY_ERROR",
      message: `updateDataModel targets unknown surface "${surfaceId}".`,
    });
    return;
  }
  if (!("value" in payload)) {
    state.diagnostics.push({
      severity: "error",
      code: "MALFORMED_MESSAGE",
      message: '"updateDataModel" needs a value (null deletes the path).',
    });
    return;
  }
  const pointer = typeof payload.path === "string" ? payload.path : "/";
  const value = payload.value as Json;
  surface.dataModel = value === null ? deletePointer(surface.dataModel, pointer) : writePointer(surface.dataModel, pointer, value);
}

function deleteSurface(state: A2uiState, payload: JsonObject): void {
  const surfaceId = surfaceIdOf(state, payload, "deleteSurface");
  if (surfaceId === null) return;
  const before = state.surfaces.length;
  state.surfaces = state.surfaces.filter((surface) => surface.surfaceId !== surfaceId);
  if (state.surfaces.length === before) {
    state.diagnostics.push({
      severity: "warning",
      code: "INTEGRITY_ERROR",
      message: `deleteSurface names unknown surface "${surfaceId}".`,
    });
  }
}

// ---------------------------------------------------------------------------
// JSON Pointers (RFC 6901), immutable writes.

export function pointerTokens(pointer: string): string[] {
  if (pointer === "" || pointer === "/") return [];
  if (!pointer.startsWith("/")) return [pointer];
  return pointer
    .slice(1)
    .split("/")
    .map((token) => token.replace(/~1/g, "/").replace(/~0/g, "~"));
}

export function readPointer(root: Json, pointer: string): Json | undefined {
  let current: Json | undefined = root;
  for (const token of pointerTokens(pointer)) {
    if (Array.isArray(current)) {
      const index = Number(token);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) return undefined;
      current = current[index];
      continue;
    }
    if (!isJsonObject(current)) return undefined;
    if (!(token in current)) return undefined;
    current = current[token];
  }
  return current;
}

export function writePointer(root: Json, pointer: string, value: Json): Json {
  const tokens = pointerTokens(pointer);
  if (tokens.length === 0) return value;
  const [head, ...rest] = tokens;
  const base: Json = Array.isArray(root)
    ? [...root]
    : isJsonObject(root)
      ? { ...root }
      : {};
  if (Array.isArray(base)) {
    const index = Number(head);
    if (!Number.isInteger(index) || index < 0) return root;
    while (base.length < index) base.push(null);
    base[index] = rest.length === 0 ? value : writePointer(base[index] ?? null, `/${rest.join("/")}`, value);
    return base;
  }
  const container = isJsonObject(base) ? base : {};
  container[head] = rest.length === 0 ? value : writePointer(container[head] ?? null, `/${rest.join("/")}`, value);
  return container;
}

export function deletePointer(root: Json, pointer: string): Json {
  const tokens = pointerTokens(pointer);
  if (tokens.length === 0) return {};
  const [head, ...rest] = tokens;
  if (Array.isArray(root)) {
    const next = [...root];
    const index = Number(head);
    if (!Number.isInteger(index) || index < 0 || index >= next.length) return root;
    if (rest.length === 0) {
      next.splice(index, 1);
    } else {
      next[index] = deletePointer(next[index], `/${rest.join("/")}`);
    }
    return next;
  }
  if (!isJsonObject(root) || !(head in root)) return root;
  const next: JsonObject = { ...root };
  if (rest.length === 0) {
    delete next[head];
  } else {
    next[head] = deletePointer(next[head], `/${rest.join("/")}`);
  }
  return next;
}

// ---------------------------------------------------------------------------
// Dynamic values: literals, data bindings, function calls.

export interface EvalScope {
  /** Value of the enclosing list item, when rendering inside a collection. */
  value?: Json;
  /** Absolute path of that item, for diagnostics. */
  path?: string;
}

export interface EvalContext {
  dataModel: Json;
  scope?: EvalScope;
  index?: number;
}

export type Resolved<T = Json | undefined> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function resolveDynamic(value: unknown, ctx: EvalContext): Resolved {
  if (value === undefined || value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return { ok: true, value: value as Json | undefined };
  }
  if (Array.isArray(value)) {
    const items: Json[] = [];
    for (const entry of value) {
      const resolved = resolveDynamic(entry, ctx);
      if (!resolved.ok) return resolved;
      items.push((resolved.value ?? null) as Json);
    }
    return { ok: true, value: items };
  }
  if (!isJsonObject(value)) {
    return { ok: false, error: `Cannot resolve ${JSON.stringify(value)}.` };
  }
  if ("@path" in value) {
    const pointer = value["@path"];
    if (typeof pointer !== "string") return { ok: false, error: '"@path" must be a JSON Pointer string.' };
    return { ok: true, value: resolvePath(pointer, ctx) };
  }
  if ("@call" in value) return callFunction(value, ctx);
  const object: JsonObject = {};
  for (const [key, entry] of Object.entries(value)) {
    const resolved = resolveDynamic(entry, ctx);
    if (!resolved.ok) return resolved;
    object[key] = (resolved.value ?? null) as Json;
  }
  return { ok: true, value: object };
}

export function resolvePath(pointer: string, ctx: EvalContext): Json | undefined {
  if (pointer === "/" || pointer === "") return ctx.dataModel;
  if (pointer.startsWith("/")) return readPointer(ctx.dataModel, pointer);
  const base = ctx.scope?.value;
  if (base === undefined) return undefined;
  return readPointer(base, `/${pointer}`);
}

/** Where a `@path` binding writes: the scope prefix plus the relative part. */
export function resolveAbsolutePath(pointer: string, ctx: EvalContext): string {
  if (pointer.startsWith("/")) return pointer;
  const base = ctx.scope?.path ?? "/";
  return `${base === "/" ? "" : base}/${pointer}`;
}

function callFunction(call: JsonObject, ctx: EvalContext): Resolved {
  const name = call["@call"];
  if (typeof name !== "string" || name === "") {
    return { ok: false, error: '"@call" must name a function.' };
  }
  if (name === "@index") {
    if (ctx.index === undefined) return { ok: false, error: '"@index" is only defined inside a list template.' };
    return { ok: true, value: ctx.index };
  }
  const rawArgs = call.args;
  if (rawArgs !== undefined && !isJsonObject(rawArgs)) {
    return { ok: false, error: `"${name}" args must be an object.` };
  }
  const args: JsonObject = {};
  for (const [key, raw] of Object.entries(rawArgs ?? {})) {
    const resolved = resolveDynamic(raw, ctx);
    if (!resolved.ok) return resolved;
    args[key] = (resolved.value ?? null) as Json;
  }
  try {
    return { ok: true, value: runFunction(name, args, ctx) };
  } catch (cause) {
    return { ok: false, error: cause instanceof Error ? cause.message : String(cause) };
  }
}

function numberArg(args: JsonObject, key: string): number | undefined {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || Number.isNaN(value)) throw new Error(`"${key}" must be a number.`);
  return value;
}

function stringArg(args: JsonObject, key: string): string {
  const value = args[key];
  if (typeof value !== "string") throw new Error(`"${key}" must be a string.`);
  return value;
}

function runFunction(name: string, args: JsonObject, ctx: EvalContext): Json {
  switch (name) {
    case "required": {
      const value = args.value;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    }
    case "regex": {
      const value = String(args.value ?? "");
      const pattern = stringArg(args, "pattern");
      return new RegExp(pattern, "u").test(value);
    }
    case "length": {
      const value = String(args.value ?? "");
      const min = numberArg(args, "min");
      const max = numberArg(args, "max");
      if (min !== undefined && value.length < min) return false;
      if (max !== undefined && value.length > max) return false;
      return true;
    }
    case "numeric": {
      const value = args.value;
      if (typeof value !== "number") return false;
      const min = numberArg(args, "min");
      const max = numberArg(args, "max");
      if (min !== undefined && value < min) return false;
      if (max !== undefined && value > max) return false;
      return true;
    }
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(args.value ?? ""));
    case "and":
      return booleanList(args, "values").every(Boolean);
    case "or":
      return booleanList(args, "values").some(Boolean);
    case "not":
      return !truthy(args.value);
    case "formatString":
      return interpolate(stringArg(args, "value"), ctx);
    case "formatNumber": {
      const value = numberArg(args, "value");
      if (value === undefined) throw new Error('"value" is required.');
      const decimals = numberArg(args, "decimals");
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: args.grouping !== false,
      }).format(value);
    }
    case "formatCurrency": {
      const value = numberArg(args, "value");
      if (value === undefined) throw new Error('"value" is required.');
      const currency = stringArg(args, "currency");
      const decimals = numberArg(args, "decimals");
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: args.grouping !== false,
      }).format(value);
    }
    case "formatDate": {
      const value = args.value;
      const format = stringArg(args, "format");
      const date = new Date(String(value ?? ""));
      if (Number.isNaN(date.getTime())) throw new Error(`"value" is not a date: ${JSON.stringify(value)}`);
      return formatDate(date, format);
    }
    case "pluralize": {
      const value = numberArg(args, "value");
      if (value === undefined) throw new Error('"value" is required.');
      const category = new Intl.PluralRules().select(value);
      const fallback = args.other;
      const picked = args[category] ?? fallback;
      if (typeof picked !== "string") throw new Error('pluralize needs an "other" string.');
      return picked;
    }
    default:
      throw new Error(`Unsupported A2UI function "${name}".`);
  }
}

function booleanList(args: JsonObject, key: string): boolean[] {
  const value = args[key];
  if (!Array.isArray(value)) throw new Error(`"${key}" must be an array.`);
  return value.map(truthy);
}

function truthy(value: Json | undefined): boolean {
  if (isJsonObject(value) && typeof value.valid === "boolean") return value.valid;
  return Boolean(value);
}

function interpolate(template: string, ctx: EvalContext): string {
  return template.replace(/\\\$\{/g, "\u0000").replace(/\$\{([^}]*)\}/g, (_match, expression: string) => {
    const inner = expression.trim();
    if (inner.startsWith("/") || inner === "@index") {
      const resolved = resolveDynamic(inner === "@index" ? { "@call": "@index" } : { "@path": inner }, ctx);
      if (!resolved.ok) throw new Error(resolved.error);
      return resolved.value === undefined || resolved.value === null ? "" : String(resolved.value);
    }
    throw new Error(`formatString only supports paths and @index here, got "\${${inner}}".`);
  }).replace(/\u0000/g, "${");
}

function formatDate(date: Date, pattern: string): string {
  const monthLong = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
  const monthShort = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  const weekdayLong = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  const weekdayShort = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  const hours = date.getHours();
  const pad = (value: number) => String(value).padStart(2, "0");
  const tokens: Array<[RegExp, string]> = [
    [/yyyy/g, String(date.getFullYear())],
    [/yy/g, String(date.getFullYear()).slice(-2)],
    [/MMMM/g, monthLong],
    [/MMM/g, monthShort],
    [/MM/g, pad(date.getMonth() + 1)],
    [/(?<![A-Za-z])M(?![A-Za-z])/g, String(date.getMonth() + 1)],
    [/dd/g, pad(date.getDate())],
    [/(?<![A-Za-z])d(?![A-Za-z])/g, String(date.getDate())],
    [/EEEE/g, weekdayLong],
    [/(?<![A-Za-z])E(?![A-Za-z])/g, weekdayShort],
    [/HH/g, pad(hours)],
    [/(?<![A-Za-z])H(?![A-Za-z])/g, String(hours)],
    [/hh/g, pad(hours % 12 === 0 ? 12 : hours % 12)],
    [/(?<![A-Za-z])h(?![A-Za-z])/g, String(hours % 12 === 0 ? 12 : hours % 12)],
    [/mm/g, pad(date.getMinutes())],
    [/ss/g, pad(date.getSeconds())],
    [/(?<![A-Za-z])a(?![A-Za-z])/g, hours < 12 ? "AM" : "PM"],
  ];
  let output = pattern;
  for (const [match, replacement] of tokens) output = output.replace(match, replacement);
  return output;
}

// ---------------------------------------------------------------------------
// Validation rules and actions.

export function evaluateChecks(component: A2uiComponent, ctx: EvalContext): string[] {
  const checks = component["@checks"];
  if (!Array.isArray(checks)) return [];
  const messages: string[] = [];
  for (const rule of checks) {
    if (!isJsonObject(rule) || !("condition" in rule)) continue;
    const resolved = resolveDynamic(rule.condition, ctx);
    if (!resolved.ok) {
      messages.push(resolved.error);
      continue;
    }
    const value = resolved.value;
    const valid = isJsonObject(value) && typeof value.valid === "boolean" ? value.valid : truthy(value);
    if (valid) continue;
    const message =
      (isJsonObject(value) && typeof value.message === "string" && value.message) ||
      (typeof rule.message === "string" && rule.message) ||
      "This value is invalid.";
    messages.push(message);
  }
  return messages;
}

export type ActionResolution =
  | { kind: "event"; name: string; userMessage: string | null; context: JsonObject }
  | { kind: "function"; name: string; args: JsonObject }
  | { kind: "error"; message: string };

export function resolveAction(action: unknown, ctx: EvalContext): ActionResolution {
  if (!isJsonObject(action)) return { kind: "error", message: "The component has no action." };
  if ("event" in action) {
    const event = action.event;
    if (!isJsonObject(event) || typeof event.name !== "string" || event.name === "") {
      return { kind: "error", message: 'An event action needs a non-empty "name".' };
    }
    const userMessage = event.userMessage === undefined ? null : resolveDynamic(event.userMessage, ctx);
    if (userMessage !== null && !userMessage.ok) return { kind: "error", message: userMessage.error };
    const context: JsonObject = {};
    if (isJsonObject(event.context)) {
      for (const [key, raw] of Object.entries(event.context)) {
        const resolved = resolveDynamic(raw, ctx);
        if (!resolved.ok) return { kind: "error", message: resolved.error };
        context[key] = (resolved.value ?? null) as Json;
      }
    }
    return {
      kind: "event",
      name: event.name,
      userMessage: userMessage === null ? null : String(userMessage.value ?? ""),
      context,
    };
  }
  if ("functionCall" in action) {
    const call = action.functionCall;
    if (!isJsonObject(call) || typeof call["@call"] !== "string") {
      return { kind: "error", message: "A function action needs an object with @call." };
    }
    const args: JsonObject = {};
    for (const [key, raw] of Object.entries(isJsonObject(call.args) ? call.args : {})) {
      const value = resolveDynamic(raw, ctx);
      if (!value.ok) return { kind: "error", message: value.error };
      args[key] = (value.value ?? null) as Json;
    }
    return { kind: "function", name: call["@call"], args };
  }
  return { kind: "error", message: 'An action carries either "event" or "functionCall".' };
}

// ---------------------------------------------------------------------------
// Structure, for the validator and the renderer.

export type ChildRef =
  | { kind: "child"; id: string }
  | { kind: "list"; ids: string[] }
  | { kind: "template"; componentId: string; path: string };

export function childRefs(component: A2uiComponent): ChildRef[] {
  const refs: ChildRef[] = [];
  if (typeof component.child === "string") refs.push({ kind: "child", id: component.child });
  const children = component.children;
  if (Array.isArray(children)) {
    refs.push({ kind: "list", ids: children.filter((id): id is string => typeof id === "string") });
  } else if (isJsonObject(children) && typeof children.componentId === "string" && typeof children.path === "string") {
    refs.push({ kind: "template", componentId: children.componentId, path: children.path });
  }
  if (Array.isArray(component.tabs)) {
    for (const tab of component.tabs) {
      if (isJsonObject(tab) && typeof tab.child === "string") refs.push({ kind: "child", id: tab.child });
    }
  }
  if (typeof component.trigger === "string") refs.push({ kind: "child", id: component.trigger });
  if (typeof component.content === "string") refs.push({ kind: "child", id: component.content });
  return refs;
}

/** Ids reachable from `root`, for reporting orphans and dangling references. */
export function walkSurface(surface: A2uiSurface): {
  reachable: Set<string>;
  missing: string[];
} {
  const reachable = new Set<string>();
  const missing = new Set<string>();
  const queue = ["root"];
  while (queue.length > 0) {
    const id = queue.shift() as string;
    if (reachable.has(id)) continue;
    const component = surface.components.get(id);
    if (component === undefined) {
      missing.add(id);
      continue;
    }
    reachable.add(id);
    for (const ref of childRefs(component)) {
      if (ref.kind === "child") queue.push(ref.id);
      else if (ref.kind === "list") queue.push(...ref.ids);
      else queue.push(ref.componentId);
    }
  }
  return { reachable, missing: [...missing] };
}
