"use client";

import type { Invoice, TaxType, TdsEntry } from "../../../types/invoice.types";

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
}

/**
 * View summary — totals only, normal text, ₹ prefix.
 * Payment details are not shown.
 */
export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const taxType = invoice.taxType as TaxType | null | undefined;
  const isInter = taxType === "INTER_STATE";

  const taxable = num(invoice.taxableAmount);
  const discount = num(invoice.discountAmount);
  const cgst = num(invoice.cgstAmount);
  const sgst = num(invoice.sgstAmount);
  const igst = num(invoice.igstAmount);
  const roundOff = num(invoice.roundOffAmount);
  const grandTotal = num(invoice.grandTotal);
  const tdsAmount = num(invoice.tdsAmount);
  const tdsEntries: TdsEntry[] = Array.isArray(invoice.tdsEntries)
    ? invoice.tdsEntries
    : [];
  const netPayable = Math.max(0, grandTotal - tdsAmount);
  const tdsHint =
    tdsEntries.length > 0
      ? tdsEntries.map((e) => `${e.section} @ ${e.rate}%`).join(", ")
      : "";

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
            Total ({invoice.currency || "INR"})
          </span>
          <span className="px-2 py-1.5 text-right font-medium sm:w-[120px]">
            {formatCurrency(grandTotal)}
          </span>
        </div>
        {tdsAmount > 0 && (
          <>
            <SummaryRow
              label={tdsHint ? `TDS (${tdsHint})` : "TDS"}
              value={`− ${formatCurrency(tdsAmount)}`}
            />
            <div className="flex justify-end border-t border-slate-800">
              <span className="px-2 py-1.5 text-right font-medium sm:w-[185px]">
                Net Payable
              </span>
              <span className="px-2 py-1.5 text-right font-medium sm:w-[120px]">
                {formatCurrency(netPayable)}
              </span>
            </div>
          </>
        )}
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
