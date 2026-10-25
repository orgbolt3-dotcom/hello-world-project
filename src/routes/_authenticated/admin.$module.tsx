import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { MANAGEMENT_MODULES, type ManagementModuleKey } from "@eco/core-contracts";
import { moduleByKey } from "@eco/core-logic";
import { datasetForModule, type AdminDataset } from "@/domains/admin/model/datasets";
import { AdminRecordsView } from "@/domains/admin/ui/AdminRecordsView";
import { AdminSystemView } from "@/domains/admin/ui/AdminSystemView";
import { useAdminOverview, useAdminRecords } from "@/domains/admin/hooks/useAdminData";

export const Route = createFileRoute("/_authenticated/admin/$module")({
  beforeLoad: ({ params }) => {
    if (!(MANAGEMENT_MODULES as readonly string[]).includes(params.module)) throw notFound();
  },
  component: AdminModulePage,
});

function AdminModulePage() {
  const { module: moduleParam } = Route.useParams();
  const key = moduleParam as ManagementModuleKey;
  const dataset = datasetForModule(key);

  return dataset ? (
    <RecordsModule key={key} moduleKey={key} dataset={dataset} />
  ) : (
    <SystemModule key={key} moduleKey={key} />
  );
}

function RecordsModule({
  moduleKey,
  dataset,
}: {
  moduleKey: ManagementModuleKey;
  dataset: AdminDataset;
}) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const records = useAdminRecords(moduleKey, page, search);

  return (
    <AdminRecordsView
      module={moduleByKey(moduleKey)}
      dataset={dataset}
      result={records.data}
      loading={records.isPending}
      error={records.isError}
      page={page}
      search={search}
      onSearch={(value) => {
        setPage(0);
        setSearch(value);
      }}
      onPage={setPage}
      onRetry={() => void records.refetch()}
    />
  );
}

function SystemModule({ moduleKey }: { moduleKey: ManagementModuleKey }) {
  const overview = useAdminOverview();

  return (
    <AdminSystemView
      module={moduleByKey(moduleKey)}
      overview={overview.data}
      loading={overview.isPending}
      error={overview.isError}
      onRetry={() => void overview.refetch()}
    />
  );
}
