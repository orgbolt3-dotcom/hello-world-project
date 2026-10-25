import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const fromRoot = (path: string) => fileURLToPath(new URL(path, `file://${projectRoot}/`));

export default defineConfig({
  root: projectRoot,
  resolve: {
    alias: {
      "@": fromRoot("./src"),
      "@eco/core-contracts": fromRoot("./packages/core-contracts/src/index.ts"),
      "@eco/core-logic": fromRoot("./packages/core-logic/src/index.ts"),
      "@eco/core-db": fromRoot("./packages/core-db/src/index.ts"),
      "@eco/core-sync": fromRoot("./packages/core-sync/src/index.ts"),
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: [fromRoot("./tests/setup.ts")],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".output", ".vinxi"],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    testTimeout: 5_000,
    hookTimeout: 5_000,
    pool: "forks",
    maxWorkers: 2,
  },
});
