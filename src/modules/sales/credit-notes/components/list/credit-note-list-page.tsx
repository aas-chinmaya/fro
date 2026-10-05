"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCreditNotes } from "../../api/credit-note.api";
import type { CreditNote, CreditNoteListParams } from "../../types/credit-note.types";
import { CreditNoteFilters } from "./credit-note-filters";
import { CreditNoteTable } from "./credit-note-table";

export function CreditNoteListPage() {
  const [rows, setRows] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<CreditNoteListParams>({
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCreditNotes(params);
      setRows(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Credit notes</h1>
          <p className="text-sm text-slate-500">
            Sales returns, adjustments and settlements
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/sales/credit-notes/create">
            <Plus className="h-4 w-4" />
            New credit note
          </Link>
        </Button>
      </div>

      <CreditNoteFilters
        params={params}
        onChange={(next) => setParams((p) => ({ ...p, ...next, page: 1 }))}
      />

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <CreditNoteTable
        rows={rows}
        loading={loading}
        page={params.page || 1}
        totalPages={totalPages}
        total={total}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
        onRefresh={load}
      />
    </div>
  );
}
