import { createFileRoute } from "@tanstack/react-router";
import { moduleByKey } from "@eco/core-logic";
import { AdminOverviewView } from "@/domains/admin/ui/AdminOverviewView";
import { useAdminOverview } from "@/domains/admin/hooks/useAdminData";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [
    { title: "Vue d’ensemble — Gestion Écosystème" },
    { name: "description", content: "Vue d’ensemble de la gestion de l’écosystème." },
    { property: "og:title", content: "Vue d’ensemble — Gestion Écosystème" },
    { property: "og:description", content: "Vue d’ensemble de la gestion de l’écosystème." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
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
