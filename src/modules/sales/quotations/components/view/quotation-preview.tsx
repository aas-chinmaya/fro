"use client";

import type { Quotation } from "../../types/quotation.types";
import { QuotationDocument } from "./preview/quotation-document";

interface QuotationPreviewProps {
  quotation: Quotation;
}

export function QuotationPreview({ quotation }: QuotationPreviewProps) {
  return (
    <div className="min-h-full w-full overflow-x-auto ">
      <QuotationDocument quotation={quotation} />
    </div>
  );
}