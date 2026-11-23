/**
 * Stand-in for `@get-bb/plugin-sdk/app`, used only by the A2UI screenshot
 * harness. Vite aliases the SDK specifier here, so the real app code
 * (app.tsx and ui/render.tsx) renders unmodified against the captured fence
 * renderer and a simulated composer.
 *
 * Styling here uses inline styles exclusively: dist/app.css contains only the
 * plugin's own compiled classes, so utility classes invented here would
 * silently not exist.
 */
import type { CSSProperties, ComponentType, ReactNode } from "react";

export type FenceStatus = "closed" | "streaming" | "unclosed";

export interface FenceProps {
  code: string;
  language: string;
  status: FenceStatus;
  index: number;
  message: {
    id: string;
    threadId: string;
    turnId: string | null;
    projectId: string | null;
  };
  Original: ComponentType;
}

interface FenceRegistration {
  id: string;
  languages: readonly string[];
  component: ComponentType<FenceProps>;
}

interface MockApp {
  slots: {
    experimental_codeFenceRenderer(registration: FenceRegistration): void;
  };
}

/** The registration the app makes at import time. */
export let registeredFenceRenderer: FenceRegistration | null = null;

export function definePluginApp(setup: (app: MockApp) => void): { id: string } {
  setup({
    slots: {
      experimental_codeFenceRenderer(registration) {
        registeredFenceRenderer = registration;
      },
    },
  });
  return { id: "a2ui-screenshot-mock" };
}

export function getRegisteredFenceRenderer(): FenceRegistration | null {
  return registeredFenceRenderer;
}

// ---------------------------------------------------------------------------
// Composer: the one sink the action path writes to.

export interface MockComposer {
  scope: { kind: "thread"; threadId: string };
  text: string;
  inserts: string[];
  insert(parts: unknown, options?: unknown): void;
}

function partText(part: unknown): string {
  if (typeof part === "string") return part;
  if (Array.isArray(part)) return part.map(partText).join("");
  if (part !== null && typeof part === "object") {
    const text = (part as { text?: unknown }).text;
    if (typeof text === "string") return text;
  }
  throw new Error(`mock composer: unsupported insert part ${JSON.stringify(part)}`);
}

const composer: MockComposer = {
  scope: { kind: "thread", threadId: "thr_uat" },
  text: "",
  inserts: [],
  insert(parts, options) {
    const added = partText(parts);
    const block = (options as { block?: unknown } | undefined)?.block === true;
    this.text = this.text + (block && this.text !== "" ? "\n\n" : "") + added;
    this.inserts.push(added);
    const output = document.getElementById("composer-output");
    if (output !== null) output.textContent = this.text;
  },
};

export function useComposer(): MockComposer {
  return composer;
}

export function useComposers(): readonly MockComposer[] {
  return [composer];
}

export function getMockComposer(): MockComposer {
  return composer;
}

// ---------------------------------------------------------------------------
// The few host-owned pieces the renderer draws with.

export function Markdown({ content }: { content: string; className?: string }): ReactNode {
  return (
    <div data-uat-markdown="" style={{ whiteSpace: "pre-wrap" }}>
      {content}
    </div>
  );
}

export function experimental_Icon({
  name,
  className,
  style,
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
}: {
  name: string;
  fallback?: string;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "false" | "true";
  "aria-label"?: string;
}): ReactNode {
  return (
    <span
      data-uat-icon={name}
      className={className}
      aria-hidden={ariaHidden ?? (ariaLabel === undefined ? "true" : undefined)}
      aria-label={ariaLabel}
      style={{ display: "inline-block", fontSize: 12, lineHeight: 1, ...style }}
    >
      {ariaLabel === undefined ? "\u2022" : null}
    </span>
  );
}
