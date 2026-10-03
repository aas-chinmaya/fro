"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import {
  useGetInvoiceByIdQuery,
  useDownloadInvoicePdfMutation,
} from "../../api/invoice.api";
import type { Invoice } from "../../types/invoice.types";
import { generateInvoicePdf } from "../../lib/invoice-pdf";
import { InvoiceViewHeader } from "./header/invoice-view-header";
import { InvoicePreview } from "./invoice-preview";
import { useBusiness } from "@/modules/sales/shared/hooks/use-business"; // ← add this import
interface InvoiceViewProps {
  id: string;
}

export function InvoiceView({ id }: InvoiceViewProps) {
  const router = useRouter();
  const stableInvoice = useRef<Invoice | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const {
    data: response,
    isLoading,
    isFetching,
    error: queryError,
  } = useGetInvoiceByIdQuery(id, { skip: !id });
const { data: businessCtx, isLoading: businessLoading } = useBusiness();  

  const [, { isLoading: apiPdfLoading }] = useDownloadInvoicePdfMutation();

  const invoiceFromQuery = response?.data ?? null;
  if (invoiceFromQuery) {
    stableInvoice.current = invoiceFromQuery;
  }
  // Same logo source for view page + PDF (from business context)
  const logoFromBusiness = businessCtx?.business?.logo?.trim() || null;
  const invoice = stableInvoice.current
    ? {
        ...stableInvoice.current,
        businessLogo:
          logoFromBusiness ||
          stableInvoice.current.businessLogo ||
          null,
      }
    : null;

  const error = queryError
    ? (queryError as { data?: { message?: string }; message?: string })?.data
        ?.message ||
      (queryError as { message?: string })?.message ||
      "Failed to fetch invoice"
    : null;

  useEffect(() => {
    if (error && !invoice) notify.error(error);
  }, [error, invoice]);

const handleDownload = () => {
  if (!invoice) return;
  try {
    setPdfBusy(true);

    // invoice already includes businessLogo from business context
    generateInvoicePdf(invoice);

    notify.success("PDF downloaded");
  } catch {
    notify.error("Unable to generate PDF");
  } finally {
    setPdfBusy(false);
  }
};

  if ((isLoading || isFetching) && !invoice) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
          <p className="text-sm text-slate-500">Loading invoice…</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 bg-white px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-7 w-7 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 2v6h6M9 15h6M9 11h6"
            />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-base font-semibold text-slate-800">
            Invoice not found
          </h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            This invoice may have been deleted or you don’t have access to it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/sales/invoices")}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 12H5M12 19l-7-7 7-7"
            />
          </svg>
          Back to invoices
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col bg-white">
      <InvoiceViewHeader
        invoice={invoice}
        onDownload={handleDownload}
        downloadLoading={pdfBusy || apiPdfLoading}
      />
      <main className="w-full">
        <InvoicePreview invoice={invoice} />
      </main>
    </div>
  );
}
