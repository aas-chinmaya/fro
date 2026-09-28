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
import type { Quotation } from "../../../types/quotation.types";

interface QuotationViewHeaderProps {
  quotation: Quotation;
  onDownload?: () => void;
  onStatusChange?: (
    status: "ACCEPTED" | "REJECTED",
    statusNote?: string,
  ) => void;
  statusLoading?: boolean;
  downloadLoading?: boolean;
}

/**
 * Status rules:
 * - DRAFT      → Edit only
 * - FINALIZED  → Accept / Reject (with confirm + statusNote)
 * - ACCEPTED / REJECTED / EXPIRED → no approve/reject again
 */
export function QuotationViewHeader({
  quotation,
  onDownload,
  onStatusChange,
  statusLoading,
  downloadLoading,
}: QuotationViewHeaderProps) {
  const router = useRouter();
  const status = String(quotation.quotationStatus || "DRAFT").toUpperCase();

  const canEdit = status === "DRAFT";
  const canAcceptReject = status === "FINALIZED";
  /** PDF only after finalized (not on draft) */
  const canDownload = status !== "DRAFT";

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"ACCEPTED" | "REJECTED" | null>(
    null,
  );
  const [statusNote, setStatusNote] = useState("");

  const openConfirm = (next: "ACCEPTED" | "REJECTED") => {
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
            onClick={() => router.push("/sales/quotations")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <p className="hidden text-[11px] text-gray-500 sm:block">
              Sales / Quotation
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="truncate text-sm font-semibold text-gray-900">
                {quotation.quotationNumber ?? "—"}
              </h1>
              <StatusBadge status={quotation.quotationStatus} />
              {quotation.prospectName ? (
                <span className="hidden truncate text-[11px] text-gray-500 sm:inline">
                  · {quotation.prospectName}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {canAcceptReject ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={statusLoading}
                onClick={() => openConfirm("ACCEPTED")}
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
                title="Accept"
              >
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">Accept</span>
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={statusLoading}
                onClick={() => openConfirm("REJECTED")}
                className="gap-1.5 bg-red-700 text-white hover:bg-red-600"
                title="Reject"
              >
                <XCircle className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">Reject</span>
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
              onClick={() =>
                router.push(`/sales/quotations/${quotation.id}/edit`)
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

      {confirmOpen && pendingStatus ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
          >
            <h2 className="text-base font-semibold text-slate-900">
              {pendingStatus === "ACCEPTED"
                ? "Accept quotation?"
                : "Reject quotation?"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {pendingStatus === "ACCEPTED"
                ? "This will mark the quotation as accepted."
                : "This will mark the quotation as rejected."}
            </p>

            <label className="mt-4 block text-xs font-medium text-slate-600">
              Note (optional)
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Add a status note…"
              className="mt-1 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />

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
                  pendingStatus === "ACCEPTED"
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-red-700 text-white hover:bg-red-600"
                }
              >
                {statusLoading
                  ? "Updating…"
                  : pendingStatus === "ACCEPTED"
                    ? "Confirm Accept"
                    : "Confirm Reject"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
