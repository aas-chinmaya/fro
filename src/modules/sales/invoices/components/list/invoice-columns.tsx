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
        const status =
          (
            row.original
              .invoiceStatus ?? ""
          ).toUpperCase();

        const variant =
          status === "PAID"
            ? "success"
            : status === "DRAFT"
              ? "secondary"
              : status ===
                  "PARTIALLY_PAID" ||
                status ===
                  "CANCELLED"
                ? "destructive"
                : "outline";

        return (
          <Badge variant={variant}>
            {status || "-"}
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
            <InvoiceActions
              id={invoice.id}
              invoiceNumber={
                invoice
                  .invoiceNumber ??
                invoice.id
              }
              status={
                invoice.invoiceStatus
              }
            />
          </div>
        );
      },

      enableSorting: false,
      enableHiding: false,
    },
  ];