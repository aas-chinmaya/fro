"use client";

import type { Quotation, TaxType } from "../../../types/quotation.types";

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function num(v: unknown) {
  return Number(v) || 0;
}

interface QuotationSummaryProps {
  quotation: Quotation;
}

/**
 * View summary — totals only, normal text, ₹ prefix.
 */
export function QuotationSummary({ quotation }: QuotationSummaryProps) {
  const taxType = quotation.taxType as TaxType | null | undefined;
  const isInter = taxType === "INTER_STATE";

  const taxable = num(quotation.taxableAmount);
  const discount = num(quotation.discountAmount);
  const cgst = num(quotation.cgstAmount);
  const sgst = num(quotation.sgstAmount);
  const igst = num(quotation.igstAmount);
  const roundOff = num(quotation.roundOffAmount);
  const grandTotal = num(quotation.grandTotal);

  return (
    <div className="border-t border-slate-800">
      <div className="ml-auto w-full max-w-[340px] text-[10px] font-normal text-slate-800 sm:text-[11px]">
        <SummaryRow label="Taxable Amount" value={formatCurrency(taxable)} />
        {discount > 0 && (
          <SummaryRow label="Discount" value={formatCurrency(discount)} />
        )}
        {isInter ? (
          <SummaryRow label="IGST" value={formatCurrency(igst)} />
        ) : (
          <>
            <SummaryRow label="CGST" value={formatCurrency(cgst)} />
            <SummaryRow label="SGST" value={formatCurrency(sgst)} />
          </>
        )}
        {roundOff !== 0 && (
          <SummaryRow label="Round Off" value={formatCurrency(roundOff)} />
        )}
        <div className="flex justify-end border-t border-slate-800">
          <span className="px-2 py-1.5 text-right font-medium sm:w-[185px]">
            Total ({quotation.currency || "INR"})
          </span>
          <span className="px-2 py-1.5 text-right font-medium sm:w-[120px]">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-end border-b border-slate-800">
      <span className="px-2 py-1 text-right font-normal sm:w-[185px]">
        {label}
      </span>
      <span className="px-2 py-1 text-right font-normal sm:w-[120px]">
        {value}
      </span>
    </div>
  );
}
