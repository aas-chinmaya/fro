


"use client";

import type { Quotation, TaxType } from "../../../types/quotation.types";
import {
  QuotationPaymentDetails,
  type BankDetails,
  type UpiDetails,
} from "./quotation-payment-details";

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
  showBank?: boolean;
  showUpi?: boolean;
  bank?: BankDetails;
  upi?: UpiDetails;
}

export function QuotationSummary({
  quotation,
  showBank = true,
  showUpi = true,
  bank,
  upi,
}: QuotationSummaryProps) {
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
    <div className="grid grid-cols-1 border-t border-slate-800 sm:grid-cols-[1fr_min(100%,340px)]">
      {/* LEFT — bank / UPI (replaces empty red box) */}
      <div className="border-b border-slate-800 sm:border-b-0 sm:border-r">
        <QuotationPaymentDetails
          showBank={showBank}
          showUpi={showUpi}
          bank={bank}
          upi={upi}
        />
      </div>

      {/* RIGHT — totals */}
      <div className="text-[10px] sm:text-[11px]">
        <SummaryRow label="Taxable Amount" value={formatCurrency(taxable)} />
        {discount >= 0 && (
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
        <div className="flex justify-between sm:justify-end">
          <span className="px-2 py-1 text-right font-semibold sm:w-[185px]">
            Total ({quotation.currency || "INR"})
          </span>
          <span className="px-2 py-1 text-right font-bold sm:w-[105px]">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800 sm:justify-end">
      <span className="px-2 py-1 text-right font-medium sm:w-[185px]">
        {label}
      </span>
      <span className="px-2 py-1 text-right font-semibold sm:w-[105px]">
        {value}
      </span>
    </div>
  );
}