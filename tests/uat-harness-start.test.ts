/**
 * The UAT harness starter (scripts/uat/harness.mjs): the runner boots its
 * vite harness through it, so the evidence it produces must come from THIS
 * run's own server and not from whatever stray server already answers the
 * port.
 */
import { createServer, type Server } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { startHarness } from "../scripts/uat/harness.mjs";

const started: Array<{ child: { kill(): void } }> = [];

function stopEverything() {
  for (const entry of started.splice(0)) entry.child.kill();
}

/** A HTTP server that has nothing to do with this repo's harness. */
function foreignServer(
  responder: (req: IncomingMessage, res: ServerResponse) => void,
): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer(responder);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

/** A free port the OS hands out, then releases for our caller to bind. */
function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.listen(0, "127.0.0.1", () => {
      const port = (probe.address() as { port: number }).port;
      probe.close(() => resolve(port));
    });
  });
}

afterEach(stopEverything);

describe("UAT harness startup", () => {
  it(
    "aborts loudly when the port is held by a foreign server",
    { timeout: 120_000 },
    async () => {
      const foreign = await foreignServer((_req, res) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end("<html><body>another tree's harness</body></html>");
      });
      const port = (foreign.address() as { port: number }).port;
      try {
        const outcome = await startHarness(port).then(
          (value) => ({ resolved: true as const, value }),
          (error: Error) => ({ resolved: false as const, error }),
        );
        if (outcome.resolved) {
          started.push(outcome.value);
          throw new Error(
            `startHarness accepted the foreign server on port ${port} as this run's harness (${outcome.value.base})`,
          );
        }
        expect(outcome.error.message).toMatch(/foreign|not this run's own harness/i);
      } finally {
        foreign.close();
        foreign.closeAllConnections();
      }
    },
  );

  it(
    "aborts loudly when a foreign harness echoes another run's token",
    { timeout: 120_000 },
    async () => {
      const foreign = await foreignServer((_req, res) => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ token: "the-other-run's-token" }));
      });
      const port = (foreign.address() as { port: number }).port;
      try {
        const outcome = await startHarness(port).then(
          (value) => ({ resolved: true as const, value }),
          (error: Error) => ({ resolved: false as const, error }),
        );
        if (outcome.resolved) {
          started.push(outcome.value);
          throw new Error(
            `startHarness accepted a foreign harness on port ${port} (${outcome.value.base})`,
          );
        }
        expect(outcome.error.message).toMatch(/foreign|not this run's own harness|identity/i);
      } finally {
        foreign.close();
        foreign.closeAllConnections();
      }
    },
  );

  it(
    "resolves once this run's own vite identity is verified on the port",
    { timeout: 120_000 },
    async () => {
      const port = await freePort();
      const { child, base } = await startHarness(port);
      started.push({ child });
      const home = await fetch(base);
      expect(home.ok).toBe(true);
      const body = await home.text();
      expect(body).toContain("data-bb-plugin-harness");
    },
  );
});
