"use client";

import { useState } from "react";
import { ArrowLeft, Ban, FileDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { notify } from "@/lib/toast";
import { cancelCreditNote } from "../../../api/credit-note.api";
import type { CreditNote } from "../../../types/credit-note.types";

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
  const canCancel = status === "ISSUED";
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const label = creditNote.creditNoteNumber || creditNote.id;

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelCreditNote(creditNote.id);
      notify.success("Credit note cancelled successfully");
      setOpen(false);
      onCancelled?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(
        e?.data?.message || e?.message || "Failed to cancel credit note",
      );
    } finally {
      setLoading(false);
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
              {creditNote.customerName ? (
                <span className="hidden truncate text-[11px] text-gray-500 sm:inline">
                  · {creditNote.customerName}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {canAdjust ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAdjust}
            >
              Adjust / settle
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={downloadLoading}
            onClick={onDownload}
          >
            {downloadLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            PDF
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cancel credit note"
            title={
              canCancel
                ? "Cancel credit note"
                : `Cannot cancel when status is ${status}`
            }
            disabled={!canCancel}
            onClick={() => {
              if (!canCancel) return;
              setOpen(true);
            }}
            className="hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
          >
            <Ban className="size-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Cancel credit note"
        description={`Cancel ${label}? This cannot be undone.`}
        confirmLabel="Cancel note"
        loading={loading}
        onConfirm={handleCancel}
      />
    </>
  );
}
