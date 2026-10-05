"use client";

import Link from "next/link";
import type { CreditNote } from "../../types/credit-note.types";
import {
  formatINR,
  reasonLabel,
  statusLabel,
} from "../../utils/credit-note.utils";
import { CreditNoteActions } from "./credit-note-actions";

function statusClass(status: string) {
  switch (status) {
    case "ISSUED":
      return "bg-blue-50 text-blue-700";
    case "REFUNDED":
    case "EXCHANGED":
    case "ADJUSTED":
      return "bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-50 text-slate-600";
  }
}

export function creditNoteColumns(onRefresh?: () => void) {
  return [
    {
      key: "number",
      header: "Credit note",
      cell: (row: CreditNote) => (
        <Link
          href={`/sales/credit-notes/${row.id}`}
          className="font-medium text-slate-900 hover:underline"
        >
          {row.creditNoteNumber || "—"}
        </Link>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (row: CreditNote) =>
        row.creditNoteDate
          ? new Date(row.creditNoteDate).toLocaleDateString("en-IN")
          : "—",
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row: CreditNote) => (
        <div>
          <div className="text-sm text-slate-800">{row.customerName}</div>
          {row.salesInvoiceNumber ? (
            <div className="text-[11px] text-slate-400">
              Inv: {row.salesInvoiceNumber}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      cell: (row: CreditNote) => (
        <span className="text-sm text-slate-600">{reasonLabel(row.reason)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: CreditNote) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(row.status)}`}
        >
          {statusLabel(row.status)}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row: CreditNote) => (
        <span className="tabular-nums text-sm text-slate-800">
          ₹{formatINR(row.grandTotal)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (row: CreditNote) => (
        <CreditNoteActions creditNote={row} onDone={onRefresh} />
      ),
    },
  ];
}
