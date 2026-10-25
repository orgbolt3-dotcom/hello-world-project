import { createHash } from "node:crypto";
import { readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function publicBuildDigest(): string {
  const directory = ".output/public";
  if (!statSync(directory).isDirectory()) {
    throw new Error("Reproducibility check failed: .output/public is missing.");
  }

  const hash = createHash("sha256");
  for (const path of filesUnder(directory).sort()) {
    hash.update(relative(directory, path));
    hash.update("\0");
    hash.update(readFileSync(path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function build(): void {
  execFileSync("bun", ["run", "build:check"], { stdio: "inherit" });
}

rmSync(".output", { recursive: true, force: true });
build();
const first = publicBuildDigest();

rmSync(".output", { recursive: true, force: true });
build();
const second = publicBuildDigest();

if (first !== second) {
  throw new Error(
    `Reproducibility check failed: public build digests differ (first=${first}, second=${second}).`,
  );
}

console.log(JSON.stringify({ status: "ok", publicBuildSha256: first }));
