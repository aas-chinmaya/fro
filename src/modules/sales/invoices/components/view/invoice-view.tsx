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
  const invoice = stableInvoice.current;

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

    generateInvoicePdf({
      ...invoice,
      businessLogo: businessCtx?.business?.logo?.trim() || null, // ← add logo here
    });

    notify.success("PDF downloaded");
  } catch {
    notify.error("Unable to generate PDF");
  } finally {
    setPdfBusy(false);
  }
};

  if ((isLoading || isFetching) && !invoice) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <p className="text-sm text-gray-500">Loading invoice…</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 bg-white">
        <p className="text-sm text-gray-500">Invoice not found</p>
        <button
          type="button"
          onClick={() => router.push("/sales/invoices")}
          className="text-sm text-primary underline underline-offset-2"
        >
          Go back
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
