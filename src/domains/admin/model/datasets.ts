import type { ManagementModuleKey } from "@eco/core-contracts";

/**
 * Declarative description of what each management module reads.
 * The registry is the single source of truth shared by the server functions
 * (which whitelist the table) and the UI (which renders the columns).
 * No component ever names a table or a column by itself.
 */

export const ADMIN_TABLES = [
  "profiles",
  "udi",
  "flashes",
  "missions",
  "posts",
  "media",
  "notifications",
  "audit",
  "user_roles",
] as const;

export type AdminTable = (typeof ADMIN_TABLES)[number];

export type AdminCellFormat = "text" | "identity" | "date" | "number" | "bytes" | "badge";

export interface AdminColumn {
  key: string;
  labelKey: string;
  format?: AdminCellFormat;
}

export interface AdminDataset {
  table: AdminTable;
  /** Column used to sort, newest first. */
  orderBy: string;
  /** Optional text column offered to the search field. */
  searchColumn?: string;
  columns: AdminColumn[];
}

const created: AdminColumn = { key: "created_at", labelKey: "admin.field.created", format: "date" };
const updated: AdminColumn = { key: "updated_at", labelKey: "admin.field.updated", format: "date" };

export const MODULE_DATASETS: Partial<Record<ManagementModuleKey, AdminDataset>> = {
  users: {
    table: "profiles",
    orderBy: "created_at",
    searchColumn: "display_name",
    columns: [
      { key: "display_name", labelKey: "admin.field.name" },
      { key: "handle", labelKey: "admin.field.handle" },
      { key: "status", labelKey: "admin.field.status", format: "badge" },
      { key: "locale", labelKey: "admin.field.locale", format: "badge" },
      { key: "trust_score", labelKey: "admin.field.trust", format: "number" },
      created,
    ],
  },
  udi: {
    table: "udi",
    orderBy: "created_at",
    columns: [
      { key: "user_id", labelKey: "admin.field.person", format: "identity" },
      { key: "level", labelKey: "admin.field.level", format: "badge" },
      { key: "verified_at", labelKey: "admin.field.verified", format: "date" },
      updated,
    ],
  },
  trust: {
    table: "profiles",
    orderBy: "trust_score",
    searchColumn: "display_name",
    columns: [
      { key: "display_name", labelKey: "admin.field.name" },
      { key: "trust_score", labelKey: "admin.field.trust", format: "number" },
      { key: "status", labelKey: "admin.field.status", format: "badge" },
      updated,
    ],
  },
  flash: {
    table: "flashes",
    orderBy: "created_at",
    searchColumn: "title",
    columns: [
      { key: "title", labelKey: "admin.field.title" },
      { key: "status", labelKey: "admin.field.status", format: "badge" },
      { key: "author_id", labelKey: "admin.field.author", format: "identity" },
      { key: "expires_at", labelKey: "admin.field.expires", format: "date" },
      created,
    ],
  },
  missions: {
    table: "missions",
    orderBy: "created_at",
    searchColumn: "title",
    columns: [
      { key: "title", labelKey: "admin.field.title" },
      { key: "status", labelKey: "admin.field.status", format: "badge" },
      { key: "reward_amount", labelKey: "admin.field.reward", format: "number" },
      { key: "assignee_id", labelKey: "admin.field.assignee", format: "identity" },
      { key: "due_at", labelKey: "admin.field.due", format: "date" },
    ],
  },
  social: {
    table: "posts",
    orderBy: "created_at",
    searchColumn: "body",
    columns: [
      { key: "body", labelKey: "admin.field.body" },
      { key: "visibility", labelKey: "admin.field.visibility", format: "badge" },
      { key: "reaction_count", labelKey: "admin.field.reactions", format: "number" },
      { key: "reply_count", labelKey: "admin.field.replies", format: "number" },
      created,
    ],
  },
  media: {
    table: "media",
    orderBy: "created_at",
    columns: [
      { key: "kind", labelKey: "admin.field.kind", format: "badge" },
      { key: "state", labelKey: "admin.field.state", format: "badge" },
      { key: "mime_type", labelKey: "admin.field.mime" },
      { key: "byte_size", labelKey: "admin.field.size", format: "bytes" },
      { key: "owner_id", labelKey: "admin.field.owner", format: "identity" },
    ],
  },
  notifications: {
    table: "notifications",
    orderBy: "created_at",
    columns: [
      { key: "title_key", labelKey: "admin.field.title" },
      { key: "channel", labelKey: "admin.field.channel", format: "badge" },
      { key: "recipient_id", labelKey: "admin.field.person", format: "identity" },
      { key: "read_at", labelKey: "admin.field.read", format: "date" },
      created,
    ],
  },
  audit: {
    table: "audit",
    orderBy: "created_at",
    searchColumn: "summary",
    columns: [
      { key: "action", labelKey: "admin.field.action", format: "badge" },
      { key: "target_table", labelKey: "admin.field.target" },
      { key: "summary", labelKey: "admin.field.summary" },
      { key: "actor_id", labelKey: "admin.field.actor", format: "identity" },
      created,
    ],
  },
  administration: {
    table: "user_roles",
    orderBy: "created_at",
    columns: [
      { key: "user_id", labelKey: "admin.field.person", format: "identity" },
      { key: "role", labelKey: "admin.field.role", format: "badge" },
      { key: "created_at", labelKey: "admin.field.created", format: "date" },
    ],
  },
};

export function datasetForModule(key: ManagementModuleKey): AdminDataset | undefined {
  return MODULE_DATASETS[key];
}

export const ADMIN_PAGE_SIZE = 25;
