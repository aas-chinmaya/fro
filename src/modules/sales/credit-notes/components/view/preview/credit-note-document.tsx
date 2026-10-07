"use client";

import type { CreditNote } from "@/modules/sales/credit-notes/types/credit-note.types";
import {
  formatINR,
  reasonLabel,
} from "@/modules/sales/credit-notes/utils/credit-note.utils";

interface CreditNoteDocumentProps {
  creditNote: CreditNote & { businessLogo?: string | null };
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

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function num(v: unknown) {
  return Number(v) || 0;
}

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

export function CreditNoteDocument({ creditNote }: CreditNoteDocumentProps) {
  const logo = creditNote.businessLogo?.trim() || null;
  const isInter = creditNote.taxType === "INTER_STATE";

  const businessAddress = formatAddress([
    creditNote.sellerAddressLine1,
    creditNote.sellerCity,
    creditNote.sellerState,
    creditNote.sellerPincode ? `- ${creditNote.sellerPincode}` : null,
  ]);

  const customerAddress = formatAddress([
    creditNote.billingAddressLine1,
    creditNote.billingCity,
    creditNote.billingState,
    creditNote.billingPincode ? `- ${creditNote.billingPincode}` : null,
  ]);

  const placeOfSupply =
    creditNote.placeOfSupply && creditNote.placeOfSupplyCode
      ? `${creditNote.placeOfSupply} (${creditNote.placeOfSupplyCode})`
      : creditNote.placeOfSupply || "—";

  return (
    <div
      id="credit-note-document"
      className="mx-auto w-full min-w-[320px] max-w-full bg-white p-3 shadow-sm sm:p-6 md:p-8"
    >
      <div className="border border-slate-800">
        {/* Logo | meta — same as invoice */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex h-[52px] min-w-[72px] shrink-0 items-center justify-center sm:h-[64px] sm:min-w-[96px]">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt={
                  creditNote.sellerTradeName ||
                  creditNote.sellerLegalName ||
                  "Logo"
                }
                className="max-h-full max-w-[110px] object-contain sm:max-w-[130px]"
              />
            ) : (
              <div className="text-center text-sm font-semibold text-slate-700">
                {creditNote.sellerTradeName ||
                  creditNote.sellerLegalName ||
                  "—"}
              </div>
            )}
          </div>

