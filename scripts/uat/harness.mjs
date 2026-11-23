/**
 * Shared vite-harness startup for the A2UI UAT runner.
 *
 * The harness identifies itself by echoing back the per-run token the spawner
 * handed it. Without that handshake, "a fetch answered" is true even when the
 * answering server belongs to another tree, and two runs started together (or
 * a stray harness from an earlier session) photograph whichever server got to
 * the port first. A foreign server fails the run loudly; it is never accepted.
 */
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const HARNESS_CONFIG = fileURLToPath(new URL("../screenshot/vite.config.ts", import.meta.url));
const VITE_BIN = fileURLToPath(new URL("../../node_modules/vite/bin/vite.js", import.meta.url));
// The vite config's middleware serves the per-run token here.
const IDENTITY_PATH = "/__a2ui-harness/identity";
const HARNESS_TOKEN_ENV = "A2UI_HARNESS_TOKEN";

/** Ask the OS for an unused loopback port, then release it for vite to bind. */
export function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") {
        server.close(() => reject(new Error("could not read the free port")));
        return;
      }
      const { port } = address;
      server.close(() => resolve(port));
    });
  });
}

/**
 * Start vite and resolve once the server answering the port is THIS run's own
 * harness. Without a port, the run gets its own free one.
 */
export async function startHarness(port) {
  const targetPort = port ?? (await freePort());
  const token = randomUUID();
  const child = spawn(
    process.execPath,
    [VITE_BIN, "--config", HARNESS_CONFIG, "--port", String(targetPort), "--strictPort"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, [HARNESS_TOKEN_ENV]: token },
    },
  );
  let viteErrors = "";
  child.stderr.on("data", (chunk) => {
    const text = String(chunk);
    viteErrors += text;
    if (/error/i.test(text)) process.stderr.write(`  vite: ${text}`);
  });
  let exited = null; // set by the exit listener; code, or signal name
  child.once("exit", (code, signal) => {
    exited = code ?? signal;
  });
  const base = `http://localhost:${targetPort}/`;
  // What the foreign server claimed, when one answered the identity probe
  // with something that is not this run's token.
  let foreignClaim = null;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(`${base.slice(0, -1)}${IDENTITY_PATH}`);
      if (response.ok) {
        const payload = await response.json().catch(() => null);
        if (payload !== null && payload.token === token) {
          return { child, base };
        }
        foreignClaim =
          payload === null
            ? "the port answers, but not this run's identity probe"
            : "the port answers with another harness's identity token";
      }
    } catch {
      // Not up yet.
    }
    // A JSON answer with the wrong token (or an HTML answer where the identity
    // endpoint belongs) is unambiguous: this port is not this run's harness.
    // Stop polling at once instead of waiting out the full window.
    if (foreignClaim !== null) break;
    // Our own vite has already given up on the port (e.g. strictPort failed
    // because a foreign server holds it): report that immediately instead of
    // polling a port our process abandoned.
    if (exited !== null) break;
    await sleep(200);
  }
  child.kill();
  const tail = viteErrors
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .slice(-3);
  const detail = tail.length > 0 ? ` vite: ${tail.join(" | ")}` : "";
  if (foreignClaim !== null || exited !== null) {
    const foreignPart =
      foreignClaim !== null
        ? ` A foreign server was checked against this run's identity and rejected: ${foreignClaim}.`
        : "";
    const exitPart =
      exited !== null
        ? ` This run's own vite exited (${exited}) rather than binding.`
        : "";
    throw new Error(
      `port ${base} is not held by this run's own harness: refusing to photograph or drive another tree's server. Kill the foreign server or free the port, then rerun.${foreignPart}${exitPart}${detail}`,
    );
  }
  throw new Error(`harness did not come up on ${base}${detail}`);
}
