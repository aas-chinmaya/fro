"use client";

import type { QuotationItem, TaxType } from "../../../types/quotation.types";

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function num(v: unknown) {
  return Number(v) || 0;
}

function str(v: unknown) {
  if (v == null || v === "") return "—";
  return String(v);
}

interface QuotationItemsTableProps {
  items: QuotationItem[];
  taxType?: TaxType | null;
}

/**
 * Columns: # | Item (name + desc below) | HSN/SAC | Qty | UOM | Price | Discount | Tax (CGST/SGST or IGST) | Total
 * Currency symbol only in summary.
 */
export function QuotationItemsTable({
  items,
  taxType,
}: QuotationItemsTableProps) {
  const isInter = taxType === "INTER_STATE";

  return (
    <table className="w-full border-collapse text-[10px] sm:text-[11px]">
      <thead>
        <tr className="border-t border-slate-800">
          <th className="w-[28px] border-r border-b border-slate-800 px-1 py-1.5 text-center font-medium">
            #
          </th>
          <th className="min-w-[140px] border-r border-b border-slate-800 px-2 py-1.5 text-left font-medium">
            Item name
          </th>
          <th className="w-[70px] border-r border-b border-slate-800 px-1 py-1.5 text-center font-medium">
            HSN/SAC
          </th>
          <th className="w-[48px] border-r border-b border-slate-800 px-1 py-1.5 text-center font-medium">
            Qty
          </th>
          <th className="w-[44px] border-r border-b border-slate-800 px-1 py-1.5 text-center font-medium">
            UOM
          </th>
          <th className="w-[72px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-medium">
            Price
          </th>
          <th className="w-[72px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-medium">
            Discount
          </th>
          {isInter ? (
            <th className="w-[72px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-medium">
              IGST
            </th>
          ) : (
            <>
              <th className="w-[64px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-medium">
                CGST
              </th>
              <th className="w-[64px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-medium">
                SGST
              </th>
            </>
          )}
          <th className="w-[80px] border-b border-slate-800 px-1 py-1.5 text-right font-medium">
            Total
          </th>
        </tr>
      </thead>

      <tbody>
        {(items || []).map((item, index) => {
          const qty = num(item.quantity);
          const price = num(item.price ?? item.rate);
          const discountAmt = num(
            item.discountAmount ??
              (item.discountType === "PERCENTAGE"
                ? (qty * price * num(item.discount ?? item.discountValue)) / 100
                : num(item.discount ?? item.discountValue)),
          );
          const taxable = num(
            item.taxableAmount ?? Math.max(0, qty * price - discountAmt),
          );
          const taxRate = num(item.taxRate);
          const totalTax = num(
            item.totalTaxAmount ??
              item.taxAmount ??
              (taxable * taxRate) / 100,
          );
          const cgst = num(
            item.cgstAmount ?? (isInter ? 0 : totalTax / 2),
          );
          const sgst = num(
            item.sgstAmount ?? (isInter ? 0 : totalTax / 2),
          );
          const igst = num(item.igstAmount ?? (isInter ? totalTax : 0));
          const lineTotal = num(
            item.lineTotal ?? item.total ?? item.amount ?? taxable + totalTax,
          );
          const hsn = item.hsnSacCode ?? item.hsnSac ?? null;

          return (
            <tr key={item.id || index}>
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top">
                {index + 1}.
              </td>
              <td className="border-r border-b border-slate-800 px-2 py-1.5 align-top">
                <div className="font-semibold text-slate-800">
                  {str(item.itemName)}
                </div>
                {item.description ? (
                  <div className="mt-0.5 leading-[1.4] text-slate-600">
                    {String(item.description)}
                  </div>
                ) : null}
              </td>
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top">
                {str(hsn)}
              </td>
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top">
                {qty}
              </td>
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top">
                {str(item.unit)}
              </td>
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top">
                {formatNumber(price)}
              </td>
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top">
                {formatNumber(discountAmt)}
              </td>
              {isInter ? (
                <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top">
                  {formatNumber(igst)}
                  {taxRate > 0 ? (
                    <span className="block text-[9px] text-slate-500">
                      ({taxRate}%)
                    </span>
                  ) : null}
                </td>
              ) : (
                <>
                  <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top">
                    {formatNumber(cgst)}
                    {taxRate > 0 ? (
                      <span className="block text-[9px] text-slate-500">
                        ({taxRate / 2}%)
                      </span>
                    ) : null}
                  </td>
                  <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top">
                    {formatNumber(sgst)}
                    {taxRate > 0 ? (
                      <span className="block text-[9px] text-slate-500">
                        ({taxRate / 2}%)
                      </span>
                    ) : null}
                  </td>
                </>
              )}
              <td className="border-b border-slate-800 px-1 py-1.5 text-right align-top font-medium">
                {formatNumber(lineTotal)}
              </td>
            </tr>
          );
        })}

        <tr>
          <td
            colSpan={isInter ? 9 : 10}
            className="h-[20px] border-b border-slate-800 sm:h-[24px]"
          />
        </tr>
      </tbody>
    </table>
  );
}
