"use client";

import { useState } from "react";
import {
  ArrowLeft,
  FileDown,
  Loader2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { notify } from "@/lib/toast";
import { useCancelCreditNoteMutation } from "@/modules/sales/credit-notes/api/credit-note.api";
import type { CreditNote } from "@/modules/sales/credit-notes/types/credit-note.types";

function statusChipClass(status: string) {
  const s = status.toUpperCase();
  if (s === "ISSUED") return "border-blue-200 bg-blue-50 text-blue-800";
  if (s === "REFUNDED" || s === "EXCHANGED" || s === "ADJUSTED")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (s === "CANCELLED") return "border-red-200 bg-red-50 text-red-800";
  return "border-slate-200 bg-white text-slate-700";
}

interface CreditNoteViewHeaderProps {
  creditNote: CreditNote;
  onDownload?: () => void;
  downloadLoading?: boolean;
  canAdjust?: boolean;
  onAdjust?: () => void;
  onCancelled?: () => void;
}

export function CreditNoteViewHeader({
  creditNote,
  onDownload,
  downloadLoading,
  canAdjust,
  onAdjust,
  onCancelled,
}: CreditNoteViewHeaderProps) {
  const router = useRouter();
  const status = String(creditNote.status || "ISSUED").toUpperCase();
  const isCancelled = status === "CANCELLED";
  // Cancelled → no PDF, no cancel, no adjust
  const canCancel = status === "ISSUED";
  const canDownload = !isCancelled;
  const showAdjust = Boolean(canAdjust) && !isCancelled;

  const [open, setOpen] = useState(false);
  const [cancelCreditNote, { isLoading: cancelling }] =
    useCancelCreditNoteMutation();
  const label = creditNote.creditNoteNumber || creditNote.id;

  const handleCancel = async () => {
    try {
      await cancelCreditNote({
        id: creditNote.id,
        data: { reason: "Cancelled by user" },
      }).unwrap();
      notify.success("Credit note cancelled");
      setOpen(false);
      onCancelled?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(
        e?.data?.message || e?.message || "Failed to cancel credit note",
      );
    }
  };

  return (
    <>
      <div className="flex h-12 w-full shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3 sm:h-14 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/sales/credit-notes")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <p className="hidden text-[11px] text-gray-500 sm:block">
              Sales / Credit note
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="truncate text-sm font-semibold text-gray-900">
                {creditNote.creditNoteNumber ?? "—"}
              </h1>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusChipClass(status)}`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {showAdjust ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAdjust}
            >
              Adjust / settle
            </Button>
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

          {canCancel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={cancelling}
              onClick={() => setOpen(true)}
              title="Cancel credit note"
            >
              {cancelling ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <XCircle className="size-3.5" />
              )}
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={open}
        title="Cancel credit note?"
        description={`Cancel ${label}? This cannot be undone.`}
        confirmLabel="Cancel note"
        cancelLabel="Keep"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
