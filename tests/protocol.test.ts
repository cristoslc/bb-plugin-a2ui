import { describe, expect, it } from "vitest";
import {
  A2UI_VERSION,
  deletePointer,
  evaluateChecks,
  parseStream,
  readPointer,
  reduceStream,
  resolveAction,
  resolveDynamic,
  walkSurface,
  writePointer,
  type A2uiState,
} from "../shared/protocol";
import { formatActionMessage } from "../shared/action-message";

const V = `"version":"${A2UI_VERSION}"`;

function line(body: string): string {
  return `{${V},${body}}`;
}

const surface = (id = "s1", extra = "") =>
  line(`"createSurface":{"surfaceId":"${id}"${extra}}`);

describe("framing", () => {
  it("reads one envelope per line", () => {
    const parsed = parseStream(`${surface()}\n${surface("s2")}\n`, false);
    expect(parsed.messages).toHaveLength(2);
    expect(parsed.diagnostics).toHaveLength(0);
  });

  it("accepts a whole JSON array as one payload", () => {
    const parsed = parseStream(`[${surface()},${surface("s2")}]`, false);
    expect(parsed.messages).toHaveLength(2);
  });

  it("treats a half-written line as pending while streaming", () => {
    const parsed = parseStream(`${surface()}\n{"version":"1.0","updateComp`, true);
    expect(parsed.messages).toHaveLength(1);
    expect(parsed.diagnostics).toHaveLength(0);
    expect(parsed.pending).toBe(true);
  });

  it("reports a broken line once the reply is closed", () => {
    const parsed = parseStream(`${surface()}\nnot json\n`, false);
    expect(parsed.diagnostics[0]).toMatchObject({ severity: "error", code: "MALFORMED_MESSAGE", line: 2 });
  });

  it("treats a pretty-printed message as pending, not a pile of errors", () => {
    const parsed = parseStream(`${surface()}\n{\n  "version": "1.0",`, true);
    expect(parsed.diagnostics).toHaveLength(0);
    expect(parsed.pending).toBe(true);
  });
});

describe("surface reduction", () => {
  it("applies create, components and data in order", () => {
    const state = reduceStream(
      [
        surface("s1", `,"sendDataModel":true`),
        line(
          `"updateComponents":{"surfaceId":"s1","components":[{"id":"root","component":"Text","text":"Hi"}]}`,
        ),
        line(`"updateDataModel":{"surfaceId":"s1","path":"/name","value":"Ada"}`),
      ].join("\n"),
      false,
    );
    expect(state.diagnostics).toEqual([]);
    expect(state.surfaces).toHaveLength(1);
    expect(state.surfaces[0].sendDataModel).toBe(true);
    expect(state.surfaces[0].components.get("root")?.component).toBe("Text");
    expect(readPointer(state.surfaces[0].dataModel, "/name")).toBe("Ada");
  });

  it("refuses a duplicate surface id", () => {
    const state = reduceStream(`${surface()}\n${surface()}`, false);
    expect(state.diagnostics[0].code).toBe("INTEGRITY_ERROR");
    expect(state.surfaces).toHaveLength(1);
  });

  it("refuses an update to a surface that does not exist", () => {
    const state = reduceStream(
      line(`"updateComponents":{"surfaceId":"ghost","components":[]}`),
      false,
    );
    expect(state.diagnostics[0]).toMatchObject({ code: "INTEGRITY_ERROR" });
  });

  it("rejects a message whose version is not 1.0", () => {
    const state = reduceStream(`{"version":"0.9","createSurface":{"surfaceId":"s1"}}`, false);
    expect(state.diagnostics[0].code).toBe("VERSION_MISMATCH");
  });

  it("rejects two envelope keys in one message", () => {
    const state = reduceStream(
      `{"version":"1.0","createSurface":{"surfaceId":"s1"},"deleteSurface":{"surfaceId":"s1"}}`,
      false,
    );
    expect(state.diagnostics[0].code).toBe("MALFORMED_MESSAGE");
  });

  it("deletes a surface and its data", () => {
    const state = reduceStream(`${surface()}\n${line(`"deleteSurface":{"surfaceId":"s1"}`)}`, false);
    expect(state.surfaces).toHaveLength(0);
  });

  it("deletes a data model key when the value is null", () => {
    const state = reduceStream(
      [
        surface("s1", `,"dataModel":{"a":1,"b":2}`),
        line(`"updateDataModel":{"surfaceId":"s1","path":"/b","value":null}`),
      ].join("\n"),
      false,
    );
    expect(readPointer(state.surfaces[0].dataModel, "/b")).toBeUndefined();
    expect(readPointer(state.surfaces[0].dataModel, "/a")).toBe(1);
  });

  it("rejects a component id that is not a UAX #31 identifier", () => {
    const state = reduceStream(
      [
        surface(),
        line(`"updateComponents":{"surfaceId":"s1","components":[{"id":"user-card","component":"Text","text":"x"}]}`),
      ].join("\n"),
      false,
    );
    expect(state.diagnostics[0].code).toBe("MALFORMED_MESSAGE");
    expect(state.surfaces[0].components.size).toBe(0);
  });
});

