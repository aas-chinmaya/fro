


"use client";

import type { Invoice, TaxType } from "../../../types/invoice.types";
import {
  InvoicePaymentDetails,
  type BankDetails,
  type UpiDetails,
} from "./invoice-payment-details";

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function num(v: unknown) {
  return Number(v) || 0;
}

interface InvoiceSummaryProps {
  invoice: Invoice;
  showBank?: boolean;
  showUpi?: boolean;
  bank?: BankDetails;
  upi?: UpiDetails;
}

export function InvoiceSummary({
  invoice,
  showBank = true,
  showUpi = true,
  bank,
  upi,
}: InvoiceSummaryProps) {
  const taxType = invoice.taxType as TaxType | null | undefined;
  const isInter = taxType === "INTER_STATE";

  const taxable = num(invoice.taxableAmount);
  const discount = num(invoice.discountAmount);
  const cgst = num(invoice.cgstAmount);
  const sgst = num(invoice.sgstAmount);
  const igst = num(invoice.igstAmount);
  const roundOff = num(invoice.roundOffAmount);
  const grandTotal = num(invoice.grandTotal);

  return (
    <div className="grid grid-cols-1 border-t border-slate-800 sm:grid-cols-[1fr_min(100%,340px)]">
      {/* LEFT — bank / UPI (replaces empty red box) */}
      <div className="border-b border-slate-800 sm:border-b-0 sm:border-r">
        <InvoicePaymentDetails
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
            Total ({invoice.currency || "INR"})
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