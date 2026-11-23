// bb-plugin-a2ui backend entry: the two tools the prompt-generate-validate
// loop needs. The renderer lives in app.tsx; this side owns validation so an
// agent can check a stream before it sends one.
import { type BbPluginApi } from "@get-bb/plugin-sdk";
import { z } from "zod";
import {
  CATALOG_COMPONENTS,
  CATALOG_FUNCTIONS,
  CATALOG_ID,
} from "./catalog/generated";
import { reduceStream, walkSurface } from "./shared/protocol";
import { validateState } from "./server/validate";

const MAX_SOURCE_CHARS = 200_000;
const MAX_TOOL_CHARS = 16_000;

function bounded(text: string): string {
  return text.length > MAX_TOOL_CHARS ? `${text.slice(0, MAX_TOOL_CHARS)}\n… truncated at ${MAX_TOOL_CHARS} characters` : text;
}

export default async function plugin(bb: BbPluginApi) {
  bb.log.info("a2ui loaded");

  bb.agents.registerTool({
    name: "a2ui_check",
    description:
      "Validate an A2UI v1.0 message stream before sending it in an ```a2ui fence. Returns surfaces, component counts and every diagnostic.",
    instructions:
      "Call a2ui_check on any A2UI stream before you send it. Fix every error it reports. Warnings are allowed when you mean them.",
    presentation: {
      label: { pending: "Checking A2UI", completed: "Checked A2UI" },
    },
    parameters: z.object({
      source: z.string().min(1).max(MAX_SOURCE_CHARS).describe("The fence body: one A2UI envelope per line."),
    }),
    async execute({ source }) {
      const state = reduceStream(source, false);
      const structural = validateState(state);
      const diagnostics = [...state.diagnostics, ...structural];
      const errors = diagnostics.filter((entry) => entry.severity === "error").length;
      const summary = state.surfaces.map((surface) => {
        const { reachable, missing } = walkSurface(surface);
        return {
          surfaceId: surface.surfaceId,
          catalogId: surface.catalogId,
          components: surface.components.size,
          reachable: reachable.size,
          missing,
          dataModelPaths: Array.isArray(surface.dataModel) ? [] : Object.keys(surface.dataModel ?? {}),
        };
      });
      return bounded(
        JSON.stringify(
          {
            ok: errors === 0 && state.surfaces.length > 0,
            catalogId: CATALOG_ID,
            errors,
            warnings: diagnostics.length - errors,
            surfaces: summary,
            diagnostics,
          },
          null,
          2,
        ),
      );
    },
  });

  bb.agents.registerTool({
    name: "a2ui_catalog",
    description: "Read one component or function from the A2UI v1.0 Basic Catalog, or list what the renderer supports.",
    presentation: {
      label: { pending: "Reading the A2UI catalog", completed: "Read the A2UI catalog" },
    },
    parameters: z.object({
      name: z.string().min(1).optional().describe("Component (Text, Button, ...) or function (formatDate, ...) to describe. Omit to list everything."),
    }),
    async execute({ name }) {
      if (name === undefined) {
        const components = Object.entries(CATALOG_COMPONENTS).map(([component, spec]) => ({
          component,
          description: spec.description,
        }));
        const functions = Object.entries(CATALOG_FUNCTIONS).map(([fn, spec]) => ({ function: fn, description: spec.description }));
        return bounded(JSON.stringify({ catalogId: CATALOG_ID, components, functions }, null, 2));
      }
      const component = CATALOG_COMPONENTS[name];
      if (component !== undefined) {
        return bounded(JSON.stringify({ catalogId: CATALOG_ID, component: name, ...component }, null, 2));
      }
      const fn = CATALOG_FUNCTIONS[name];
      if (fn !== undefined) {
        return bounded(JSON.stringify({ catalogId: CATALOG_ID, function: name, ...fn }, null, 2));
      }
      return bounded(
        JSON.stringify(
          {
            error: `"${name}" is not in the Basic Catalog.`,
            components: Object.keys(CATALOG_COMPONENTS),
            functions: Object.keys(CATALOG_FUNCTIONS),
          },
          null,
          2,
        ),
      );
    },
  });
}
