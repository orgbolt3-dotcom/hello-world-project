import { useState } from "react";
import type { ManagementModuleDefinition } from "@eco/core-contracts";
import { useI18n } from "@/lib/i18n/useI18n";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminDataset } from "../model/datasets";
import type { AdminRecordsResult } from "../model/queries";
import { ModuleHeader } from "./ModuleHeader";
import { StateBlock } from "./StateBlock";
import { formatCell } from "./format";

interface Props {
  module: ManagementModuleDefinition;
  dataset: AdminDataset;
  result: AdminRecordsResult | undefined;
  loading: boolean;
  error: boolean;
  page: number;
  search: string;
  onSearch: (value: string) => void;
  onPage: (page: number) => void;
  onRetry: () => void;
}

/** Records module: searchable, paginated, read-only table of one dataset. */
export function AdminRecordsView({
  module,
  dataset,
  result,
  loading,
  error,
  page,
  search,
  onSearch,
  onPage,
  onRetry,
}: Props) {
  const { t, locale } = useI18n();
  const [draft, setDraft] = useState(search);

  const rows = result?.rows ?? [];
  const total = result?.total ?? 0;
  const pageSize = result?.pageSize ?? 25;
  const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);

  return (
    <div>
      <ModuleHeader module={module} />

      {dataset.searchColumn ? (
        <form
          className="mb-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch(draft.trim());
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t("admin.search.placeholder")}
            aria-label={t("common.search")}
            className="w-full max-w-sm rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-lg border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
          >
            {t("common.search")}
          </button>
        </form>
      ) : null}

      {loading || error || rows.length === 0 ? (
        <StateBlock loading={loading} error={error} empty={!loading && !error} onRetry={onRetry} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card/40">
            <table className="w-full min-w-[42rem] text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {dataset.columns.map((column) => (
                    <th key={column.key} className="whitespace-nowrap px-4 py-3 font-medium">
                      {t(column.labelKey as MessageKey)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((row, index) => (
                  <tr key={String(row["id"] ?? index)} className="hover:bg-muted/30">
                    {dataset.columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 align-top">
                        {column.format === "badge" ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                            {formatCell(row[column.key], column.format, locale)}
                          </span>
                        ) : (
                          <span
                            className={
                              column.format === "number" || column.format === "bytes"
                                ? "tabular-nums"
                                : undefined
                            }
                          >
                            {formatCell(row[column.key], column.format, locale)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {t("admin.rows.count")} {new Intl.NumberFormat(locale).format(total)}
            </span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => onPage(page - 1)}
                className="rounded-lg border border-border/60 px-3 py-1.5 disabled:opacity-40"
              >
                {t("admin.page.previous")}
              </button>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => onPage(page + 1)}
                className="rounded-lg border border-border/60 px-3 py-1.5 disabled:opacity-40"
              >
                {t("admin.page.next")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