          <div className="ml-auto min-w-0 space-y-0.5 text-right">
            <InfoRow
              label="Credit Note No"
              value={creditNote.creditNoteNumber || "—"}
              align="right"
            />
            <InfoRow
              label="Date"
              value={formatDate(creditNote.creditNoteDate)}
              align="right"
            />
            <InfoRow
              label="Place of Supply"
              value={placeOfSupply}
              align="right"
            />
            <InfoRow
              label="Status"
              value={String(creditNote.status || "ISSUED")
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())}
              align="right"
            />
          </div>
        </div>

        {/* From | For */}
        <div className="grid grid-cols-1 border-b border-slate-800 md:grid-cols-2">
          <div className="border-b border-slate-800 px-3 py-2.5 md:border-b-0 md:border-r sm:px-4 sm:py-3">
            <div className="text-[13px] font-bold text-slate-900 sm:text-[14px]">
              Credit Note From
            </div>
            <div className="mt-1 text-[12px] font-semibold text-slate-800 sm:text-[13px]">
              {creditNote.sellerLegalName ||
                creditNote.sellerTradeName ||
                "—"}
            </div>
            {businessAddress ? (
              <div className="mt-0.5 text-[11px] leading-[1.45] text-slate-600 sm:text-[12px]">
                {businessAddress}
              </div>
            ) : null}
            <div className="mt-1.5 space-y-0.5">
              {creditNote.sellerGSTIN ? (
                <FieldLine label="GSTIN" value={creditNote.sellerGSTIN} />
              ) : null}
              {creditNote.sellerPAN ? (
                <FieldLine label="PAN" value={creditNote.sellerPAN} />
              ) : null}
              {creditNote.sellerPhone ? (
                <FieldLine label="Phone" value={creditNote.sellerPhone} />
              ) : null}
            </div>
          </div>

          <div className="px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="text-[13px] font-bold text-slate-900 sm:text-[14px]">
              Credit Note For
            </div>
            <div className="mt-1 text-[12px] font-semibold text-slate-800 sm:text-[13px]">
              {creditNote.customerName || "—"}
            </div>
            {customerAddress ? (
              <div className="mt-0.5 text-[11px] leading-[1.45] text-slate-600 sm:text-[12px]">
                {customerAddress}
              </div>
            ) : null}
            <div className="mt-1.5 space-y-0.5">
              {creditNote.customerGSTIN ? (
                <FieldLine label="GSTIN" value={creditNote.customerGSTIN} />
              ) : null}
              {creditNote.customerPhone ? (
                <FieldLine label="Phone" value={creditNote.customerPhone} />
              ) : null}
              {creditNote.customerEmail ? (
                <FieldLine label="Email" value={creditNote.customerEmail} />
              ) : null}
            </div>
          </div>
        </div>

        {/* Against invoice + reason — content only */}
        <div className="grid grid-cols-1 gap-1 border-b border-slate-800 px-3 py-2.5 sm:grid-cols-2 sm:px-4">
          <InfoRow
            label="Against Invoice"
            value={creditNote.salesInvoiceNumber || "—"}
          />
          <InfoRow label="Reason" value={reasonLabel(creditNote.reason)} />
        </div>

        {/* Items — invoice table style with description */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[10px] sm:text-[11px]">
            <thead>
              <tr className="border-t border-slate-800 bg-slate-50">
                <th className="w-[28px] border-r border-b border-slate-800 px-1 py-1.5 text-center font-semibold text-slate-800">
                  #
                </th>
                <th className="min-w-[140px] border-r border-b border-slate-800 px-2 py-1.5 text-left font-semibold text-slate-800">
                  Item
                </th>
                <th className="w-[72px] border-r border-b border-slate-800 px-1 py-1.5 text-center font-semibold text-slate-800">
                  HSN/SAC
                </th>
                <th className="w-[48px] border-r border-b border-slate-800 px-1 py-1.5 text-center font-semibold text-slate-800">
                  Qty
                </th>
                <th className="w-[44px] border-r border-b border-slate-800 px-1 py-1.5 text-center font-semibold text-slate-800">
                  UOM
                </th>
                <th className="w-[72px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-semibold text-slate-800">
                  Unit Price
                </th>
                <th className="w-[72px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-semibold text-slate-800">
                  Discount
                </th>
                {isInter ? (
                  <th className="w-[80px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-semibold text-slate-800">
                    IGST
                  </th>
                ) : (
                  <>
                    <th className="w-[72px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-semibold text-slate-800">
                      CGST
                    </th>
                    <th className="w-[72px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-semibold text-slate-800">
                      SGST
                    </th>
                  </>
                )}
                <th className="w-[80px] border-b border-slate-800 px-1 py-1.5 text-right font-semibold text-slate-800">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {(creditNote.items || []).map((item, index) => {
                const qty = num(item.quantity);
                const rate = num(item.unitPrice ?? item.rate);
                const discountAmt = num(item.discountAmount);
                const cgst = num(item.cgstAmount);
                const sgst = num(item.sgstAmount);
                const igst = num(item.igstAmount);
                const taxRate = num(item.gstRate ?? item.taxRate);
                const total = num(item.lineTotal);
                const unit =
                  (item as { unit?: string; unitName?: string; unitCode?: string })
                    .unit ||
                  (item as { unitName?: string }).unitName ||
                  (item as { unitCode?: string }).unitCode ||
                  "—";
                const desc = item.description
                  ? String(item.description).replace(/<[^>]+>/g, "").trim()
                  : "";

                return (
                  <tr key={item.id || index}>
                    <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top text-slate-600">
                      {index + 1}
                    </td>
                    <td className="border-r border-b border-slate-800 px-2 py-1.5 align-top">
                      <div className="font-semibold text-slate-800">
                        {item.itemName || "—"}
                      </div>
                      {desc ? (
                        <div className="mt-0.5 text-[10px] leading-[1.4] text-slate-500">
                          {desc}
                        </div>
                      ) : null}
                    </td>
                    <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top tabular-nums text-slate-700">
                      {item.hsnSacCode || "—"}
                    </td>
                    <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top tabular-nums">
                      {qty}
                    </td>
                    <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top uppercase text-slate-600">
                      {unit}
                    </td>
                    <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top tabular-nums">
                      {formatAmount(rate)}
                    </td>
                    <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top tabular-nums text-slate-600">
                      {formatAmount(discountAmt)}
                    </td>
                    {isInter ? (
                      <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top tabular-nums">
                        <div>{formatAmount(igst)}</div>
                        {taxRate > 0 ? (
                          <div className="text-[9px] text-slate-400">
                            ({taxRate}%)
                          </div>
                        ) : null}
                      </td>
                    ) : (
                      <>
                        <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top tabular-nums">
                          <div>{formatAmount(cgst)}</div>
                          {taxRate > 0 ? (
                            <div className="text-[9px] text-slate-400">
                              ({taxRate / 2}%)
                            </div>
                          ) : null}
                        </td>
                        <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top tabular-nums">
                          <div>{formatAmount(sgst)}</div>
                          {taxRate > 0 ? (
                            <div className="text-[9px] text-slate-400">
                              ({taxRate / 2}%)
                            </div>
                          ) : null}
                        </td>
                      </>
                    )}
                    <td className="border-b border-slate-800 px-1 py-1.5 text-right align-top font-semibold tabular-nums text-slate-900">
                      {formatAmount(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary — amounts with ₹ like invoice summary area */}
        <div className="flex justify-end border-t border-slate-800 px-3 py-3 sm:px-4">
          <div className="w-full max-w-xs space-y-1 text-[12px]">
            <div className="flex justify-between text-slate-700">
              <span>Taxable</span>
              <span className="tabular-nums">
                ₹{formatINR(creditNote.taxableAmount)}
              </span>
            </div>
            {isInter ? (
              <div className="flex justify-between text-slate-700">
                <span>IGST</span>
                <span className="tabular-nums">
                  ₹{formatINR(creditNote.igstAmount)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-slate-700">
                  <span>CGST</span>
                  <span className="tabular-nums">
                    ₹{formatINR(creditNote.cgstAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>SGST</span>
                  <span className="tabular-nums">
                    ₹{formatINR(creditNote.sgstAmount)}
                  </span>
                </div>
              </>
            )}
            {Number(creditNote.roundOffAmount) !== 0 ? (
              <div className="flex justify-between text-slate-700">
                <span>Round off</span>
                <span className="tabular-nums">
                  ₹{formatINR(creditNote.roundOffAmount)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-300 pt-1.5 text-[13px] font-bold text-slate-900">
              <span>Grand total</span>
              <span className="tabular-nums">
                ₹{formatINR(creditNote.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {(creditNote.remarks || creditNote.notes) && (
        <div className="mt-3 space-y-3 border border-slate-800 p-2 text-[10px] text-slate-700 sm:mt-4 sm:p-3 sm:text-[11px]">
          {creditNote.remarks ? (
            <div>
              <div className="mb-1.5 font-semibold text-slate-800">Remarks</div>
              <p className="leading-relaxed">{creditNote.remarks}</p>
            </div>
          ) : null}
          {creditNote.notes ? (
            <div>
              <div className="mb-1.5 font-semibold text-slate-800">Notes</div>
              <p className="leading-relaxed">{creditNote.notes}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
