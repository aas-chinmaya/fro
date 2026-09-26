"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import {
  useGetQuotationByIdQuery,
  useUpdateQuotationStatusMutation,
  useDownloadQuotationPdfMutation,
} from "../../api/quotation.api";
import { QuotationViewHeader } from "./header/quotation-view-header";
import { QuotationPreview } from "./quotation-preview";

interface QuotationViewProps {
  id: string;
}

export function QuotationView({ id }: QuotationViewProps) {
  const router = useRouter();

  const {
    data: response,
    isLoading,
    isFetching,
    error: queryError,
  } = useGetQuotationByIdQuery(id, { skip: !id });

  const [updateStatus, { isLoading: statusLoading }] =
    useUpdateQuotationStatusMutation();
  const [downloadPdf, { isLoading: downloadLoading }] =
    useDownloadQuotationPdfMutation();

  const quotation = response?.data ?? null;
  const loading = isLoading || (isFetching && !quotation);
  const error = queryError
    ? (queryError as { data?: { message?: string } })?.data?.message ||
      "Failed to fetch quotation"
    : null;

  useEffect(() => {
    if (error && !quotation) notify.error(error);
  }, [error, quotation]);

  const handleStatusChange = async (
    status: "ACCEPTED" | "REJECTED" | "CANCELLED" | "SENT" | "FINALIZED",
  ) => {
    if (!quotation?.id) return;
    try {
      const res = await updateStatus({
        id: quotation.id,
        data: { status },
      }).unwrap();
      notify.success(res.message || `Status updated to ${status}`);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(e?.data?.message || e?.message || "Failed to update status");
    }
  };

  const handleDownload = async () => {
    if (!quotation?.id) return;
    try {
      const blob = await downloadPdf(quotation.id).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quotation.quotationNumber || "quotation"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify.success("PDF downloaded");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(e?.data?.message || e?.message || "Failed to download PDF");
    }
  };

  if (loading && !quotation) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-destructive">Quotation not found</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-primary underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-col">
      <QuotationViewHeader
        quotation={quotation}
        onStatusChange={handleStatusChange}
        onDownload={handleDownload}
        statusLoading={statusLoading}
        downloadLoading={downloadLoading}
      />
      <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-3 sm:p-4 md:p-6">
        <QuotationPreview quotation={quotation} />
      </div>
    </div>
  );
}
