"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/modules/sales/shared/components/ui/page-header";
import { useGetInvoicesQuery } from "../../api/invoice.api";
import { invoiceDateRange } from "../../utils/invoice-form.utils";
import InvoiceTable from "./invoice-table";

export default function InvoiceListPage() {
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

  const { data, isLoading, isFetching } = useGetInvoicesQuery({
    page,
    limit: 10,
    search: search || undefined,
    status: status
      ? (status as
          | "DRAFT"
          | "SENT"
          | "PAID"
          | "PARTIALLY_PAID"
          | "OVERDUE"
          | "CANCELLED")
      : undefined,
    ...invoiceDateRange(period),
  });

  return (
    <div className="flex w-full min-w-0 flex-col space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage customer invoices"
        actionLabel="Create Invoice"
        onAction={() => router.push("/sales/invoices/create")}
      />

      <InvoiceTable
        invoices={data?.data ?? []}
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
