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
      { property: "og:title", content: "Gestion — Écosystème" },
      { property: "og:description", content: "Poste de pilotage de l'écosystème." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
