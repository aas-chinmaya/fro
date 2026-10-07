"use client";

import {
  DataTable,
  Pagination,
  Search,
  TableToolbar,
} from "@/components/data-table";

import CreditNoteFilters from "./credit-note-filters";
import { CreditNoteColumns } from "./credit-note-columns";
import type { CreditNote } from "../../types/credit-note.types";

interface CreditNoteTableProps {
  creditNotes: CreditNote[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  search: string;
  status: string;
  period: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function CreditNoteTable({
  creditNotes,
  loading = false,
  page = 1,
  totalPages = 1,
  search,
  status,
  period,
  onSearchChange,
  onStatusChange,
  onPeriodChange,
  onPageChange,
}: CreditNoteTableProps) {
  return (
    <div className="space-y-4">
      <TableToolbar>
        <Search
          placeholder="Search credit note..."
          value={search}
          onChange={onSearchChange}
        />
        <CreditNoteFilters
          value={status}
          onChange={onStatusChange}
          period={period}
          onPeriodChange={onPeriodChange}
        />
      </TableToolbar>

      <DataTable
        columns={CreditNoteColumns}
        data={creditNotes}
        loading={loading}
        emptyMessage="No credit notes found."
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
