import { createFileRoute } from "@tanstack/react-router";
import { moduleByKey } from "@eco/core-logic";
import { AdminOverviewView } from "@/domains/admin/ui/AdminOverviewView";
import { useAdminOverview } from "@/domains/admin/hooks/useAdminData";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const overview = useAdminOverview();

  return (
    <AdminOverviewView
      module={moduleByKey("home")}
      overview={overview.data}
      loading={overview.isPending}
      error={overview.isError}
      onRetry={() => void overview.refetch()}
    />
  );
}
