"use client";

import * as React from "react";

import {
  ColumnDef,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Checkbox } from "@/components/ui";
import { cn } from "@/components/ui/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  loading?: boolean;

  emptyMessage?: string;

  onRowClick?: (row: TData) => void;

  className?: string;

  /**
   * Current pagination page.
   * Example:
   * page = 1 → Sl No 1-10
   * page = 2 → Sl No 11-20
   */
  page?: number;

  /**
   * Number of records displayed per page.
   */
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found.",
  onRowClick,
  className,

  // Pagination
  page = 1,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>({});

  /**
   * Common columns
   */
  const commonColumns = React.useMemo<ColumnDef<TData>[]>(
    () => [
      /**
       * Checkbox column
       */
      {
        id: "select",

        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() &&
                "indeterminate")
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
            }}
            aria-label="Select all rows"
          />
        ),

        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
            }}
            aria-label="Select row"
          />
        ),

        enableSorting: false,
        enableHiding: false,
        size: 50,
      },

      /**
       * Serial Number column
       *
       * Page 1:
       * 1 - 10
       *
       * Page 2:
       * 11 - 20
       *
       * Page 3:
       * 21 - 30
       */
      {
        id: "slNo",

        header: "Sl No",

        cell: ({ row }) => {
          const serialNumber =
            (page - 1) * pageSize + row.index + 1;

          return (
            <span className="font-medium text-gray-700">
              {serialNumber}
            </span>
          );
        },

        enableSorting: false,
        enableHiding: false,
        size: 70,
      },
    ],
    [page, pageSize]
  );

  /**
   * React Table
   */
  const table = useReactTable({
    data,

    columns: [
      ...commonColumns,
      ...columns,
    ],

    state: {
      rowSelection,
    },

    enableRowSelection: true,

    onRowSelectionChange: setRowSelection,

    getCoreRowModel: getCoreRowModel(),
  });

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl border bg-white p-10 text-center shadow-sm",
          className
        )}
      >
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
          Loading...
        </div>
      </div>
    );
  }

  /**
   * Table
   */
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-sm",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* =========================
              TABLE HEADER
          ========================== */}
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b px-5 py-3 text-left text-sm font-semibold text-gray-700"
                    style={{
                      width:
                        header.getSize() !== 150
                          ? header.getSize()
                          : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* =========================
              TABLE BODY
          ========================== */}
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() =>
                    onRowClick?.(row.original)
                  }
                  data-state={
                    row.getIsSelected()
                      ? "selected"
                      : undefined
                  }
                  className={cn(
                    "transition-colors hover:bg-gray-50",

                    row.getIsSelected()
                      ? "bg-violet-50"
                      : "",

                    onRowClick
                      ? "cursor-pointer"
                      : ""
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-b px-5 py-4 text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              /* =========================
                 EMPTY STATE
              ========================== */
              <tr>
                <td
                  colSpan={
                    commonColumns.length +
                    columns.length
                  }
                  className="px-5 py-12 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}