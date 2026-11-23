// bb-plugin-a2ui frontend entry.
//
// An assistant reply carries an ```a2ui fence whose body is an A2UI v1.0
// JSON Lines stream. bb calls this renderer for each such fence and keeps the
// instance mounted while the reply streams, so a surface fills in as its
// updateComponents and updateDataModel messages arrive.
import { useCallback, useMemo, useState } from "react";
import {
  definePluginApp,
  useComposer,
  useComposers,
  type ExperimentalCodeFenceRendererProps,
} from "@get-bb/plugin-sdk/app";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatActionMessage } from "@/shared/action-message";
import { reduceStream, type Diagnostic } from "@/shared/protocol";
import { SurfaceView, type SurfaceAction } from "@/ui/render";

function Fence({ code, status, message }: ExperimentalCodeFenceRendererProps) {
  const streaming = status === "streaming";
  const state = useMemo(() => reduceStream(code, streaming), [code, streaming]);
  const [showSource, setShowSource] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // The timeline is not a composer slot, so pick this thread's composer.
  const composers = useComposers();
  const own = useComposer();
  const send = useCallback(
    (action: SurfaceAction) => {
      const composer =
        composers.find((candidate) => candidate.scope.kind === "thread" && candidate.scope.threadId === message.threadId) ?? own;
      try {
        composer.insert(formatActionMessage(action), { at: "end", block: true });
        setProblem(null);
      } catch (cause) {
        setProblem(cause instanceof Error ? cause.message : String(cause));
      }
    },
    [composers, own, message.threadId],
  );

  const errors = state.diagnostics.filter((entry) => entry.severity === "error");
  const shown = state.diagnostics.slice(0, 6);

  return (
    <div className="my-2 min-w-0 rounded-lg border border-border bg-card p-3 text-sm text-foreground">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="Boxes" className="size-3.5" />
          <span className="font-medium text-foreground">A2UI</span>
          <span>v1.0</span>
          <span aria-hidden="true">·</span>
          <span>
            {state.surfaces.length === 0
              ? streaming
                ? "waiting for a surface"
                : "no surface"
              : `${state.surfaces.length} surface${state.surfaces.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <Button type="button" size="sm" variant="ghost" className="h-6 gap-1 px-1.5 text-xs" onClick={() => setShowSource((value) => !value)} aria-pressed={showSource}>
          <Icon name={showSource ? "EyeOff" : "Code"} className="size-3.5" />
          {showSource ? "Hide source" : "Source"}
        </Button>
      </div>

      {problem === null ? null : (
        <p role="alert" className="mb-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs text-destructive">
          {problem}
        </p>
      )}

      {showSource ? (
        <pre className="max-h-96 overflow-auto rounded-md bg-muted p-2 text-xs">
          <code>{code.trim() === "" ? "(empty fence)" : code}</code>
        </pre>
      ) : (
        <div className="flex flex-col gap-3">
          {state.surfaces.map((surface) => (
            <div key={surface.surfaceId} className="min-w-0">
              <div className="mb-1 font-mono text-[10px] text-muted-foreground">{surface.surfaceId}</div>
              <SurfaceView surface={surface} onAction={send} onProblem={setProblem} />
            </div>
          ))}
          {state.surfaces.length === 0 && !streaming && errors.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
              This fence has no A2UI messages. Write one JSON envelope per line in an <code>a2ui</code> fence.
            </p>
          ) : null}
        </div>
      )}

      {shown.length === 0 ? null : (
        <ul className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
          {shown.map((entry, index) => (
            <DiagnosticRow key={index} entry={entry} />
          ))}
          {state.diagnostics.length > shown.length ? (
            <li className="text-xs text-muted-foreground">and {state.diagnostics.length - shown.length} more</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

function DiagnosticRow({ entry }: { entry: Diagnostic }) {
  return (
    <li className={cn("text-xs", entry.severity === "error" ? "text-destructive" : "text-muted-foreground")}>
      <span className="font-mono text-[10px]">{entry.code}</span>
      {entry.line === undefined ? null : <span className="font-mono text-[10px]"> line {entry.line}</span>}
      <span>: {entry.message}</span>
    </li>
  );
}

export default definePluginApp((app) => {
  app.slots.experimental_codeFenceRenderer({
    id: "a2ui",
    languages: ["a2ui"],
    component: Fence,
  });
});
