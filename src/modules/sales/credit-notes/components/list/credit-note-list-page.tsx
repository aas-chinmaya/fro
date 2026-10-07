"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/modules/sales/shared/components/ui/page-header";
import { useGetCreditNotesQuery } from "../../api/credit-note.api";
import { creditNoteDateRange } from "../../utils/credit-note.utils";
import CreditNoteTable from "./credit-note-table";

export default function CreditNoteListPage() {
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

  const { data, isLoading, isFetching } = useGetCreditNotesQuery({
    page,
    limit: 10,
    search: search || undefined,
    status: status
      ? (status as
          | "ISSUED"
          | "REFUNDED"
          | "EXCHANGED"
          | "ADJUSTED"
          | "CANCELLED")
      : undefined,
    ...creditNoteDateRange(period),
  });

  return (
    <div className="flex w-full min-w-0 flex-col space-y-6">
      <PageHeader
        title="Credit notes"
        description="Manage sales returns and adjustments"
        actionLabel="Create Credit Note"
        onAction={() => router.push("/sales/credit-notes/create")}
      />

      <CreditNoteTable
        creditNotes={data?.data ?? []}
        loading={isLoading || isFetching}
        page={page}
        totalPages={data?.totalPages ?? data?.pagination?.totalPages ?? 1}
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
