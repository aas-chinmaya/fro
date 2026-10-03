"use client";

import type { Invoice } from "../../../types/invoice.types";
import { InvoiceItemsTable } from "./invoice-items-table";
import { InvoiceSummary } from "./invoice-summary";
import { InvoiceSignature } from "./invoice-signature";
import { InvoiceTerms } from "./invoice-terms";
import { amountInWords } from "@/modules/sales/shared/utils/amount-in-words";
interface InvoiceDocumentProps {
  invoice: Invoice;
}

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




/** Label bold, value normal — consistent “Invoice No: INV…” style */
function InfoRow({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`text-[11px] leading-[1.5] sm:text-[12px] ${
        align === "right" ? "text-right" : ""
      }`}
    >
      <span className="font-semibold text-slate-800">{label}:</span>{" "}
      <span className="font-normal text-slate-700">{value}</span>
    </div>
  );
}

function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[11px] leading-[1.5] text-slate-700 sm:text-[12px]">
      <span className="font-semibold text-slate-800">{label}:</span>{" "}
      <span className="font-normal">{value}</span>
    </div>
  );
}

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  const logo = invoice.businessLogo?.trim() || null;

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
        {/* Row 1: Logo (left) | meta (right) */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-3 py-2.5 sm:px-4 sm:py-3">
          {/* Logo — left */}
          <div className="flex h-[52px] min-w-[72px] shrink-0 items-center justify-center sm:h-[64px] sm:min-w-[96px]">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt={invoice.sellerTradeName || invoice.sellerLegalName || "Logo"}
                className="max-h-full max-w-[110px] object-contain sm:max-w-[130px]"
              />
            ) : (
              <div className="text-center text-sm font-semibold text-slate-700">
                {invoice.sellerTradeName || invoice.sellerLegalName || "—"}
              </div>
            )}
          </div>

          {/* Meta — right: label bold, value normal */}
          <div className="ml-auto min-w-0 space-y-0.5 text-right">
            <InfoRow
              label="Invoice No"
              value={invoice.invoiceNumber || "—"}
              align="right"
            />
            <InfoRow
              label="Invoice Date"
              value={formatDate(invoice.invoiceDate)}
              align="right"
            />
            <InfoRow
              label="Country of Supply"
              value={invoice.billingCountry || "India"}
              align="right"
            />
            <InfoRow
              label="Place of Supply"
              value={placeOfSupply}
              align="right"
            />
            <InfoRow
              label="Status"
              value={String(invoice.invoiceStatus || "DRAFT")
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())}
              align="right"
            />
          </div>
        </div>

        {/* Row 2: Invoice From | Invoice For */}
        <div className="grid grid-cols-1 border-b border-slate-800 md:grid-cols-2">
          {/* From */}
          <div className="border-b border-slate-800 px-3 py-2.5 md:border-b-0 md:border-r sm:px-4 sm:py-3">
            <div className="text-[13px] font-bold text-slate-900 sm:text-[14px]">
              Invoice From
            </div>
            <div className="mt-1 text-[12px] font-semibold text-slate-800 sm:text-[13px]">
              {invoice.sellerLegalName || invoice.sellerTradeName}
            </div>
            {businessAddress ? (
              <div className="mt-0.5 text-[11px] leading-[1.45] text-slate-600 sm:text-[12px]">
                {businessAddress}
              </div>
            ) : null}
            <div className="mt-1.5 space-y-0.5">
              {invoice.sellerGSTIN ? (
                <FieldLine label="GSTIN" value={invoice.sellerGSTIN} />
              ) : null}
              {invoice.sellerPAN ? (
                <FieldLine label="PAN" value={invoice.sellerPAN} />
              ) : null}
              {invoice.sellerEmail ? (
                <FieldLine label="Email" value={invoice.sellerEmail} />
              ) : null}
              {invoice.sellerPhone ? (
                <FieldLine label="Phone" value={invoice.sellerPhone} />
              ) : null}
            </div>
          </div>

          {/* For */}
          <div className="px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="text-[13px] font-bold text-slate-900 sm:text-[14px]">
              Invoice For
            </div>
            <div className="mt-1 text-[12px] font-semibold text-slate-800 sm:text-[13px]">
              {buyerTitle}
            </div>
            {invoice.buyerName &&
            invoice.buyerCompanyName &&
            invoice.buyerName !== invoice.buyerCompanyName ? (
              <div className="mt-0.5 text-[11px] text-slate-600 sm:text-[12px]">
                {invoice.buyerName}
              </div>
            ) : null}
            {prospectAddress ? (
              <div className="mt-0.5 text-[11px] leading-[1.45] text-slate-600 sm:text-[12px]">
                {prospectAddress}
              </div>
            ) : null}
            <div className="mt-1.5 space-y-0.5">
              {invoice.buyerGSTIN ? (
                <FieldLine label="GSTIN" value={invoice.buyerGSTIN} />
              ) : null}
              {invoice.buyerPAN ? (
                <FieldLine label="PAN" value={invoice.buyerPAN} />
              ) : null}
              {invoice.buyerEmail ? (
                <FieldLine label="Email" value={invoice.buyerEmail} />
              ) : null}
              {invoice.buyerPhone ? (
                <FieldLine label="Phone" value={invoice.buyerPhone} />
              ) : null}
            </div>
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