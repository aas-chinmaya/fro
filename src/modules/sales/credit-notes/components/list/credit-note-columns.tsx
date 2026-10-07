"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import type { CreditNote } from "@/modules/sales/credit-notes/types/credit-note.types";
import CreditNoteActions from "./credit-note-actions";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const CreditNoteColumns: ColumnDef<CreditNote>[] = [
  {
    accessorKey: "creditNoteNumber",
    header: "Credit note",
    cell: ({ row }) => {
      const cn = row.original;
      return (
        <div className="min-w-[180px]">
          <p className="font-medium">{cn.creditNoteNumber ?? cn.id}</p>
          <p className="text-xs text-muted-foreground">
            {cn.customerName ?? "No customer"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "creditNoteDate",
    header: "Date",
    cell: ({ row }) => <span>{formatDate(row.original.creditNoteDate)}</span>,
  },
  {
    accessorKey: "grandTotal",
    header: "Total",
    cell: ({ row }) => {
      const amount = Number(row.original.grandTotal ?? 0);
      return (
        <p className="font-medium">
          ₹
          {amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.original.status ?? "").toUpperCase();
      const className =
        status === "ISSUED"
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : status === "REFUNDED" ||
              status === "EXCHANGED" ||
              status === "ADJUSTED"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : status === "CANCELLED"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-slate-200 bg-white text-slate-700";

      return (
        <Badge variant="outline" className={className}>
          {status || "—"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const cn = row.original;
      return (
        <div className="text-right">
          {cn?.id ? <CreditNoteActions id={String(cn.id)} /> : null}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
