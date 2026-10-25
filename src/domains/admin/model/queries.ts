import { z } from "zod";
import { MANAGEMENT_MODULES } from "@eco/core-contracts";
import { ADMIN_PAGE_SIZE } from "./datasets";

/** Input contract shared by the client hooks and the server functions. */
export const recordsInputSchema = z.object({
  module: z.enum(MANAGEMENT_MODULES),
  page: z.number().int().min(0).max(10_000).default(0),
  search: z.string().trim().max(120).default(""),
});

export type AdminRecordsInput = z.input<typeof recordsInputSchema>;
export type AdminRecordsQuery = z.output<typeof recordsInputSchema>;

export function parseRecordsInput(input: AdminRecordsInput): AdminRecordsQuery {
  return recordsInputSchema.parse(input);
}

/** Values crossing the server-function boundary must stay serializable. */
export type AdminCellValue = string | number | boolean | null | string[];

export type AdminRow = Record<string, AdminCellValue>;

export interface AdminRecordsResult {
  rows: AdminRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminAuditEntry {
  id: string;
  action: string;
  targetTable: string;
  summary: string;
  createdAt: number;
}

export interface AdminOverview {
  counts: Record<string, number>;
  activeThisWeek: number;
  syncRevision: number;
  storageBytes: number;
  recentAudit: AdminAuditEntry[];
  generatedAt: number;
}

export const EMPTY_RECORDS: AdminRecordsResult = {
  rows: [],
  total: 0,
  page: 0,
  pageSize: ADMIN_PAGE_SIZE,
};
