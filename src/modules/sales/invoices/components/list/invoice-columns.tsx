"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui";

import type { Invoice } from "../../types/invoice.types";

import InvoiceActions from "./invoice-actions";

// ==========================================================
// DATE FORMATTER
// ==========================================================

function formatDate(
  value?: string,
) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

// ==========================================================
// COLUMNS
// ==========================================================

export const InvoiceColumns: ColumnDef<Invoice>[] =
  [
    // ========================================================
    // INVOICE
    // ========================================================

    {
      accessorKey:
        "invoiceNumber",

      header: "Invoice",

      cell: ({ row }) => {
        const invoice =
          row.original;

        return (
          <div className="min-w-[180px]">
            <p className="font-medium">
              {invoice.invoiceNumber ??
                invoice.id}
            </p>

            <p className="text-xs text-muted-foreground">
              {invoice.buyerName ??
                "No customer"}
            </p>
          </div>
        );
      },
    },

    // ========================================================
    // INVOICE DATE
    // ========================================================

    {
      accessorKey:
        "invoiceDate",

      header: "Invoice Date",

      cell: ({ row }) => (
        <span>
          {formatDate(
            row.original
              .invoiceDate,
          )}
        </span>
      ),
    },


    // ========================================================
    // TOTAL
    // ========================================================

    {
      accessorKey:
        "totalAmount",

      header: "Total",

      cell: ({ row }) => {
        const amount =
          Number(
            row.original
              .grandTotal ?? 0,
          );

        return (
          <p className="font-medium">
            ₹
            {amount.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
          </p>
        );
      },
    },

    // ========================================================
    // STATUS
    // ========================================================

    {
      accessorKey: "status",

      header: "Status",

      cell: ({ row }) => {
        const status = (
          row.original.invoiceStatus ?? ""
        ).toUpperCase();

        // Distinct colors per invoice status
        const className =
          status === "DRAFT"
            ? "border-slate-300 bg-slate-100 text-slate-700"
            : status === "ISSUED"
              ? "border-blue-200 bg-blue-50 text-blue-800"
              : status === "PAID"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : status === "PARTIALLY_PAID"
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : status === "OVERDUE"
                    ? "border-orange-200 bg-orange-50 text-orange-900"
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

    // ========================================================
    // ACTIONS
    // ========================================================

    {
      id: "actions",

      header: () => (
        <div className="text-right">
          Actions
        </div>
      ),

      cell: ({ row }) => {
        const invoice =
          row.original;

        return (
          <div className="text-right">
            {invoice?.id ? (
              <InvoiceActions
                id={String(invoice.id)}
                invoiceNumber={
                  invoice.invoiceNumber ?? String(invoice.id)
                }
                status={invoice.invoiceStatus}
              />
            ) : null}
          </div>
        );
      },

      enableSorting: false,
      enableHiding: false,
    },
  ];