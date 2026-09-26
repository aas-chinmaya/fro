"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import {
  useGetInvoiceByIdQuery,
  useUpdateInvoiceStatusMutation,
  useDownloadInvoicePdfMutation,
} from "../../api/invoice.api";
import { InvoiceViewHeader } from "./header/invoice-view-header";
import { InvoicePreview } from "./invoice-preview";

interface InvoiceViewProps {
  id: string;
}

export function InvoiceView({ id }: InvoiceViewProps) {
  const router = useRouter();

  const {
    data: response,
    isLoading,
    isFetching,
    error: queryError,
  } = useGetInvoiceByIdQuery(id, { skip: !id });

  const [updateStatus, { isLoading: statusLoading }] =
    useUpdateInvoiceStatusMutation();
  const [downloadPdf, { isLoading: downloadLoading }] =
    useDownloadInvoicePdfMutation();

  const invoice = response?.data ?? null;
  const loading = isLoading || (isFetching && !invoice);
  const error = queryError
    ? (queryError as { data?: { message?: string } })?.data?.message ||
      "Failed to fetch invoice"
    : null;

  useEffect(() => {
    if (error && !invoice) notify.error(error);
  }, [error, invoice]);

  const handleStatusChange = async (
    status: "PAID" | "OVERDUE" | "CANCELLED" | "SENT" | "FINALIZED",
  ) => {
    if (!invoice?.id) return;
    try {
      const res = await updateStatus({
        id: invoice.id,
        data: { status },
      }).unwrap();
      notify.success(res.message || `Status updated to ${status}`);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(e?.data?.message || e?.message || "Failed to update status");
    }
  };

  const handleDownload = async () => {
    if (!invoice?.id) return;
    try {
      const blob = await downloadPdf(invoice.id).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber || "invoice"}.pdf`;
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

  if (loading && !invoice) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-destructive">Invoice not found</p>
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
      <InvoiceViewHeader
        invoice={invoice}
        onStatusChange={handleStatusChange}
        onDownload={handleDownload}
        statusLoading={statusLoading}
        downloadLoading={downloadLoading}
      />
      <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-3 sm:p-4 md:p-6">
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
}
