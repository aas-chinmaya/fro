"use client";

import type { QuotationItem, TaxType } from "../../../types/quotation.types";

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function num(v: unknown) {
  return Number(v) || 0;
}

interface QuotationItemsTableProps {
  items: QuotationItem[];
  taxType?: TaxType | null;
}

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
            Item
          </th>
          
          <th className="w-[50px] border-r border-b border-slate-800 px-1 py-1.5 text-center font-medium">
            Qty
          </th>
          <th className="w-[40px] border-r border-b border-slate-800 px-1 py-1.5 text-center font-medium">
            Unit
          </th>
          <th className="w-[78px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-medium">
            Rate
          </th>
          <th className="w-[90px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-medium">
            Amount
          </th>
          {isInter ? (
            <th className="w-[90px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-medium">
              IGST
            </th>
          ) : (
            <>
              <th className="w-[72px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-medium">
                CGST
              </th>
              <th className="w-[72px] border-r border-b border-slate-800 px-1 py-1.5 text-right font-medium">
                SGST
              </th>
            </>
          )}
          <th className="w-[90px] border-b border-slate-800 px-1 py-1.5 text-right font-medium">
            Total
          </th>
        </tr>
      </thead>

      <tbody>
        {(items || []).map((item, index) => {
          const qty = num(item.quantity);
          const rate = num(item.rate);
          const taxRate = num(item.taxRate);
          const taxable = qty * rate;
          const tax = (taxable * taxRate) / 100;
          const half = tax / 2;
          const lineTotal = taxable + tax;

          return (
            <tr key={item.id || index}>
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top">
                {index + 1}.
              </td>
              <td className="border-r border-b border-slate-800 px-2 py-1.5 align-top">
                <div className="font-semibold text-slate-800">
                  {item.itemName || "—"}
                </div>
                {item.description && (
                  <div className="mt-0.5 leading-[1.4] text-slate-700">
                    {item.description}
                  </div>
                )}
              </td>
             
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top">
                {qty}
              </td>
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-center align-top">
                {item.unit || "—"}
              </td>
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top">
                {rate}
              </td>
              <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top">
                {taxable}
              </td>
              {isInter ? (
                <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top">
                  {tax}
                </td>
              ) : (
                <>
                  <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top">
                    {half}
                  </td>
                  <td className="border-r border-b border-slate-800 px-1 py-1.5 text-right align-top">
                    {half}
                  </td>
                </>
              )}
              <td className="border-b border-slate-800 px-1 py-1.5 text-right align-top">
                {lineTotal}
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