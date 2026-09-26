"use client";

import { useCallback } from "react";
import { DataTable, Pagination, Search, TableToolbar } from "@/components/data-table";
import type { TaxMasterRow } from "../../../types";
import { TaxMasterMasterColumns } from "./TaxMasterMasterColumns";

interface Props {
  taxMasters: TaxMasterRow[];
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

export default function TaxMasterMasterTable({
  taxMasters,
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
  const handleSearch = useCallback((value: string) => onSearch(value), [onSearch]);
  const handleStatusChange = useCallback((value: string) => onStatusChange(value), [onStatusChange]);

  return (
    <div className="space-y-4">
      <TableToolbar>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Search placeholder="Search tax master..." value={search} onChange={handleSearch} debounceMs={400} />
        </div>

        <div className="flex gap-2">
          <select
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </TableToolbar>

      <DataTable columns={TaxMasterMasterColumns(onRefresh)} data={taxMasters} loading={loading} emptyMessage="No tax master records found." page={page} pageSize={10} />

      <Pagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={onPageChange} />
    </div>
  );
}
