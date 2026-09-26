"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Download,
  Edit,
  Loader2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type {
  Quotation,
  QuotationStatus,
} from "../../../types/quotation.types";

interface QuotationViewHeaderProps {
  quotation: Quotation;
  onDownload?: () => void;
  onStatusChange?: (
    status: "ACCEPTED" | "REJECTED" | "CANCELLED" | "SENT" | "FINALIZED",
  ) => void;
  statusLoading?: boolean;
  downloadLoading?: boolean;
}

const STATUS_CHANGEABLE: QuotationStatus[] = ["DRAFT", "FINALIZED", "SENT"];

const NEXT_STATUSES: Record<
  string,
  Array<"SENT" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "FINALIZED">
> = {
  DRAFT: ["FINALIZED", "SENT", "CANCELLED"],
  FINALIZED: ["SENT", "ACCEPTED", "REJECTED", "CANCELLED"],
  SENT: ["ACCEPTED", "REJECTED", "CANCELLED"],
};

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function QuotationViewHeader({
  quotation,
  onDownload,
  onStatusChange,
  statusLoading,
  downloadLoading,
}: QuotationViewHeaderProps) {
  const router = useRouter();
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const canChangeStatus = STATUS_CHANGEABLE.includes(
    quotation.quotationStatus,
  );
  const canEdit = quotation.quotationStatus === "DRAFT";
  const canAccept =
    quotation.quotationStatus === "SENT" ||
    quotation.quotationStatus === "FINALIZED";
  const nextStatuses = NEXT_STATUSES[quotation.quotationStatus] ?? [];

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:h-14 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
            {quotation.quotationNumber ?? "Quotation"}
          </h1>
          <p className="truncate text-[11px] text-slate-500">
            {formatStatus(quotation.quotationStatus)}
            {quotation.prospectName ? ` · ${quotation.prospectName}` : ""}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {canAccept && (
          <>
            <button
              type="button"
              disabled={statusLoading}
              onClick={() => onStatusChange?.("ACCEPTED")}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Accept</span>
            </button>
            <button
              type="button"
              disabled={statusLoading}
              onClick={() => onStatusChange?.("REJECTED")}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reject</span>
            </button>
          </>
        )}

        {canChangeStatus && !canAccept && (
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              disabled={statusLoading}
              onClick={() => setStatusOpen((o) => !o)}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {statusLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              )}
              <span className="hidden sm:inline">Status</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            {statusOpen && !statusLoading && (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                {nextStatuses.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusOpen(false);
                      onStatusChange?.(st);
                    }}
                    className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {formatStatus(st)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onDownload}
          disabled={downloadLoading || !onDownload}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          title="Download PDF"
        >
          {downloadLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5 text-violet-600" />
          )}
          <span className="hidden sm:inline">
            {downloadLoading ? "…" : "Download"}
          </span>
        </button>

        {canEdit && (
          <button
            type="button"
            onClick={() =>
              router.push(`/sales/quotations/${quotation.id}/edit`)
            }
            className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-medium text-white transition hover:bg-primary/90"
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>
    </header>
  );
}
