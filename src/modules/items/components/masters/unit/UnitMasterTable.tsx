"use client";

import { useCallback } from "react";

import { DataTable, Pagination, Search, TableToolbar } from "@/components/data-table";

import type { UnitMasterRow } from "../../../types";
import { UnitMasterColumns } from "./UnitMasterColumns";

interface Props {
  units: UnitMasterRow[];
  loading?: boolean;

  page: number;
  totalPages: number;
  totalRecords: number;

  search: string;
  status: string;

  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onStatusChange: (status: string) => void;

  onRefresh?: () => void;
}

export default function UnitMasterTable({
  units,
  loading = false,

  page,
  totalPages,
  totalRecords,

  search,
  status,

  onPageChange,
  onSearch,
  onStatusChange,

  onRefresh,
}: Props) {
  const handleSearchChange = useCallback(
    (value: string) => {
      onSearch(value);
    },
    [onSearch]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onStatusChange(value);
    },
    [onStatusChange]
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      onPageChange(nextPage);
    },
    [onPageChange]
  );

  return (
    <div className="space-y-4">
      <TableToolbar>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Search
            placeholder="Search unit..."
            value={search}
            onChange={handleSearchChange}
            debounceMs={400}
          />
        </div>

        <div className="flex gap-2">
          <select
            value={status}
            onChange={(event) => {
              handleStatusChange(event.target.value);
            }}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </TableToolbar>

      <DataTable
        columns={UnitMasterColumns(onRefresh)}
        data={units}
        loading={loading}
        emptyMessage="No unit records found."
        page={page}
        pageSize={10}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
