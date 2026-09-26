"use client";

import type { Invoice, InvoiceStatus } from "../../../types/invoice.types";
import { InvoiceItemsTable } from "./invoice-items-table";
import { InvoiceSummary } from "./invoice-summary";
import { InvoiceSignature } from "./invoice-signature";
import { InvoiceTerms } from "./invoice-terms";
import { amountInWords } from "@/modules/sales/shared/utils/amount-in-words";
interface InvoiceDocumentProps {
  invoice: Invoice;
}

const STATUS_BADGE: Record<
  InvoiceStatus,
  { className: string; label: string }
> = {
  DRAFT: { className: "bg-ink-muted", label: "Draft" },
  FINALIZED: { className: "bg-accent", label: "Finalized" },
  SENT: { className: "bg-accent", label: "Sent" },
  PAID: { className: "bg-add", label: "Paid" },
  PARTIALLY_PAID: { className: "bg-accent", label: "Partially Paid" },
  OVERDUE: { className: "bg-remove", label: "Overdue" },
  CANCELLED: { className: "bg-remove", label: "Cancelled" },
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAddress(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ");
}




function InfoRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl grid grid-cols-[120px_1fr] gap-x-1 text-[10px] leading-[1.55] sm:grid-cols-[130px_1fr] sm:text-[11px]">
      <span className="text-slate-700">{label}:</span>
      <span className={bold ? "font-semibold text-slate-800" : "text-slate-700"}>
        {value}
      </span>
    </div>
  );
}

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  const status = invoice.invoiceStatus;
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.DRAFT;

  const businessAddress = formatAddress([
    invoice.sellerAddressLine1,
    invoice.sellerAddressLine2,
    invoice.sellerCity,
    invoice.sellerState,
    invoice.sellerCountry,
    invoice.sellerPincode ? `- ${invoice.sellerPincode}` : null,
  ]);

  const prospectAddress = formatAddress([
    invoice.billingAddressLine1,
    invoice.billingAddressLine2,
    invoice.billingCity,
    invoice.billingState,
    invoice.billingCountry,
    invoice.billingPincode ? `- ${invoice.billingPincode}` : null,
  ]);

  const placeOfSupply =
    invoice.placeOfSupply && invoice.placeOfSupplyCode
      ? `${invoice.placeOfSupply} (${invoice.placeOfSupplyCode})`
      : invoice.placeOfSupply || "—";

  const buyerTitle =
    invoice.buyerCompanyName || invoice.buyerName || "—";

  return (
    <div
      id="invoice-document"
      className="mx-auto w-full min-w-[320px] max-w-full bg-white p-3 shadow-sm sm:p-6 md:p-8"
    >
      <div className="border border-slate-800">
        {/* Header */}
        <div className="flex min-h-[80px] flex-wrap items-center justify-between gap-3 px-3 py-4 sm:min-h-[100px] sm:px-6 sm:py-5 md:px-8 md:py-6">
          <div className="flex h-[56px] w-[90px] items-center justify-center sm:h-[72px] sm:w-[110px]">
            <div className="text-center font-serif text-[32px] leading-none tracking-[-4px] text-[#b4a35b] sm:text-[40px] sm:tracking-[-6px]">
              AAS
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[16px] font-normal text-slate-700 sm:text-[18px] md:text-[20px]">
              Invoice
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase text-white sm:px-2.5 sm:py-1 sm:text-[11px] ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Meta + parties */}
        <div className="grid grid-cols-1 border-t border-slate-800 md:grid-cols-[1fr_1.25fr_1.25fr]">
          {/* Left meta */}
          <div className="border-b border-slate-800 p-2 md:border-b-0 md:border-r">
            <InfoRow
              label="Invoice No"
              value={invoice.invoiceNumber || "—"}
              bold
            />
            <InfoRow
              label="Invoice Date"
              value={formatDate(invoice.invoiceDate)}
              bold
            />
            <InfoRow
              label="Country of Supply"
              value={invoice.billingCountry || "India"}
              bold
            />
            <InfoRow label="Place of Supply" value={placeOfSupply} bold />
          </div>

          {/* From */}
          <div className="border-b border-slate-800 p-2 md:border-b-0 md:border-r">
            <div className="text-[10px] text-slate-700 sm:text-[11px]">
              Invoice From
            </div>
            <div className="mt-1 text-[12px] font-bold text-slate-800 sm:text-[13px]">
              {invoice.sellerLegalName || invoice.sellerTradeName}
            </div>
            {businessAddress && (
              <div className="mt-1 max-w-full text-[10px] leading-[1.45] text-slate-700 sm:max-w-[290px] sm:text-[11px]">
                {businessAddress}
              </div>
            )}
            {invoice.sellerGSTIN && (
              <div className="mt-2 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">GSTIN:</span>{" "}
                {invoice.sellerGSTIN}
              </div>
            )}
            {invoice.sellerPAN && (
              <div className="mt-1 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">PAN:</span> {invoice.sellerPAN}
              </div>
            )}
            {invoice.sellerEmail && (
              <div className="mt-1 break-all text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">Email:</span>{" "}
                {invoice.sellerEmail}
              </div>
            )}
            {invoice.sellerPhone && (
              <div className="mt-1 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">Phone:</span>{" "}
                {invoice.sellerPhone}
              </div>
            )}
          </div>

          {/* For (prospect) */}
          <div className="p-2">
            <div className="text-[10px] text-slate-700 sm:text-[11px]">
              Invoice For
            </div>
            <div className="mt-1 text-[12px] font-bold text-slate-800 sm:text-[13px]">
              {buyerTitle}
            </div>
            {invoice.buyerName && invoice.buyerCompanyName && (
              <div className="mt-0.5 text-[10px] text-slate-600 sm:text-[11px]">
                Attn: {invoice.buyerName}
              </div>
            )}
            {prospectAddress && (
              <div className="mt-1 max-w-full text-[10px] leading-[1.45] text-slate-700 sm:max-w-[290px] sm:text-[11px]">
                {prospectAddress}
              </div>
            )}
            {invoice.buyerGSTIN && (
              <div className="mt-2 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">GSTIN:</span>{" "}
                {invoice.buyerGSTIN}
              </div>
            )}
            {invoice.buyerPAN && (
              <div className="mt-1 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">PAN:</span> {invoice.buyerPAN}
              </div>
            )}
            {invoice.buyerEmail && (
              <div className="mt-1 break-all text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">Email:</span>{" "}
                {invoice.buyerEmail}
              </div>
            )}
            {invoice.buyerPhone && (
              <div className="mt-1 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">Phone:</span>{" "}
                {invoice.buyerPhone}
              </div>
            )}
          </div>
        </div>

        {/* Items — horizontal scroll on small screens */}
        <div className="w-full min-w-0">
          <div className="min-w-0">
            <InvoiceItemsTable
              items={invoice.items || []}
              taxType={invoice.taxType}
            />
            <InvoiceSummary invoice={invoice} />
          </div>
        </div>

        <InvoiceSignature
amountInWords={amountInWords(invoice.grandTotal)} />
      </div>

      <InvoiceTerms
        termsAndConditions={invoice.termsAndConditions}
        notes={invoice.notes}
      />

     
    </div>
  );
}