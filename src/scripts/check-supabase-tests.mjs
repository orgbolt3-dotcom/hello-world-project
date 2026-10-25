import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const testsDirectory = resolve("supabase/tests/database");
const requiredMigrations = [
  "20260912000000_protect_identity_trust_system_fields.sql",
  "20260912001000_secure_mission_transitions.sql",
  "20260912002000_harden_sync_protocol.sql",
  "20260912003000_secure_hybrid_assistant.sql",
  "20260912004000_operational_retention.sql",
  "20260912005000_profile_preferences.sql",
  "20260912006000_member_onboarding.sql",
  "20260912007000_secure_flash_lifecycle.sql",
  "20260912008000_private_flash_locations_scan.sql",
  "20260912009000_secure_public_flash_feed.sql",
  "20260912010000_secure_radar_lifecycle.sql",
  "20260912011000_radar_offline_sync.sql",
  "20260912012000_radar_matches_notifications.sql",
];

const failures = [];
for (const migration of requiredMigrations) {
  try {
    await access(resolve("supabase/migrations", migration));
  } catch {
    failures.push(`missing migration: ${migration}`);
  }
}

let tests = [];
try {
  tests = (await readdir(testsDirectory)).filter((file) => file.endsWith(".test.sql")).sort();
} catch {
  failures.push("missing Supabase database test directory");
}

if (tests.length === 0) failures.push("no .test.sql database test found");
for (const test of tests) {
  const content = await readFile(resolve(testsDirectory, test), "utf8");
  if (!/^BEGIN;/m.test(content)) failures.push(`${test}: missing BEGIN`);
  if (!/SELECT\s+plan\s*\(/i.test(content)) failures.push(`${test}: missing pgTAP plan`);
  if (!/SELECT\s+\*\s+FROM\s+finish\s*\(\s*\)/i.test(content))
    failures.push(`${test}: missing finish()`);
  if (!/ROLLBACK;/i.test(content)) failures.push(`${test}: missing ROLLBACK`);
  if (/\bsb_secret_[A-Za-z0-9_-]{20,}\b/.test(content))
    failures.push(`${test}: embedded secret signature`);
}

if (failures.length) {
  console.error(`Supabase test contract failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Supabase test contract passed: ${tests.length} database test file(s).`);
}
