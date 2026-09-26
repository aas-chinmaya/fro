"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/modules/sales/shared/components/ui/page-header";
import { useGetQuotationsQuery } from "../../api/quotation.api";
import { quotationDateRange } from "../../utils/quotation-form.utils";
import QuotationTable from "./quotation-table";

export default function QuotationListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useGetQuotationsQuery({
    page,
    limit: 10,
    search: search || undefined,
    status: status
      ? (status as
          | "DRAFT"
          | "SENT"
          | "ACCEPTED"
          | "REJECTED"
          | "EXPIRED"
          | "CANCELLED")
      : undefined,
    ...quotationDateRange(period),
  });

  return (
    <div className="flex w-full min-w-0 flex-col space-y-6">
      <PageHeader
        title="Quotations"
        description="Manage customer quotations"
        actionLabel="Create Quotation"
        onAction={() => router.push("/sales/quotations/create")}
      />

      <QuotationTable
        quotations={data?.data ?? []}
        loading={isLoading || isFetching}
        page={page}
        totalPages={data?.pagination?.totalPages ?? 1}
        search={searchInput}
        status={status}
        period={period}
        onSearchChange={setSearchInput}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        onPeriodChange={(v) => {
          setPeriod(v);
          setPage(1);
        }}
        onPageChange={setPage}
      />
    </div>
  );
}
