import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "docs/PROJECT_BIBLE.md",
  "docs/QUALITY.md",
  "docs/OPERATIONS.md",
  "docs/06-operations/performance-pwa.md",
  "src/lib/performance/performance-policy.ts",
  "src/lib/performance/performance-budget-policy.ts",
  "src/lib/performance/web-vitals.ts",
  "src/platform/pwa.ts",
  "scripts/check-performance-budgets.ts",
  "scripts/test-mobile-e2e.sh",
];

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const requiredScripts = ["check:pwa", "check:web-vitals", "check:performance-budget", "test:e2e"];

const missingFiles = requiredFiles.filter((path) => !existsSync(path));
const missingScripts = requiredScripts.filter((name) => !packageJson.scripts?.[name]);

if (missingFiles.length > 0 || missingScripts.length > 0) {
  const details = [
    ...missingFiles.map((path) => `missing file: ${path}`),
    ...missingScripts.map((name) => `missing script: ${name}`),
  ];
  throw new Error(`Global audit failed: ${details.join("; ")}`);
}

if (existsSync(".env")) {
  throw new Error("Global audit failed: tracked/local .env must not exist in CI.");
}

console.log(
  JSON.stringify({
    status: "ok",
    requiredFiles: requiredFiles.length,
    requiredScripts: requiredScripts.length,
    authentication: "out-of-scope",
  }),
);
