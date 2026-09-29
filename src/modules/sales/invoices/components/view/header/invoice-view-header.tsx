"use client";

import {
  ArrowLeft,
  Edit,
  FileDown,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/modules/sales/shared/components/ui/status-badge";
import type { Invoice } from "../../../types/invoice.types";

interface InvoiceViewHeaderProps {
  invoice: Invoice;
  onDownload?: () => void;
  downloadLoading?: boolean;
}

/**
 * Status rules (aligned with quotation):
 * - DRAFT  → Edit only
 * - other  → Download PDF only
 * No status-change actions on the view page for now.
 */
export function InvoiceViewHeader({
  invoice,
  onDownload,
  downloadLoading,
}: InvoiceViewHeaderProps) {
  const router = useRouter();
  const status = String(invoice.invoiceStatus || "DRAFT").toUpperCase();

  const canEdit = status === "DRAFT";
  const canDownload = status !== "DRAFT";

  return (
    <div className="flex h-12 w-full shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3 sm:h-14 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/sales/invoices")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <p className="hidden text-[11px] text-gray-500 sm:block">
            Sales / Invoice
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <h1 className="truncate text-sm font-semibold text-gray-900">
              {invoice.invoiceNumber ?? "—"}
            </h1>
            <StatusBadge status={invoice.invoiceStatus} />
            {invoice.buyerName ? (
              <span className="hidden truncate text-[11px] text-gray-500 sm:inline">
                · {invoice.buyerName}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {canDownload ? (
          <Button
            type="button"
            size="sm"
            disabled={downloadLoading || !onDownload}
            onClick={onDownload}
            className="gap-1.5 bg-red-700 text-white hover:bg-red-600"
            title="Download PDF"
          >
            {downloadLoading ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin" />
            ) : (
              <FileDown className="size-3.5 shrink-0" />
            )}
            <span className="hidden sm:inline">
              {downloadLoading ? "Downloading…" : "Download PDF"}
            </span>
          </Button>
        ) : null}

        {canEdit ? (
          <Button
            type="button"
            size="sm"
            onClick={() =>
              router.push(`/sales/invoices/${invoice.id}/edit`)
            }
            className="gap-1.5 bg-primary text-white"
            title="Edit"
          >
            <Edit className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
