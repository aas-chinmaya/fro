"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import {
  useGetQuotationByIdQuery,
  useUpdateQuotationStatusMutation,
  useDownloadQuotationPdfMutation,
} from "../../api/quotation.api";
import type { Quotation } from "../../types/quotation.types";
import { generateQuotationPdf } from "../../lib/quotation-pdf";
import { QuotationViewHeader } from "./header/quotation-view-header";
import { QuotationPreview } from "./quotation-preview";
import { useBusiness } from "@/modules/sales/shared/hooks/use-business";

interface QuotationViewProps {
  id: string;
}

export function QuotationView({ id }: QuotationViewProps) {
  const router = useRouter();
  const stableQuotation = useRef<Quotation | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const {
    data: response,
    isLoading,
    isFetching,
    error: queryError,
  } = useGetQuotationByIdQuery(id, { skip: !id });

  const { data: businessCtx } = useBusiness();

  const [updateStatus, { isLoading: statusLoading }] =
    useUpdateQuotationStatusMutation();

  /** Backend PDF API kept for future use */
  const [, { isLoading: apiPdfLoading }] = useDownloadQuotationPdfMutation();

  const quotationFromQuery = response?.data ?? null;
  if (quotationFromQuery) {
    stableQuotation.current = quotationFromQuery;
  }

  // Same logo source for view page + PDF (from business context) — mirrors invoice
  const logoFromBusiness = businessCtx?.business?.logo?.trim() || null;
  const quotation = stableQuotation.current
    ? {
        ...stableQuotation.current,
        businessLogo:
          logoFromBusiness ||
          stableQuotation.current.businessLogo ||
          null,
      }
    : null;

  const error = queryError
    ? (queryError as { data?: { message?: string }; message?: string })?.data
        ?.message ||
      (queryError as { message?: string })?.message ||
      "Failed to fetch quotation"
    : null;

  useEffect(() => {
    if (error && !quotation) notify.error(error);
  }, [error, quotation]);

  const handleStatusChange = async (
    status: "ACCEPTED" | "REJECTED",
    statusNote?: string,
  ) => {
    if (!quotation?.id) return;
    try {
      const res = await updateStatus({
        id: quotation.id,
        data: {
          status,
          ...(statusNote ? { statusNote } : {}),
        },
      }).unwrap();
      notify.success(res.message || `Status updated to ${status}`);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(e?.data?.message || e?.message || "Failed to update status");
    }
  };

  const handleDownload = () => {
    if (!quotation) return;
    try {
      setPdfBusy(true);
      // quotation already includes businessLogo from business context
      generateQuotationPdf(quotation);
      notify.success("PDF downloaded");
    } catch {
      notify.error("Unable to generate PDF");
    } finally {
      setPdfBusy(false);
    }
  };

  if ((isLoading || isFetching) && !quotation) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <p className="text-sm text-gray-500">Loading quotation…</p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 bg-white">
        <p className="text-sm text-gray-500">Quotation not found</p>
        <button
          type="button"
          onClick={() => router.push("/sales/quotations")}
          className="text-sm text-primary underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col bg-white">
      <QuotationViewHeader
        quotation={quotation}
        onStatusChange={handleStatusChange}
        onDownload={handleDownload}
        statusLoading={statusLoading}
        downloadLoading={pdfBusy || apiPdfLoading}
      />
      <main className="w-full">
        <QuotationPreview quotation={quotation} />
      </main>
    </div>
  );
}
