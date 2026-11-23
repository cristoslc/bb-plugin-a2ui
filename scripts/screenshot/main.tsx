/**
 * Harness entry: mount the real app's registered `a2ui` fence renderer against
 * the simulated SDK. The stream comes from the `code` query parameter, so a
 * UAT step sets the fence body before the page loads. `theme` selects the
 * token set and `status` feeds the renderer's streaming flag.
 */
import "../../dist/app.css";
import "../../app";
import { useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { getMockComposer, getRegisteredFenceRenderer, type FenceStatus } from "./mock-sdk";

const params = new URLSearchParams(window.location.search);
const code = params.get("code") ?? "";
const requestedStatus = params.get("status") ?? "closed";
const statuses: readonly FenceStatus[] = ["closed", "streaming", "unclosed"];
if (!statuses.includes(requestedStatus as FenceStatus)) {
  throw new Error(
    `harness: unknown status ${JSON.stringify(requestedStatus)} (have ${statuses.join(", ")})`,
  );
}
const status = requestedStatus as FenceStatus;
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
  code,
  status,
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

function Original(): ReactNode {
  return <pre data-uat-original="">{code}</pre>;
}

function Harness(): ReactNode {
  useEffect(() => {
    document.body.dataset.uatReady = "1";
  }, []);
  return (
    <div
      data-uat-shell=""
      style={{ padding: 16, maxWidth: 780, margin: "0 auto", minHeight: "100vh" }}
    >
      <div data-uat-fence="" data-uat-status={status}>
        <Fence
          code={code}
          language="a2ui"
          status={status}
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
