import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const here = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

// Per-run self-identification: scripts/uat/harness.mjs spawns vite with an
// A2UI_HARNESS_TOKEN and accepts the answering server only once it echoes
// that exact token back here. A second run, or a stray server sharing the
// port, cannot be mistaken for this run's harness.
const IDENTITY_PATH = "/__a2ui-harness/identity";
const harnessToken = process.env.A2UI_HARNESS_TOKEN ?? null;

const harnessIdentity = (): Plugin => ({
  name: "a2ui-harness-identity",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.split("?")[0] !== IDENTITY_PATH) return next();
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ token: harnessToken }));
    });
  },
});

export default defineConfig({
  plugins: [harnessIdentity()],
  root: here,
  resolve: {
    alias: [
      // The harness renders the real app against a simulated SDK.
      {
        find: /^@get-bb\/plugin-sdk\/app$/,
        replacement: fileURLToPath(new URL("./mock-sdk.tsx", import.meta.url)),
      },
      { find: "@", replacement: repoRoot },
    ],
  },
  server: {
    strictPort: true,
    // The harness imports the plugin's compiled CSS from ../../dist/, which
    // sits outside this config root; without this allowance vite 403s it.
    fs: { allow: [repoRoot] },
  },
});
