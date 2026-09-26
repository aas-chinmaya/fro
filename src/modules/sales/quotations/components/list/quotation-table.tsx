"use client";

import {
  DataTable,
  Pagination,
  Search,
  TableToolbar,
} from "@/components/data-table";

import QuotationFilters from "./quotation-filters";
import { QuotationColumns } from "./quotation-columns";

import type { Quotation } from "../../types/quotation.types";

// ==========================================================
// PROPS
// ==========================================================

interface QuotationTableProps {
  quotations: Quotation[];

  loading?: boolean;

  page?: number;
  totalPages?: number;

  search: string;
  status: string;
  period: string;

  onSearchChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: string,
  ) => void;

  onPeriodChange: (
    value: string,
  ) => void;

  onPageChange: (
    page: number,
  ) => void;
}

// ==========================================================
// COMPONENT
// ==========================================================

export default function QuotationTable({
  quotations,
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
}: QuotationTableProps) {
  return (
    <div className="space-y-4">
      {/* ====================================================
          TOOLBAR
      ==================================================== */}

      <TableToolbar>
        <Search
          placeholder="Search quotation..."
          value={search}
          onChange={onSearchChange}
        />

        <QuotationFilters
          value={status}
          onChange={onStatusChange}
          period={period}
          onPeriodChange={
            onPeriodChange
          }
        />
      </TableToolbar>

      {/* ====================================================
          TABLE
      ==================================================== */}

      <DataTable
        columns={QuotationColumns}
        data={quotations}
        loading={loading}
        emptyMessage="No quotations found."
      />

      {/* ====================================================
          PAGINATION
      ==================================================== */}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}