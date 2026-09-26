"use client";

import type { Invoice } from "../../types/invoice.types";
import { InvoiceDocument } from "./preview/invoice-document";

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  return (
    <div className="min-h-full w-full overflow-x-auto ">
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}