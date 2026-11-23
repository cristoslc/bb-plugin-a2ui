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
});