describe("pointers", () => {
  it("escapes ~0 and ~1 in tokens", () => {
    const root = { "a/b": { "c~d": 3 } };
    expect(readPointer(root, "/a~1b/c~0d")).toBe(3);
  });

  it("writes without mutating the input", () => {
    const root = { a: { b: 1 } };
    const next = writePointer(root, "/a/b", 2);
    expect(readPointer(next, "/a/b")).toBe(2);
    expect(readPointer(root, "/a/b")).toBe(1);
  });

  it("deletes array entries by index", () => {
    expect(deletePointer(["a", "b", "c"], "/1")).toEqual(["a", "c"]);
  });
});

describe("dynamic values", () => {
  const ctx = { dataModel: { name: "Ada", count: 3 }, scope: { value: { label: "item" }, path: "/items/2" }, index: 2 };

  it("resolves absolute and relative paths", () => {
    expect(resolveDynamic({ "@path": "/name" }, ctx)).toEqual({ ok: true, value: "Ada" });
    expect(resolveDynamic({ "@path": "label" }, ctx)).toEqual({ ok: true, value: "item" });
  });

  it("resolves @index inside a template", () => {
    expect(resolveDynamic({ "@call": "@index" }, ctx)).toEqual({ ok: true, value: 2 });
  });

  it("fails loudly outside a template", () => {
    expect(resolveDynamic({ "@call": "@index" }, { dataModel: {} })).toMatchObject({ ok: false });
  });

  it("formats numbers and strings", () => {
    const formatted = resolveDynamic({ "@call": "formatNumber", args: { value: 1234.5, decimals: 1 } }, ctx);
    expect(formatted.ok && formatted.value).toBe(
      new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: true }).format(1234.5),
    );
    expect(resolveDynamic({ "@call": "formatString", args: { value: "Hi ${/name}" } }, ctx)).toEqual({ ok: true, value: "Hi Ada" });
  });

  it("refuses a formatString expression it cannot evaluate", () => {
    expect(resolveDynamic({ "@call": "formatString", args: { value: "${now()}" } }, ctx)).toMatchObject({ ok: false });
  });

  it("refuses an unknown function", () => {
    expect(resolveDynamic({ "@call": "magic" }, ctx)).toMatchObject({ ok: false, error: 'Unsupported A2UI function "magic".' });
  });
});

describe("checks", () => {
  const ctx = { dataModel: { email: "nope" } };

  it("reports the rule's message when a check fails", () => {
    const messages = evaluateChecks(
      {
        id: "field",
        component: "TextField",
        "@checks": [
          { condition: { "@call": "email", args: { value: { "@path": "/email" } } }, message: "Enter a real email." },
        ],
      },
      ctx,
    );
    expect(messages).toEqual(["Enter a real email."]);
  });

  it("passes when every check holds", () => {
    const messages = evaluateChecks(
      {
        id: "field",
        component: "TextField",
        "@checks": [
          { condition: { "@call": "required", args: { value: { "@path": "/email" } } } },
          { condition: { "@call": "length", args: { value: { "@path": "/email" }, min: 2 } } },
        ],
      },
      ctx,
    );
    expect(messages).toEqual([]);
  });
});

describe("actions", () => {
  const ctx = { dataModel: { qty: 2 } };

  it("resolves context bindings and the user message", () => {
    const resolved = resolveAction(
      {
        event: {
          name: "order",
          userMessage: "Ordering",
          context: { qty: { "@path": "/qty" }, sku: "A-17" },
        },
      },
      ctx,
    );
    expect(resolved).toEqual({ kind: "event", name: "order", userMessage: "Ordering", context: { qty: 2, sku: "A-17" } });
  });

  it("reports a malformed action", () => {
    expect(resolveAction({}, ctx)).toMatchObject({ kind: "error" });
  });

  it("formats the message an agent receives", () => {
    const text = formatActionMessage({
      surfaceId: "order",
      name: "order",
      userMessage: "Ordering",
      context: { qty: 2 },
      dataModel: {},
    });
    expect(text).toContain("[a2ui action] order (surface order)");
    expect(text).toContain('"qty": 2');
    expect(text).not.toContain("data model:");
  });

  it("includes the data model when the surface sends it", () => {
    const text = formatActionMessage({
      surfaceId: "order",
      name: "order",
      userMessage: null,
      context: {},
      dataModel: { qty: 2 },
    });
    expect(text).toContain("data model:");
    expect(text).toContain('"qty": 2');
  });
});

describe("structure", () => {
  it("finds dangling children and orphan components", () => {
    const state: A2uiState = reduceStream(
      [
        surface(),
        line(
          `"updateComponents":{"surfaceId":"s1","components":[{"id":"root","component":"Column","children":["a","missing"]},{"id":"a","component":"Text","text":"x"},{"id":"orphan","component":"Text","text":"y"}]}`,
        ),
      ].join("\n"),
      false,
    );
    const walked = walkSurface(state.surfaces[0]);
    expect(walked.missing).toEqual(["missing"]);
    expect(walked.reachable.has("orphan")).toBe(false);
  });
});
