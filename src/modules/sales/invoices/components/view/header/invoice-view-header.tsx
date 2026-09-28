"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  FileDown,
  Loader2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/modules/sales/shared/components/ui/status-badge";
import type { Invoice } from "../../../types/invoice.types";

interface InvoiceViewHeaderProps {
  invoice: Invoice;
  onDownload?: () => void;
  onStatusChange?: (
    status: "PAID" | "CANCELLED",
    statusNote?: string,
  ) => void;
  statusLoading?: boolean;
  downloadLoading?: boolean;
}

/**
 * Status rules (aligned with quotation Accept/Reject flow):
 * - DRAFT      → Edit only
 * - FINALIZED / SENT / PARTIALLY_PAID → Mark Paid / Cancel
 * - PAID / CANCELLED / OVERDUE → no further status actions
 * - PDF only after not draft
 */
export function InvoiceViewHeader({
  invoice,
  onDownload,
  onStatusChange,
  statusLoading,
  downloadLoading,
}: InvoiceViewHeaderProps) {
  const router = useRouter();
  const status = String(invoice.invoiceStatus || "DRAFT").toUpperCase();

  const canEdit = status === "DRAFT";
  const canMarkPaidOrCancel = [
    "FINALIZED",
    "SENT",
    "PARTIALLY_PAID",
    "OVERDUE",
  ].includes(status);
  /** PDF only after finalized (not on draft) */
  const canDownload = status !== "DRAFT";

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"PAID" | "CANCELLED" | null>(
    null,
  );
  const [statusNote, setStatusNote] = useState("");

  const openConfirm = (next: "PAID" | "CANCELLED") => {
    setPendingStatus(next);
    setStatusNote("");
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (statusLoading) return;
    setConfirmOpen(false);
    setPendingStatus(null);
    setStatusNote("");
  };

  const confirmAction = () => {
    if (!pendingStatus) return;
    onStatusChange?.(pendingStatus, statusNote.trim() || undefined);
    closeConfirm();
  };

  return (
    <>
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
          {canMarkPaidOrCancel ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={statusLoading}
                onClick={() => openConfirm("PAID")}
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
                title="Mark Paid"
              >
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">Mark Paid</span>
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={statusLoading}
                onClick={() => openConfirm("CANCELLED")}
                className="gap-1.5 bg-red-700 text-white hover:bg-red-600"
                title="Cancel"
              >
                <XCircle className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            </>
          ) : null}

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
              variant="outline"
              onClick={() =>
                router.push(`/sales/invoices/${invoice.id}/edit`)
              }
              className="gap-1.5"
              title="Edit"
            >
              <Edit className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          ) : null}
        </div>
      </div>

      {confirmOpen && pendingStatus ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">
              {pendingStatus === "PAID"
                ? "Mark invoice as Paid?"
                : "Cancel this invoice?"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {pendingStatus === "PAID"
                ? "This will mark the invoice as fully paid."
                : "Cancelled invoices cannot be edited further."}
            </p>
            <label className="mt-3 block text-xs text-slate-600">
              Note (optional)
              <textarea
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                rows={3}
                maxLength={500}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Optional reason or reference…"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={statusLoading}
                onClick={closeConfirm}
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={statusLoading}
                onClick={confirmAction}
                className={
                  pendingStatus === "PAID"
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-red-700 text-white hover:bg-red-600"
                }
              >
                {statusLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : pendingStatus === "PAID" ? (
                  "Confirm Paid"
                ) : (
                  "Confirm Cancel"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
