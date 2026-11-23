import { describe, expect, it } from "vitest";
import {
  CATALOG_COMPONENTS,
  CATALOG_FUNCTION_NAMES,
  CATALOG_ID,
} from "../catalog/generated";
import { reduceStream } from "../shared/protocol";
import { validateState } from "../server/validate";

function stream(...bodies: string[]): ReturnType<typeof reduceStream> {
  return reduceStream(
    bodies.map((body) => `{"version":"1.0",${body}}`).join("\n"),
    false,
  );
}

describe("generated catalog", () => {
  it("stays in step with the vendored JSON", async () => {
    const source = (await import("../catalog/basic.v1.json")) as { default: { catalogId: string; components: Record<string, unknown> } };
    expect(source.default.catalogId).toBe(CATALOG_ID);
    expect(Object.keys(CATALOG_COMPONENTS).sort()).toEqual(Object.keys(source.default.components).sort());
  });

  it("gives every component a description and only real required properties", () => {
    for (const [name, spec] of Object.entries(CATALOG_COMPONENTS)) {
      expect(spec.description, name).not.toBe("");
      for (const property of spec.required) {
        expect([...spec.properties, "component"], `${name}.${property}`).toContain(property);
      }
    }
  });

  it("lists the validation and formatting functions", () => {
    for (const name of ["required", "regex", "length", "numeric", "email", "and", "or", "not", "formatString", "formatDate"]) {
      expect(CATALOG_FUNCTION_NAMES).toContain(name);
    }
  });
});

describe("catalog validation", () => {
  it("accepts a small valid surface", () => {
    const state = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Text","text":"Hi"}]}`,
    );
    expect(validateState(state)).toEqual([]);
  });

  it("reports a missing root", () => {
    const state = stream(`"createSurface":{"surfaceId":"s"}`);
    expect(validateState(state).map((entry) => entry.code)).toContain("MISSING_ROOT");
  });

  it("reports an unknown component and lists the catalog", () => {
    const state = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Table","columns":[]}]}`,
    );
    const unknown = validateState(state).find((entry) => entry.code === "UNKNOWN_COMPONENT");
    expect(unknown?.message).toContain("Text");
  });

  it("reports a missing required property", () => {
    const state = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"TextField","label":"Name"}]}`,
    );
    const missing = validateState(state).find((entry) => entry.code === "MISSING_PROPERTY");
    expect(missing?.message).toContain('"value"');
  });

  it("reports a dangling child reference", () => {
    const state = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Card","child":"body"}]}`,
    );
    expect(validateState(state).map((entry) => entry.code)).toContain("DANGLING_CHILD");
  });

  it("warns about an orphan component and an unknown property", () => {
    const state = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Text","text":"Hi"},{"id":"extra","component":"Text","text":"x","colour":"red"}]}`,
    );
    const codes = validateState(state).map((entry) => entry.code);
    expect(codes).toContain("ORPHAN_COMPONENT");
    expect(codes).toContain("UNKNOWN_PROPERTY");
  });

  it("reports an unknown function call anywhere in a component", () => {
    const state = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Text","text":{"@call":"shout","args":{"value":"hi"}}}]}`,
    );
    expect(validateState(state).map((entry) => entry.code)).toContain("UNKNOWN_FUNCTION");
  });

  it("reports a template path that does not hold an array", () => {
    const state = stream(
      `"createSurface":{"surfaceId":"s","dataModel":{"items":"nope"},"components":[{"id":"root","component":"Column","children":{"componentId":"row","path":"/items"}},{"id":"row","component":"Text","text":"x"}]}`,
    );
    expect(validateState(state).map((entry) => entry.code)).toContain("BAD_TEMPLATE_PATH");
  });

  it("warns when a surface declares another catalog", () => {
    const state = stream(
      `"createSurface":{"surfaceId":"s","catalogId":"https://example.com/custom.json","components":[{"id":"root","component":"Text","text":"Hi"}]}`,
    );
    expect(validateState(state).map((entry) => entry.code)).toContain("CATALOG_ID");
  });

  it("rejects a non-http URL the renderer refuses (BAD_URL_SCHEME)", () => {
    // Probe: this stream returned ok before the URL check existed.
    const media = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Image","url":"javascript:alert(1)"}]}`,
    );
    expect(media.diagnostics).toEqual([]);
    expect(validateState(media).map((entry) => entry.code)).toContain("BAD_URL_SCHEME");

    const open = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Button","child":"label","action":{"functionCall":{"@call":"openUrl","args":{"url":"file:///etc/passwd"}}}},{"id":"label","component":"Text","text":"Open"}]}`,
    );
    expect(open.diagnostics).toEqual([]);
    expect(validateState(open).map((entry) => entry.code)).toContain("BAD_URL_SCHEME");

    // An empty poster is no poster, and the renderer draws it without an error.
    const emptyPoster = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Video","url":"https://example.com/a.mp4","posterUrl":""}]}`,
    );
    expect(validateState(emptyPoster).map((entry) => entry.code)).not.toContain("BAD_URL_SCHEME");
  });

  it("rejects a blank tab entry the renderer refuses (BAD_TAB_ENTRY)", () => {
    // Probe: this stream returned ok with only an orphan warning before the tab check existed.
    const state = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Tabs","tabs":[{"title":"One"}]},{"id":"panel","component":"Text","text":"x"}]}`,
    );
    expect(state.diagnostics).toEqual([]);
    const diagnostics = validateState(state);
    expect(diagnostics.map((entry) => entry.code)).toContain("BAD_TAB_ENTRY");
    expect(diagnostics.find((entry) => entry.code === "BAD_TAB_ENTRY")?.message).toContain('"child"');
  });

  it("rejects an action that sends nothing the renderer refuses (BAD_ACTION)", () => {
    // Probe: this stream returned ok before the action check existed.
    const state = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Button","child":"label","action":{}},{"id":"label","component":"Text","text":"Go"}]}`,
    );
    expect(state.diagnostics).toEqual([]);
    expect(validateState(state).map((entry) => entry.code)).toContain("BAD_ACTION");
  });

  it("rejects a child shape the renderer refuses (BAD_CHILD_SHAPE)", () => {
    // Probes: both streams returned ok with only an orphan warning before the shape check existed.
    const childArray = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Card","child":["body"]},{"id":"body","component":"Text","text":"Hi"}]}`,
    );
    expect(childArray.diagnostics).toEqual([]);
    expect(validateState(childArray).map((entry) => entry.code)).toContain("BAD_CHILD_SHAPE");

    const childrenString = stream(
      `"createSurface":{"surfaceId":"s","components":[{"id":"root","component":"Column","children":"body"},{"id":"body","component":"Text","text":"Hi"}]}`,
    );
    expect(childrenString.diagnostics).toEqual([]);
    expect(validateState(childrenString).map((entry) => entry.code)).toContain("BAD_CHILD_SHAPE");
  });
});
