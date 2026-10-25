import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/domains/admin/ui/AdminShell";
import { AdminAccessGate } from "@/domains/admin/ui/AdminAccessGate";
import { useAdminViewer } from "@/domains/admin/hooks/useAdminData";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Gestion — Écosystème" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Poste de pilotage de l'écosystème." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const viewer = useAdminViewer();

  return (
    <AdminAccessGate
      loading={viewer.isPending}
      error={viewer.isError}
      allowed={viewer.data?.canOpenDashboard ?? false}
      onRetry={() => void viewer.refetch()}
    >
      <AdminShell role={viewer.data?.role ?? "member"}>
        <Outlet />
      </AdminShell>
    </AdminAccessGate>
  );
}
