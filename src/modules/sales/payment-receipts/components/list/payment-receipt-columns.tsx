

"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Banknote,
  CreditCard,
  CircleCheck,
  CircleX,
  FileText,
  Globe,
  Landmark,
  Smartphone,
  Store,
} from "lucide-react";

import {
  PaymentMethod,
  PaymentReceipt,
} from "../../types/payment-receipt.types";

import { PaymentReceiptActions } from "./payment-receipt-actions";

/* -------------------------------------------------------------------------- */
/* Payment Method Config                                                     */
/* -------------------------------------------------------------------------- */

const paymentMethodConfig: Record<
  PaymentMethod,
  {
    label: string;
    icon: typeof Banknote;
    className: string;
  }
> = {
  CASH: {
    label: "Cash",
    icon: Banknote,
    className: "text-success",
  },

  UPI: {
    label: "UPI",
    icon: Smartphone,
    className: "text-violet",
  },

  CARD: {
    label: "Card",
    icon: CreditCard,
    className: "text-info",
  },

  NET_BANKING: {
    label: "Net Banking",
    icon: Landmark,
    className: "text-warning",
  },
};


/* -------------------------------------------------------------------------- */
/* Receipt Status Config                                                     */
/* -------------------------------------------------------------------------- */

const statusConfig = {
  RECEIVED: {
    label: "Received",
    icon: CircleCheck,
    className: "bg-success/10 text-success",
  },

  CANCELLED: {
    label: "Cancelled",
    icon: CircleX,
    className: "bg-danger/10 text-danger",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Columns                                                                   */
/* -------------------------------------------------------------------------- */

export const PaymentReceiptColumns: ColumnDef<PaymentReceipt>[] = [
  /* ---------------------------------------------------------------------- */
  /* Receipt                                                                */
  /* ---------------------------------------------------------------------- */

  {
    accessorKey: "receiptNumber",
    header: "Receipt",

    cell: ({ row }) => {
      const receipt = row.original;

      return (
        <div className="flex flex-col">
          <span className="font-medium text-text">
            {receipt.receiptNumber}
          </span>

          {receipt.customerName && (
            <span className="text-sm text-muted">
              {receipt.customerName}
            </span>
          )}
        </div>
      );
    },
  },

  /* ---------------------------------------------------------------------- */
  /* Date                                                                   */
  /* ---------------------------------------------------------------------- */

  {
    accessorKey: "receiptDate",
    header: "Date",

    cell: ({ row }) => {
      const date = row.original.receiptDate;

      return (
        <span className="text-sm text-text">
          {new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      );
    },
  },

  /* ---------------------------------------------------------------------- */
  /* Amount                                                                 */
  /* ---------------------------------------------------------------------- */

  {
    accessorKey: "amount",
    header: "Amount",

    cell: ({ row }) => {
      const amount = Number(row.original.amount ?? 0);

      return (
        <span className="font-medium text-text">
          ₹
          {amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      );
    },
  },

  /* ---------------------------------------------------------------------- */
  /* Payment Method                                                         */
  /* ---------------------------------------------------------------------- */

  {
    id: "paymentMethod",
    header: "Payment Method",

    cell: ({ row }) => {
      const paymentMethod = row.original.payment?.paymentMethod;

      if (!paymentMethod) {
        return <span className="text-muted">—</span>;
      }

      const config = paymentMethodConfig[paymentMethod as PaymentMethod];

      if (!config) {
        return (
          <span className="inline-flex items-center rounded-full bg-muted/10 px-2.5 py-1 text-xs font-medium text-muted">
            {paymentMethod}
          </span>
        );
      }

      const Icon = config.icon;

      return (
        <div className="inline-flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.className}`} />

          <span className={`text-sm font-medium ${config.className}`}>
            {config.label}
          </span>
        </div>
      );
    },
  },

  /* ---------------------------------------------------------------------- */
  /* Status                                                                 */
  /* ---------------------------------------------------------------------- */

  {
    accessorKey: "receiptStatus",
    header: "Status",

    cell: ({ row }) => {
      const status = row.original.receiptStatus;

      const config =
        statusConfig[status as keyof typeof statusConfig];

      if (!config) {
        return (
          <span className="inline-flex items-center rounded-full bg-muted/10 px-2.5 py-1 text-xs font-medium text-muted">
            {status || "—"}
          </span>
        );
      }

      const Icon = config.icon;

      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
        >
          <Icon className="h-3.5 w-3.5" />

          {config.label}
        </span>
      );
    },
  },

  /* ---------------------------------------------------------------------- */
  /* Actions                                                                */
  /* ---------------------------------------------------------------------- */


{
  id: "actions",
  header: "",
  enableSorting: false,
  enableHiding: false,
  cell: ({ row }) => {
    const receipt = row.original;

    return (
      <div className="flex justify-end">
        <PaymentReceiptActions id={row.original.id} />
      </div>
    );
  },
},
];