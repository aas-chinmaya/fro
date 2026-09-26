"use client";

import {
  DataTable,
  Pagination,
  Search,
  TableToolbar,
} from "@/components/data-table";

import InvoiceFilters from "./invoice-filters";
import { InvoiceColumns } from "./invoice-columns";

import type { Invoice } from "../../types/invoice.types";

// ==========================================================
// PROPS
// ==========================================================

interface InvoiceTableProps {
  invoices: Invoice[];

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

export default function InvoiceTable({
  invoices,
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
}: InvoiceTableProps) {
  return (
    <div className="space-y-4">
      {/* ====================================================
          TOOLBAR
      ==================================================== */}

      <TableToolbar>
        <Search
          placeholder="Search invoice..."
          value={search}
          onChange={onSearchChange}
        />

        <InvoiceFilters
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
        columns={InvoiceColumns}
        data={invoices}
        loading={loading}
        emptyMessage="No invoices found."
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