// Draws one A2UI surface with bb's own components and theme tokens.
//
// The renderer is declarative by design: it never evaluates code from the
// agent. Every expression goes through shared/protocol.ts, which resolves
// paths and a fixed list of catalog functions.
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Markdown } from "@get-bb/plugin-sdk/app";
import { CATALOG_COMPONENTS, type CatalogComponentName } from "@/catalog/generated";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePortalScopeProps } from "@/lib/portal-scope";
import {
  evaluateChecks,
  isJsonObject,
  readPointer,
  resolveAbsolutePath,
  resolveAction,
  resolveDynamic,
  safeMediaUrl,
  writePointer,
  type A2uiComponent,
  type A2uiSurface,
  type EvalContext,
  type EvalScope,
  type Json,
} from "@/shared/protocol";
import type { ActionEvent } from "@/shared/action-message";

export type SurfaceAction = ActionEvent;

interface EvalProps {
  surface: A2uiSurface;
  /** Effective data model: the surface's model plus any edits made in this card. */
  model: Json;
  scope?: EvalScope;
  index?: number;
  errors: Map<string, string[]>;
  write(pointer: string, value: Json): void;
  renderRef(id: string, scope?: EvalScope, index?: number): ReactNode;
  renderChildren(component: A2uiComponent, scope?: EvalScope, index?: number): ReactNode;
  dispatch(component: A2uiComponent, scope?: EvalScope, index?: number): void;
}

interface NodeProps extends EvalProps {
  component: A2uiComponent;
}

type ComponentRenderer = (props: NodeProps) => ReactNode;

function ctxOf(props: EvalProps): EvalContext {
  return { dataModel: props.model, scope: props.scope, index: props.index };
}

function resolvedText(props: EvalProps, value: unknown): { text: string; error?: string } {
  const resolved = resolveDynamic(value, ctxOf(props));
  if (!resolved.ok) return { text: "", error: resolved.error };
  const result = resolved.value;
  if (result === undefined || result === null) return { text: "" };
  return { text: typeof result === "string" ? result : String(result) };
}

function bindingOf(props: EvalProps, value: unknown): { text: string; pointer: string | null; error?: string } {
  const { text, error } = resolvedText(props, value);
  if (isJsonObject(value) && typeof value["@path"] === "string") {
    return { text, pointer: resolveAbsolutePath(value["@path"], ctxOf(props)), error };
  }
  return { text, pointer: null, error };
}

/** A bound boolean, and the absolute pointer to write it back to. */
function booleanBinding(props: EvalProps, value: unknown): { checked: boolean; pointer: string | null } {
  const resolved = resolveDynamic(value, ctxOf(props));
  const pointer = isJsonObject(value) && typeof value["@path"] === "string" ? resolveAbsolutePath(value["@path"], ctxOf(props)) : null;
  return { checked: resolved.ok && resolved.value === true, pointer };
}

/** A bound string list, and the absolute pointer to write it back to. */
function listBinding(props: EvalProps, value: unknown): { selected: string[]; pointer: string | null } {
  const resolved = resolveDynamic(value, ctxOf(props));
  const pointer = isJsonObject(value) && typeof value["@path"] === "string" ? resolveAbsolutePath(value["@path"], ctxOf(props)) : null;
  if (!resolved.ok || !Array.isArray(resolved.value)) return { selected: [], pointer };
  return { selected: resolved.value.filter((entry): entry is string => typeof entry === "string"), pointer };
}

function ErrorLine({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-destructive">{children}</p>;
}

function FieldErrors({ messages }: { messages: string[] | undefined }) {
  if (messages === undefined || messages.length === 0) return null;
  return (
    <>
      {messages.map((message, index) => (
        <ErrorLine key={index}>{message}</ErrorLine>
      ))}
    </>
  );
}

function weightStyle(component: A2uiComponent): CSSProperties | undefined {
  const weight = component.weight;
  if (typeof weight !== "number" || weight <= 0) return undefined;
  return { flex: `${weight} 1 0%` };
}

const JUSTIFY: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  spaceBetween: "justify-between",
  spaceAround: "justify-around",
  spaceEvenly: "justify-evenly",
};

