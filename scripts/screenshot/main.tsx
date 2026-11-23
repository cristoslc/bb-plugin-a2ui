/**
 * Harness entry: mount the real app's registered `a2ui` fence renderer against
 * the simulated SDK. The stream comes from the `code` query parameter, so a
 * UAT step sets the fence body before the page loads. `theme` selects the
 * token set and `status` feeds the renderer's streaming flag.
 *
 * `window.__uatPushStream({ code, status })` replaces the fence props on the
 * mounted instance, the way a second agent reply replaces the fence body in
 * chat. The instance stays the same, so renderer state survives the push:
 * edits, the open tab and the open modal. The returned promise resolves once
 * React has committed the new frame and the browser has painted it, so a suite
 * can assert the pushed reply before the next action.
 *
 * `code` is the whole fence body the renderer reduces, not a delta. A pushed
 * reply that changes a surface therefore carries its own createSurface with
 * the same surface and component ids, which is what keeps the instance mounted.
 */
import "../../dist/app.css";
import "../../app";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { getMockComposer, getRegisteredFenceRenderer, type FenceStatus } from "./mock-sdk";

const params = new URLSearchParams(window.location.search);
const initialCode = params.get("code") ?? "";
const requestedStatus = params.get("status") ?? "closed";
const statuses: readonly FenceStatus[] = ["closed", "streaming", "unclosed"];
if (!statuses.includes(requestedStatus as FenceStatus)) {
  throw new Error(
    `harness: unknown status ${JSON.stringify(requestedStatus)} (have ${statuses.join(", ")})`,
  );
}
const initialStatus = requestedStatus as FenceStatus;
const theme = params.get("theme") ?? "dark";

document.documentElement.classList.toggle("dark", theme === "dark");
document.documentElement.dataset.uatTheme = theme;

const registration = getRegisteredFenceRenderer();
if (registration === null) {
  throw new Error("harness: the app registered no a2ui code fence renderer");
}
const Fence = registration.component;

const composer = getMockComposer();

const harnessState = {
  code: initialCode,
  status: initialStatus,
  theme,
  composer,
  fence: { id: registration.id, languages: registration.languages },
};
(window as unknown as { __a2uiHarness: typeof harnessState }).__a2uiHarness = harnessState;

const message = {
  id: "msg_uat",
  threadId: composer.scope.threadId,
  turnId: null,
  projectId: "proj_uat",
};

interface LiveStream {
  code: string;
  status: FenceStatus;
}

/**
 * Read one push payload. A missing status keeps the status already on the
 * fence; a status outside the known set fails loudly rather than guessing.
 */
function readPush(payload: unknown, currentStatus: FenceStatus): LiveStream {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("push_stream needs an object with a code string");
  }
  const { code: nextCode, status: nextStatus } = payload as {
    code?: unknown;
    status?: unknown;
  };
  if (typeof nextCode !== "string") {
    throw new Error("push_stream needs code to be a string");
  }
  if (nextStatus === undefined) return { code: nextCode, status: currentStatus };
  if (typeof nextStatus !== "string" || !statuses.includes(nextStatus as FenceStatus)) {
    throw new Error(
      `push_stream: unknown status ${JSON.stringify(nextStatus)} (have ${statuses.join(", ")})`,
    );
  }
  return { code: nextCode, status: nextStatus as FenceStatus };
}

declare global {
  interface Window {
    __uatPushStream?: (payload: unknown) => Promise<void>;
  }
}

function Original(): ReactNode {
  return <pre data-uat-original="">{initialCode}</pre>;
}

function Harness(): ReactNode {
  // `null` means "the stream from the query string". Every push installs a
  // fresh object, so an identical payload still re-renders and still settles.
  const [live, setLive] = useState<LiveStream | null>(null);
  const current = live ?? { code: initialCode, status: initialStatus };
  const currentRef = useRef(current);
  currentRef.current = current;
  // Resolvers waiting for the frame a push produced.
  const settling = useRef<Array<() => void>>([]);

  useEffect(() => {
    document.body.dataset.uatReady = "1";
  }, []);

  useEffect(() => {
    if (live === null) return;
    const waiting = settling.current;
    if (waiting.length === 0) return;
    settling.current = [];
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      for (const resolve of waiting) resolve();
    };
    // Two frames: one for React's commit, one for the browser paint. The timer
    // is a floor for a headless page that never paints, so a push cannot hang.
    requestAnimationFrame(() => requestAnimationFrame(settle));
    window.setTimeout(settle, 500);
  }, [live]);

  useEffect(() => {
    window.__uatPushStream = (payload: unknown): Promise<void> => {
      let next: LiveStream;
      try {
        next = readPush(payload, currentRef.current.status);
      } catch (cause) {
        return Promise.reject(cause);
      }
      return new Promise<void>((resolve) => {
        settling.current.push(resolve);
        harnessState.code = next.code;
        harnessState.status = next.status;
        setLive(next);
      });
    };
    return () => {
      delete window.__uatPushStream;
    };
  }, []);

  return (
    <div
      data-uat-shell=""
      style={{ padding: 16, maxWidth: 780, margin: "0 auto", minHeight: "100vh" }}
    >
      <div data-uat-fence="" data-uat-status={current.status}>
        <Fence
          code={current.code}
          language="a2ui"
          status={current.status}
          index={0}
          message={message}
          Original={Original}
        />
      </div>
      <div
        data-uat-composer-shell=""
        style={{
          marginTop: 16,
          borderTop: "1px solid var(--border)",
          paddingTop: 8,
        }}
      >
        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Composer</div>
        <pre
          id="composer-output"
          data-uat-composer=""
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            margin: 0,
            minHeight: 20,
          }}
        />
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement === null) throw new Error("harness: #root is missing");
createRoot(rootElement).render(<Harness />);
