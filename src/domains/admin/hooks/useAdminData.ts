import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { ManagementModuleKey } from "@eco/core-contracts";
import { getAdminOverview, getAdminViewer, listAdminRecords } from "../api/admin.functions";

/** Current viewer and their effective role. Drives what the dashboard renders. */
export function useAdminViewer() {
  const fetchViewer = useServerFn(getAdminViewer);
  return useQuery({
    queryKey: ["admin", "viewer"],
    queryFn: () => fetchViewer(),
    staleTime: 60_000,
  });
}

/** Platform counters for the dashboard home and the system modules. */
export function useAdminOverview(enabled = true) {
  const fetchOverview = useServerFn(getAdminOverview);
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => fetchOverview(),
    enabled,
    refetchInterval: 60_000,
  });
}

/** Paginated rows of a records module. */
export function useAdminRecords(module: ManagementModuleKey, page: number, search: string) {
  const fetchRecords = useServerFn(listAdminRecords);
  return useQuery({
    queryKey: ["admin", "records", module, page, search],
    queryFn: () => fetchRecords({ data: { module, page, search } }),
    placeholderData: (previous) => previous,
  });
}