const ALIGN: Record<string, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

function Text({ component, ...props }: NodeProps) {
  const { text, error } = resolvedText(props, component.text);
  const caption = component.variant === "caption";
  return (
    <div className={cn("min-w-0", caption && "text-xs text-muted-foreground")} style={weightStyle(component)}>
      {error === undefined ? <Markdown content={text} /> : <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}

function UnsupportedMedia({ what }: { what: string }) {
  return <ErrorLine>This renderer only loads http and https {what}.</ErrorLine>;
}

const IMAGE_VARIANT: Record<string, string> = {
  icon: "size-6 rounded-sm",
  avatar: "size-10 rounded-full",
  smallFeature: "size-24 rounded-md",
  mediumFeature: "max-h-64 w-full rounded-md",
  largeFeature: "max-h-96 w-full rounded-md",
  header: "h-40 w-full rounded-md",
};

const OBJECT_FIT: Record<string, string> = {
  contain: "object-contain",
  cover: "object-cover",
  fill: "object-fill",
  none: "object-none",
  scaleDown: "object-scale-down",
};

function Image({ component, ...props }: NodeProps) {
  const url = safeMediaUrl(resolvedText(props, component.url).text);
  const description = resolvedText(props, component.description).text;
  if (url === null) return <UnsupportedMedia what="images" />;
  return (
    <img
      src={url}
      alt={description}
      className={cn("bg-muted", IMAGE_VARIANT[String(component.variant ?? "mediumFeature")] ?? IMAGE_VARIANT.mediumFeature, OBJECT_FIT[String(component.fit ?? "fill")] ?? "object-fill")}
      style={weightStyle(component)}
    />
  );
}

function Video({ component, ...props }: NodeProps) {
  const url = safeMediaUrl(resolvedText(props, component.url).text);
  if (url === null) return <UnsupportedMedia what="videos" />;
  const poster = resolvedText(props, component.posterUrl).text;
  const posterUrl = poster === "" ? undefined : safeMediaUrl(poster) ?? undefined;
  const description = resolvedText(props, component.description).text;
  return (
    <video
      src={url}
      poster={posterUrl}
      controls
      aria-label={description === "" ? undefined : description}
      className="w-full rounded-md bg-muted"
      style={weightStyle(component)}
    />
  );
}

function AudioPlayer({ component, ...props }: NodeProps) {
  const url = safeMediaUrl(resolvedText(props, component.url).text);
  if (url === null) return <UnsupportedMedia what="audio" />;
  const description = resolvedText(props, component.description).text;
  return (
    <audio
      src={url}
      controls
      aria-label={description === "" ? undefined : description}
      className="w-full"
      style={weightStyle(component)}
    />
  );
}

const MATERIAL_ICONS: Record<string, string> = {
  accountCircle: "CircleUser",
  add: "Plus",
  arrowBack: "ArrowLeft",
  arrowForward: "ArrowRight",
  attachFile: "Paperclip",
  calendarToday: "Calendar",
  call: "Phone",
  camera: "Camera",
  check: "Check",
  close: "X",
  delete: "Trash2",
  download: "Download",
  edit: "Pencil",
  event: "CalendarDays",
  error: "CircleAlert",
  fastForward: "FastForward",
  favorite: "Heart",
  favoriteOff: "HeartOff",
  folder: "Folder",
  help: "CircleHelp",
  home: "House",
  info: "Info",
  locationOn: "MapPin",
  lock: "Lock",
  lockOpen: "LockOpen",
  mail: "Mail",
  menu: "Menu",
  moreVert: "EllipsisVertical",
  moreHoriz: "Ellipsis",
  notifications: "Bell",
  notificationsOff: "BellOff",
  pause: "Pause",
  payment: "CreditCard",
  person: "User",
  phone: "Phone",
  photo: "Image",
  play: "Play",
  print: "Printer",
  refresh: "RefreshCw",
  rewind: "Rewind",
  search: "Search",
  send: "Send",
  settings: "Settings",
  share: "Share2",
  shoppingCart: "ShoppingCart",
  skipNext: "SkipForward",
  skipPrevious: "SkipBack",
  star: "Star",
  starHalf: "StarHalf",
  starOff: "StarOff",
  stop: "Square",
  upload: "Upload",
  visibility: "Eye",
  visibilityOff: "EyeOff",
  volumeDown: "Volume1",
  volumeMute: "VolumeX",
  volumeOff: "VolumeX",
  volumeUp: "Volume2",
  warning: "TriangleAlert",
};

function IconComponent({ component, ...props }: NodeProps) {
  const raw = component.name;
  if (isJsonObject(raw) && typeof raw.svgPath === "string") {
    const path = resolvedText(props, raw.svgPath).text;
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-current" style={weightStyle(component)}>
        <path d={path} />
      </svg>
    );
  }
  const name = resolvedText(props, raw).text;
  const mapped = MATERIAL_ICONS[name];
  if (mapped === undefined) {
    return (
      <span className="rounded border border-border px-1 font-mono text-[10px] text-muted-foreground" title="Icon not in this renderer's map">
        {name}
      </span>
    );
  }
  return <Icon name={mapped} className="size-6" />;
}

function Divider({ component }: NodeProps) {
  const vertical = component.axis === "vertical";
  return <div role="separator" className={cn("bg-border", vertical ? "mx-2 w-px self-stretch" : "my-1 h-px w-full")} />;
}

function Row({ component, ...props }: NodeProps) {
  return (
    <div
      className={cn("flex min-w-0 flex-row gap-3", JUSTIFY[String(component.justify ?? "start")] ?? "justify-start", ALIGN[String(component.align ?? "stretch")] ?? "items-stretch")}
      style={weightStyle(component)}
    >
      {props.renderChildren(component, props.scope, props.index)}
    </div>
  );
}

function Column({ component, ...props }: NodeProps) {
  return (
    <div
      className={cn("flex min-w-0 flex-col gap-2", JUSTIFY[String(component.justify ?? "start")] ?? "justify-start", ALIGN[String(component.align ?? "stretch")] ?? "items-stretch")}
      style={weightStyle(component)}
    >
      {props.renderChildren(component, props.scope, props.index)}
    </div>
  );
}

function List({ component, ...props }: NodeProps) {
  const horizontal = component.direction === "horizontal";
  return (
    <div
      className={cn("flex min-w-0 gap-2", horizontal ? "flex-row items-start overflow-x-auto" : "flex-col", ALIGN[String(component.align ?? "stretch")] ?? "items-stretch")}
      style={weightStyle(component)}
    >
      {props.renderChildren(component, props.scope, props.index)}
    </div>
  );
}

function Card({ component, ...props }: NodeProps) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-3" style={weightStyle(component)}>
      {props.renderRef(String(component.child), props.scope, props.index)}
    </div>
  );
}

