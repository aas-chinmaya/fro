"use client";

import { Button } from "@/components/ui/button";
import type { CreditNote } from "../../types/credit-note.types";
import { creditNoteColumns } from "./credit-note-columns";

interface Props {
  rows: CreditNote[];
  loading?: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
}

export function CreditNoteTable({
  rows,
  loading,
  page,
  totalPages,
  total,
  onPageChange,
  onRefresh,
}: Props) {
  const columns = creditNoteColumns(onRefresh);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs text-slate-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2.5 font-medium">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-slate-400"
                >
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-slate-400"
                >
                  No credit notes found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2.5 align-middle">
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {total} record{total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
