"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Ban } from "lucide-react";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/toast";
import { useCancelCreditNoteMutation } from "../../api/credit-note.api";

type CreditNoteActionsProps = {
  id: string;
  creditNoteNumber?: string;
  status?: string | null;
};

export default function CreditNoteActions({
  id,
  creditNoteNumber,
  status,
}: CreditNoteActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelCreditNote, { isLoading: isCancelling }] =
    useCancelCreditNoteMutation();

  const normalized = (status || "").toUpperCase();
  const canCancel = normalized === "ISSUED";
  const label = creditNoteNumber || id;

  const handleCancel = async () => {
    const reason = cancelReason.trim() || "Cancelled by user";
    try {
      await cancelCreditNote({ id, data: { reason } }).unwrap();
      notify.success("Credit note cancelled successfully");
      setOpen(false);
      setCancelReason("");
      router.refresh();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(
        e?.data?.message || e?.message || "Failed to cancel credit note",
      );
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="View credit note"
          title="View credit note"
          onClick={() => router.push(`/sales/credit-notes/${id}`)}
          className="hover:bg-violet-50 hover:text-violet-600"
        >
          <Eye className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cancel credit note"
          title={
            canCancel
              ? "Cancel credit note"
              : `Cannot cancel when status is ${normalized || "locked"}`
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

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Cancel credit note
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Cancel {label}? This cannot be undone.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Why is this credit note being cancelled?"
                className="h-9"
                maxLength={1000}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setCancelReason("");
                }}
                disabled={isCancelling}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling || !cancelReason.trim()}
              >
                {isCancelling ? "Cancelling…" : "Cancel note"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
