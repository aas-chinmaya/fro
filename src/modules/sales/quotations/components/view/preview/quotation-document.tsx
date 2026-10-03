"use client";

import type { Quotation } from "../../../types/quotation.types";
import { QuotationItemsTable } from "./quotation-items-table";
import { QuotationSummary } from "./quotation-summary";
import { QuotationSignature } from "./quotation-signature";
import { QuotationTerms } from "./quotation-terms";
import { amountInWords } from "@/modules/sales/shared/utils/amount-in-words";

interface QuotationDocumentProps {
  quotation: Quotation;
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

/** Label bold, value normal — consistent “Quotation No: QTN…” style */
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

export function QuotationDocument({ quotation }: QuotationDocumentProps) {
  const logo = quotation.businessLogo?.trim() || null;

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

  const grandTotal = Number(quotation.grandTotal) || 0;

  return (
    <div
      id="quotation-document"
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
                alt={quotation.businessName || quotation.businessLegalName || "Logo"}
                className="max-h-full max-w-[110px] object-contain sm:max-w-[130px]"
              />
            ) : (
              <div className="text-center text-sm font-semibold text-slate-700">
                {quotation.businessName || quotation.businessLegalName || "—"}
              </div>
            )}
          </div>

          {/* Meta — right: label bold, value normal */}
          <div className="ml-auto min-w-0 space-y-0.5 text-right">
            <InfoRow
              label="Quotation No"
              value={quotation.quotationNumber || "—"}
              align="right"
            />
            <InfoRow
              label="Quotation Date"
              value={formatDate(quotation.quotationDate)}
              align="right"
            />
            <InfoRow
              label="Valid Till"
              value={formatDate(quotation.validUntil)}
              align="right"
            />
            <InfoRow
              label="Country of Supply"
              value={quotation.prospectCountry || "India"}
              align="right"
            />
            <InfoRow
              label="Place of Supply"
              value={placeOfSupply}
              align="right"
            />
            <InfoRow
              label="Status"
              value={String(quotation.quotationStatus || "DRAFT")
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())}
              align="right"
            />
          </div>
        </div>

        {/* Row 2: Quotation From | Quotation For */}
        <div className="grid grid-cols-1 border-b border-slate-800 md:grid-cols-2">
          {/* From */}
          <div className="border-b border-slate-800 px-3 py-2.5 md:border-b-0 md:border-r sm:px-4 sm:py-3">
            <div className="text-[13px] font-bold text-slate-900 sm:text-[14px]">
              Quotation From
            </div>
            <div className="mt-1 text-[12px] font-semibold text-slate-800 sm:text-[13px]">
              {quotation.businessLegalName || quotation.businessName}
            </div>
            {businessAddress ? (
              <div className="mt-0.5 text-[11px] leading-[1.45] text-slate-600 sm:text-[12px]">
                {businessAddress}
              </div>
            ) : null}
            <div className="mt-1.5 space-y-0.5">
              {quotation.businessGSTIN ? (
                <FieldLine label="GSTIN" value={quotation.businessGSTIN} />
              ) : null}
              {quotation.businessPAN ? (
                <FieldLine label="PAN" value={quotation.businessPAN} />
              ) : null}
              {quotation.businessEmail ? (
                <FieldLine label="Email" value={quotation.businessEmail} />
              ) : null}
              {quotation.businessPhone ? (
                <FieldLine label="Phone" value={quotation.businessPhone} />
              ) : null}
            </div>
          </div>

          {/* For */}
          <div className="px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="text-[13px] font-bold text-slate-900 sm:text-[14px]">
              Quotation For
            </div>
            <div className="mt-1 text-[12px] font-semibold text-slate-800 sm:text-[13px]">
              {prospectTitle}
            </div>
            {quotation.prospectName &&
            quotation.prospectCompanyName &&
            quotation.prospectName !== quotation.prospectCompanyName ? (
              <div className="mt-0.5 text-[11px] text-slate-600 sm:text-[12px]">
                {quotation.prospectName}
              </div>
            ) : null}
            {prospectAddress ? (
              <div className="mt-0.5 text-[11px] leading-[1.45] text-slate-600 sm:text-[12px]">
                {prospectAddress}
              </div>
            ) : null}
            <div className="mt-1.5 space-y-0.5">
              {quotation.prospectGSTIN ? (
                <FieldLine label="GSTIN" value={quotation.prospectGSTIN} />
              ) : null}
              {quotation.prospectPAN ? (
                <FieldLine label="PAN" value={quotation.prospectPAN} />
              ) : null}
              {quotation.prospectEmail ? (
                <FieldLine label="Email" value={quotation.prospectEmail} />
              ) : null}
              {quotation.prospectPhone ? (
                <FieldLine label="Phone" value={quotation.prospectPhone} />
              ) : null}
            </div>
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

        <QuotationSignature amountInWords={amountInWords(grandTotal)} />
      </div>

      <QuotationTerms
        termsAndConditions={quotation.termsAndConditions}
        notes={quotation.notes}
      />
    </div>
  );
}