function Tabs({ component, ...props }: NodeProps) {
  const tabs = Array.isArray(component.tabs) ? component.tabs.filter(isJsonObject) : [];
  const [selected, setSelected] = useState(0);
  const active = tabs[Math.min(selected, Math.max(tabs.length - 1, 0))];
  return (
    <div className="min-w-0" style={weightStyle(component)}>
      <div role="tablist" className="mb-2 flex flex-wrap gap-1 border-b border-border pb-1">
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === selected}
            onClick={() => setSelected(index)}
            className={cn(
              "rounded px-2 py-1 text-xs",
              index === selected ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {resolvedText(props, tab.title).text}
          </button>
        ))}
      </div>
      <div role="tabpanel">{active === undefined ? null : props.renderRef(String(active.child), props.scope, props.index)}</div>
    </div>
  );
}

function Modal({ component, ...props }: NodeProps) {
  const [open, setOpen] = useState(false);
  // Scoped plugin CSS only reaches nodes inside the plugin root, so the
  // portalled overlay carries the scope attributes the build looks for.
  const portalScopeProps = usePortalScopeProps();
  // A one-line trigger measures about 19 pixels, and positioning the overlay
  // inside its wrapper clipped the panel to that strip. The overlay portals to
  // the page and fixes itself to the viewport, so the panel keeps its own
  // height and a tall surface scrolls inside it instead of being cut off.
  const overlay =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            {...portalScopeProps}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-3"
          >
            <div
              role="dialog"
              aria-modal="true"
              className="max-h-full w-full max-w-md overflow-y-auto rounded-lg border border-border bg-card p-3 shadow-lg"
            >
              <div className="mb-2 flex justify-end">
                <Button variant="ghost" size="icon" className="size-7" aria-label="Close" onClick={() => setOpen(false)}>
                  <Icon name="X" className="size-4" />
                </Button>
              </div>
              {props.renderRef(String(component.content), props.scope, props.index)}
            </div>
          </div>,
          document.body,
        )
      : null;
  return (
    <div className="relative" style={weightStyle(component)}>
      <div onClickCapture={() => setOpen(true)}>{props.renderRef(String(component.trigger), props.scope, props.index)}</div>
      {overlay}
    </div>
  );
}

