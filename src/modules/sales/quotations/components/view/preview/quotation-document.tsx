"use client";

import type { Quotation, QuotationStatus } from "../../../types/quotation.types";
import { QuotationItemsTable } from "./quotation-items-table";
import { QuotationSummary } from "./quotation-summary";
import { QuotationSignature } from "./quotation-signature";
import { QuotationTerms } from "./quotation-terms";
import { amountInWords } from "@/modules/sales/shared/utils/amount-in-words";
interface QuotationDocumentProps {
  quotation: Quotation;
}

const STATUS_BADGE: Record<
  QuotationStatus,
  { className: string; label: string }
> = {
  DRAFT: { className: "bg-ink-muted", label: "Draft" },
  FINALIZED: { className: "bg-accent", label: "Finalized" },
  SENT: { className: "bg-accent", label: "Sent" },
  ACCEPTED: { className: "bg-add", label: "Accepted" },
  REJECTED: { className: "bg-remove", label: "Rejected" },
  CANCELLED: { className: "bg-remove", label: "Cancelled" },
  EXPIRED: { className: "bg-ink-muted", label: "Expired" },
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

export function QuotationDocument({ quotation }: QuotationDocumentProps) {
  const status = quotation.quotationStatus;
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.DRAFT;

  const businessAddress = formatAddress([
    quotation.businessAddressLine1,
    quotation.businessAddressLine2,
    quotation.businessCity,
    quotation.businessState,
    quotation.businessCountry,
    quotation.businessPincode ? `- ${quotation.businessPincode}` : null,
  ]);

  const prospectAddress = formatAddress([
    quotation.prospectAddressLine1,
    quotation.prospectAddressLine2,
    quotation.prospectCity,
    quotation.prospectState,
    quotation.prospectCountry,
    quotation.prospectPincode ? `- ${quotation.prospectPincode}` : null,
  ]);

  const placeOfSupply =
    quotation.placeOfSupply && quotation.placeOfSupplyCode
      ? `${quotation.placeOfSupply} (${quotation.placeOfSupplyCode})`
      : quotation.placeOfSupply || "—";

  const prospectTitle =
    quotation.prospectCompanyName || quotation.prospectName || "—";

  return (
    <div
      id="quotation-document"
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
              Quotation
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
              label="Quotation No"
              value={quotation.quotationNumber || "—"}
              bold
            />
            <InfoRow
              label="Quotation Date"
              value={formatDate(quotation.quotationDate)}
              bold
            />
            <InfoRow
              label="Valid Till"
              value={formatDate(quotation.validUntil)}
              bold
            />
            <InfoRow
              label="Country of Supply"
              value={quotation.prospectCountry || "India"}
              bold
            />
            <InfoRow label="Place of Supply" value={placeOfSupply} bold />
          </div>

          {/* From */}
          <div className="border-b border-slate-800 p-2 md:border-b-0 md:border-r">
            <div className="text-[10px] text-slate-700 sm:text-[11px]">
              Quotation From
            </div>
            <div className="mt-1 text-[12px] font-bold text-slate-800 sm:text-[13px]">
              {quotation.businessLegalName || quotation.businessName}
            </div>
            {businessAddress && (
              <div className="mt-1 max-w-full text-[10px] leading-[1.45] text-slate-700 sm:max-w-[290px] sm:text-[11px]">
                {businessAddress}
              </div>
            )}
            {quotation.businessGSTIN && (
              <div className="mt-2 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">GSTIN:</span>{" "}
                {quotation.businessGSTIN}
              </div>
            )}
            {quotation.businessPAN && (
              <div className="mt-1 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">PAN:</span> {quotation.businessPAN}
              </div>
            )}
            {quotation.businessEmail && (
              <div className="mt-1 break-all text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">Email:</span>{" "}
                {quotation.businessEmail}
              </div>
            )}
            {quotation.businessPhone && (
              <div className="mt-1 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">Phone:</span>{" "}
                {quotation.businessPhone}
              </div>
            )}
          </div>

          {/* For (prospect) */}
          <div className="p-2">
            <div className="text-[10px] text-slate-700 sm:text-[11px]">
              Quotation For
            </div>
            <div className="mt-1 text-[12px] font-bold text-slate-800 sm:text-[13px]">
              {prospectTitle}
            </div>
            {quotation.prospectName && quotation.prospectCompanyName && (
              <div className="mt-0.5 text-[10px] text-slate-600 sm:text-[11px]">
                Attn: {quotation.prospectName}
              </div>
            )}
            {prospectAddress && (
              <div className="mt-1 max-w-full text-[10px] leading-[1.45] text-slate-700 sm:max-w-[290px] sm:text-[11px]">
                {prospectAddress}
              </div>
            )}
            {quotation.prospectGSTIN && (
              <div className="mt-2 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">GSTIN:</span>{" "}
                {quotation.prospectGSTIN}
              </div>
            )}
            {quotation.prospectPAN && (
              <div className="mt-1 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">PAN:</span> {quotation.prospectPAN}
              </div>
            )}
            {quotation.prospectEmail && (
              <div className="mt-1 break-all text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">Email:</span>{" "}
                {quotation.prospectEmail}
              </div>
            )}
            {quotation.prospectPhone && (
              <div className="mt-1 text-[10px] text-slate-700 sm:text-[11px]">
                <span className="font-medium">Phone:</span>{" "}
                {quotation.prospectPhone}
              </div>
            )}
          </div>
        </div>

        {/* Items — horizontal scroll on small screens */}
        <div className="w-full min-w-0">
          <div className="min-w-0">
            <QuotationItemsTable
              items={quotation.items || []}
              taxType={quotation.taxType}
            />
            <QuotationSummary quotation={quotation} />
          </div>
        </div>

        <QuotationSignature
amountInWords={amountInWords(quotation.grandTotal)}        />
      </div>

      <QuotationTerms
        termsAndConditions={quotation.termsAndConditions}
        notes={quotation.notes}
      />

     
    </div>
  );
}