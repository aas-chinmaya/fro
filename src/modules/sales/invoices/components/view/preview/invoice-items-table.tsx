"use client";

import type { InvoiceItem, TaxType } from "../../../types/invoice.types";

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function num(v: unknown) {
  return Number(v) || 0;
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  taxType?: TaxType | null;
}

export function InvoiceItemsTable({
  items,
  taxType,
}: InvoiceItemsTableProps) {
  const isInter = taxType === "INTER_STATE";

  return (
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
              Price
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
            <th className="w-[84px] border-b border-slate-800 px-1 py-1.5 text-right font-semibold text-slate-800">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {(items || []).map((item, index) => {
            const qty = num(item.quantity);
            const rate = num(item.rate ?? item.price);
            const discType = String(item.discountType || "PERCENTAGE").toUpperCase();
            const discVal = num(item.discountValue ?? item.discount);
            const gross = qty * rate;
            const discountAmt =
              // num(item.discountAmount) ||
              (discType === "FIXED"
                ? Math.min(discVal, gross)
                : (gross * discVal) / 100);
            const taxable =
              num(item.taxableAmount) || Math.max(0, gross - discountAmt);
            const taxRate = num(item.taxRate ?? item.gstRate);
            const taxAmt =
              num(item.taxAmount) || (taxable * taxRate) / 100;
            const cgst =
              num(item.cgstAmount) || (isInter ? 0 : taxAmt / 2);
            const sgst =
              num(item.sgstAmount) || (isInter ? 0 : taxAmt / 2);
            const igst =
              num(item.igstAmount) || (isInter ? taxAmt : 0);
            const lineTotal =
              num(item.total ?? item.amount) || taxable + taxAmt;
            const hsn =
              (item as { hsnSacCode?: string; hsnSac?: string }).hsnSacCode ||
              (item as { hsnSac?: string }).hsnSac ||
              "—";

            return (
              <tr key={item.id || index}>
                <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top text-slate-600">
                  {index + 1}
                </td>
                <td className="border-r border-b border-slate-800 px-2 py-1.5 align-top">
                  <div className="font-semibold text-slate-800">
                    {item.itemName || item.productName || "—"}
                  </div>
                  {item.description ? (
                    <div className="mt-0.5 text-[10px] leading-[1.4] text-slate-500">
                      {String(item.description).replace(/<[^>]+>/g, "").trim()}
                    </div>
                  ) : null}
                </td>
                <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top tabular-nums text-slate-700">
                  {hsn}
                </td>
                <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top tabular-nums">
                  {qty}
                </td>
                <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top uppercase text-slate-600">
                  {item.unit || "—"}
                </td>
                <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top tabular-nums">
                  {formatCurrency(rate)}
                </td>
                <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top tabular-nums text-slate-600">
                  {formatCurrency(discountAmt)}
                </td>
                {isInter ? (
                  <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top tabular-nums">
                    <div>{formatCurrency(igst)}</div>
                    {taxRate > 0 ? (
                      <div className="text-[9px] text-slate-400">
                        ({taxRate}%)
                      </div>
                    ) : null}
                  </td>
                ) : (
                  <>
                    <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top tabular-nums">
                      <div>{formatCurrency(cgst)}</div>
                      {taxRate > 0 ? (
                        <div className="text-[9px] text-slate-400">
                          ({taxRate / 2}%)
                        </div>
                      ) : null}
                    </td>
                    <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top tabular-nums">
                      <div>{formatCurrency(sgst)}</div>
                      {taxRate > 0 ? (
                        <div className="text-[9px] text-slate-400">
                          ({taxRate / 2}%)
                        </div>
                      ) : null}
                    </td>
                  </>
                )}
                <td className="border-b border-slate-800 px-1 py-1.5 text-right align-top font-semibold tabular-nums text-slate-900">
                  {formatCurrency(lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
