"use client";

import { useMemo } from "react";
import AddServiceButton from "@/modules/items/components/services/AddServiceButton";
import ServiceTable from "@/modules/items/components/services/ServiceTable";
import { useServices } from "@/modules/items/hooks/useServices";

export default function ServicesPage() {
  const { services, loading, page, totalPages, totalRecords, search, refetch, setPage, setSearch, changeServiceStatus } = useServices();

  const pageTitle = useMemo(() => "Services", []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-gray-500">Manage service records with category and tax information.</p>
        </div>

        <div>
          <AddServiceButton />
        </div>
      </div>

      <ServiceTable
        services={services}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        search={search}
        onSearch={setSearch}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          refetch(nextPage);
        }}
        onStatusChange={async (id, status) => {
          await changeServiceStatus(id, status);
        }}
      />
    </div>
  );
}
