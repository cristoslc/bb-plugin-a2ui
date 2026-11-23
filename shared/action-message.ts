// Turns a resolved A2UI action into the message an agent receives.
//
// Chat has no return channel, so the renderer puts the action into the
// composer. This is the one place that decides what that text looks like, so
// the skill, the renderer and the tests agree on the shape.
import type { Json, JsonObject } from "./protocol";

const MAX_JSON_CHARS = 8_000;

export interface ActionEvent {
  surfaceId: string;
  name: string;
  userMessage: string | null;
  context: JsonObject;
  dataModel: Json;
}

export function formatActionMessage(event: ActionEvent): string {
  const lines = [`[a2ui action] ${event.name} (surface ${event.surfaceId})`];
  if (event.userMessage !== null && event.userMessage.trim() !== "") {
    lines.push("", event.userMessage.trim());
  }
  lines.push("", "context:", fence(event.context));
  if (event.dataModel !== null && !(typeof event.dataModel === "object" && Object.keys(event.dataModel as object).length === 0)) {
    lines.push("", "data model:", fence(event.dataModel));
  }
  return lines.join("\n");
}

function fence(value: Json): string {
  const text = JSON.stringify(value, null, 2) ?? "null";
  const bounded = text.length > MAX_JSON_CHARS ? `${text.slice(0, MAX_JSON_CHARS)}\n… truncated` : text;
  return ["```json", bounded, "```"].join("\n");
}