function ButtonComponent({ component, ...props }: NodeProps) {
  const variant = String(component.variant ?? "default");
  const invalid = (props.errors.get(component.id) ?? []).length > 0;
  return (
    <div style={weightStyle(component)}>
      <Button
        type="button"
        size="sm"
        variant={variant === "primary" ? "default" : variant === "borderless" ? "ghost" : "outline"}
        className={cn(variant === "borderless" && "h-auto px-1")}
        aria-invalid={invalid || undefined}
        onClick={() => props.dispatch(component, props.scope, props.index)}
      >
        {props.renderRef(String(component.child), props.scope, props.index)}
      </Button>
    </div>
  );
}

function TextField({ component, ...props }: NodeProps) {
  const label = resolvedText(props, component.label).text;
  const binding = bindingOf(props, component.value);
  const placeholder = resolvedText(props, component.placeholder).text;
  const variant = String(component.variant ?? "shortText");
  const write = (value: string) => {
    if (binding.pointer === null) return;
    props.write(binding.pointer, variant === "number" ? Number(value) : value);
  };
  return (
    <label className="flex min-w-0 flex-col gap-1" style={weightStyle(component)}>
      {label === "" ? null : <span className="text-xs text-muted-foreground">{label}</span>}
      {variant === "longText" ? (
        <textarea
          value={binding.text}
          placeholder={placeholder}
          rows={3}
          onChange={(event) => write(event.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <Input
          value={binding.text}
          placeholder={placeholder}
          type={variant === "obscured" ? "password" : variant === "number" ? "number" : "text"}
          onChange={(event) => write(event.target.value)}
        />
      )}
      <FieldErrors messages={props.errors.get(component.id)} />
    </label>
  );
}

function CheckBox({ component, ...props }: NodeProps) {
  const label = resolvedText(props, component.label).text;
  const binding = booleanBinding(props, component.value);
  return (
    <div className="flex flex-col gap-1" style={weightStyle(component)}>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={binding.checked}
          onCheckedChange={(next) => {
            if (binding.pointer === null) return;
            props.write(binding.pointer, next === true);
          }}
        />
        <span className="min-w-0">{label}</span>
      </label>
      <FieldErrors messages={props.errors.get(component.id)} />
    </div>
  );
}

function ChoicePicker({ component, ...props }: NodeProps) {
  const label = resolvedText(props, component.label).text;
  const binding = listBinding(props, component.value);
  const selected = useMemo(() => new Set(binding.selected), [binding.selected]);
  const options = Array.isArray(component.options) ? component.options.filter(isJsonObject) : [];
  const multiple = component.variant === "multipleSelection";
  const select = (value: string) => {
    if (binding.pointer === null) return;
    const next = new Set(selected);
    if (multiple) {
      if (next.has(value)) next.delete(value);
      else next.add(value);
    } else {
      next.clear();
      next.add(value);
    }
    props.write(binding.pointer, [...next]);
  };
  const chips = component.displayStyle === "chips";
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5" style={weightStyle(component)}>
      {label === "" ? null : <legend className="text-xs text-muted-foreground">{label}</legend>}
      <div className={cn("flex gap-1.5", chips ? "flex-row flex-wrap" : "flex-col")}>
        {options.map((option, index) => {
          const value = String(option.value ?? "");
          const text = resolvedText(props, option.label).text;
          const active = selected.has(value);
          if (chips) {
            return (
              <button
                key={index}
                type="button"
                aria-pressed={active}
                onClick={() => select(value)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {text}
              </button>
            );
          }
          return (
            <label key={index} className="flex items-center gap-2 text-sm">
              <Checkbox checked={active} onCheckedChange={() => select(value)} aria-label={text} />
              <span className="min-w-0">{text}</span>
            </label>
          );
        })}
      </div>
      <FieldErrors messages={props.errors.get(component.id)} />
    </fieldset>
  );
}

function Slider({ component, ...props }: NodeProps) {
  const label = resolvedText(props, component.label).text;
  const binding = bindingOf(props, component.value);
  const current = Number(binding.text);
  const min = typeof component.min === "number" ? component.min : 0;
  const max = typeof component.max === "number" ? component.max : 100;
  const steps = typeof component.steps === "number" && component.steps > 1 ? component.steps - 1 : undefined;
  return (
    <label className="flex min-w-0 flex-col gap-1" style={weightStyle(component)}>
      <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono">{Number.isFinite(current) ? current : min}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={steps === undefined ? 1 : (max - min) / steps}
        value={Number.isFinite(current) ? current : min}
        onChange={(event) => {
          if (binding.pointer === null) return;
          props.write(binding.pointer, Number(event.target.value));
        }}
        className="w-full accent-[var(--primary,currentColor)]"
      />
      <FieldErrors messages={props.errors.get(component.id)} />
    </label>
  );
}

function DateTimeInput({ component, ...props }: NodeProps) {
  const label = resolvedText(props, component.label).text;
  const binding = bindingOf(props, component.value);
  const date = component.enableDate !== false;
  const time = component.enableTime === true;
  const type = date && time ? "datetime-local" : time ? "time" : "date";
  return (
    <label className="flex min-w-0 flex-col gap-1" style={weightStyle(component)}>
      {label === "" ? null : <span className="text-xs text-muted-foreground">{label}</span>}
      <Input
        type={type}
        value={binding.text}
        min={typeof component.min === "string" ? component.min : undefined}
        max={typeof component.max === "string" ? component.max : undefined}
        onChange={(event) => {
          if (binding.pointer === null) return;
          props.write(binding.pointer, event.target.value);
        }}
      />
      <FieldErrors messages={props.errors.get(component.id)} />
    </label>
  );
}

/** One renderer per Basic Catalog component. The `satisfies` clause fails
 *  typecheck when the vendored catalog gains a component this file cannot draw. */
export const COMPONENT_RENDERERS = {
  Text,
  Image,
  Icon: IconComponent,
  Video,
  AudioPlayer,
  Row,
  Column,
  List,
  Card,
  Tabs,
  Modal,
  Divider,
  Button: ButtonComponent,
  TextField,
  CheckBox,
  ChoicePicker,
  Slider,
  DateTimeInput,
} satisfies Record<CatalogComponentName, ComponentRenderer>;

function isTemplate(children: unknown): children is { componentId: string; path: string } {
  return isJsonObject(children) && typeof children.componentId === "string" && typeof children.path === "string";
}

function collectIds(children: unknown): string[] {
  if (!Array.isArray(children)) return [];
  return children.filter((id): id is string => typeof id === "string");
}

interface SurfaceViewProps {
  surface: A2uiSurface;
  onAction: (action: SurfaceAction) => void;
  onProblem: (message: string) => void;
}

export function SurfaceView({ surface, onAction, onProblem }: SurfaceViewProps) {
  const [edits, setEdits] = useState<ReadonlyArray<{ pointer: string; value: Json }>>([]);
  const [attempted, setAttempted] = useState(false);

  const model = useMemo(
    () => edits.reduce<Json>((current, edit) => writePointer(current, edit.pointer, edit.value), surface.dataModel),
    [edits, surface.dataModel],
  );

  const errors = useMemo(() => {
    const found = new Map<string, string[]>();
    const ctx: EvalContext = { dataModel: model };
    for (const component of surface.components.values()) {
      const messages = evaluateChecks(component, ctx);
      if (messages.length > 0) found.set(component.id, messages);
    }
    return found;
  }, [model, surface.components]);

  const failing = [...errors.values()].flat();

  const dispatch = (component: A2uiComponent, scope?: EvalScope, index?: number) => {
    const ctx: EvalContext = { dataModel: model, scope, index };
    const blocked = evaluateChecks(component, ctx);
    if (blocked.length > 0 || failing.length > 0) {
      setAttempted(true);
      onProblem(blocked.length > 0 ? blocked[0] : "Fix the highlighted fields before sending.");
      return;
    }
    const resolved = resolveAction(component.action, ctx);
    if (resolved.kind === "error") {
      onProblem(resolved.message);
      return;
    }
    if (resolved.kind === "function") {
      if (resolved.name === "openUrl") {
        const raw = resolved.args.url;
        const url = typeof raw === "string" ? safeMediaUrl(raw) : null;
        if (url === null) onProblem("openUrl only accepts http and https URLs.");
        else window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      onProblem(`The local function "${resolved.name}" is not available in this renderer.`);
      return;
    }
    onAction({
      surfaceId: surface.surfaceId,
      name: resolved.name,
      userMessage: resolved.userMessage,
      context: resolved.context,
      dataModel: surface.sendDataModel ? model : {},
    });
  };

  const renderRef = (id: string, scope?: EvalScope, index?: number): ReactNode => (
    <NodeView key={`${id}:${scope?.path ?? "root"}:${index ?? ""}`} id={id} {...{ surface, model, errors, scope, index, dispatch, renderRef, renderChildren, write: writeModel }} />
  );

  const renderChildren = (component: A2uiComponent, scope?: EvalScope, index?: number): ReactNode => {
    const children = component.children;
    if (isTemplate(children)) {
      const list = readPointer(model, children.path);
      if (!Array.isArray(list)) {
        return <p className="text-xs text-muted-foreground">Waiting for {children.path}…</p>;
      }
      return list.map((entry, position) => (
        <NodeView
          key={`${children.componentId}:${children.path}/${position}`}
          id={children.componentId}
          surface={surface}
          model={model}
          errors={errors}
          scope={{ value: entry, path: `${children.path}/${position}` }}
          index={position}
          write={writeModel}
          dispatch={dispatch}
          renderRef={renderRef}
          renderChildren={renderChildren}
        />
      ));
    }
    return collectIds(children).map((id) => renderRef(id, scope, index));
  };

  function writeModel(pointer: string, value: Json): void {
    setEdits((current) => [...current, { pointer, value }]);
  }

  return (
    <div className="min-w-0">
      {attempted && failing.length > 0 ? (
        <p role="alert" className="mb-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs text-destructive">
          {failing[0]}
        </p>
      ) : null}
      {renderRef("root")}
    </div>
  );
}

interface NodeViewProps {
  id: string;
  surface: A2uiSurface;
  model: Json;
  errors: Map<string, string[]>;
  scope?: EvalScope;
  index?: number;
  write(pointer: string, value: Json): void;
  dispatch(component: A2uiComponent, scope?: EvalScope, index?: number): void;
  renderRef(id: string, scope?: EvalScope, index?: number): ReactNode;
  renderChildren(component: A2uiComponent, scope?: EvalScope, index?: number): ReactNode;
}

function NodeView({ id, surface, ...rest }: NodeViewProps) {
  const component = surface.components.get(id);
  if (component === undefined) {
    return <p className="rounded border border-dashed border-border px-2 py-1 text-xs text-muted-foreground">Missing component “{id}”.</p>;
  }
  const Renderer = COMPONENT_RENDERERS[component.component as CatalogComponentName] as ComponentRenderer | undefined;
  if (Renderer === undefined) {
    return (
      <p className="rounded border border-dashed border-destructive/40 px-2 py-1 text-xs text-destructive">
        No renderer for “{component.component}”. Known: {Object.keys(COMPONENT_RENDERERS).join(", ")}.
      </p>
    );
  }
  return <Renderer component={component} {...rest} surface={surface} />;
}
