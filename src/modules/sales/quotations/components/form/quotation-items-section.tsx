"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { QuotationFormValues } from "../../types/quotation-form.types";
import type { TaxType } from "../../types/quotation.types";
import {
  calcLine,
  emptyLineItem,
  formatINR,
} from "../../utils/quotation-form.utils";
import { SalesDiscountToggle } from "@/modules/sales/shared/components/ui/sales-table";
import { QuotationItemRow } from "./quotation-item-row";

export function QuotationItemsSection({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { control, setValue } = useFormContext<QuotationFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [searchOpenIndex, setSearchOpenIndex] = useState<number | null>(null);

  const taxType = (useWatch({ control, name: "taxType" }) ??
    "INTRA_STATE") as TaxType;
  const isInter = taxType === "INTER_STATE";
  const items = useWatch({ control, name: "items" }) ?? [];
  const discountTypeGlobal =
    (useWatch({ control, name: "items.0.discountType" }) as
      | "PERCENTAGE"
      | "FIXED") ?? "PERCENTAGE";

  let totalQty = 0;
  let grossSum = 0;
  let discSum = 0;
  let taxSum = 0;
  let grand = 0;

  for (const it of items) {
    if (!(it?.itemName || "").trim()) continue;
    const unitPrice =
      it.price != null && Number(it.price) > 0
        ? Number(it.price)
        : Number(it.rate) || 0;
    const line = calcLine(
      {
        quantity: Number(it.quantity) || 0,
        rate: unitPrice,
        price: unitPrice,
        discount: Number(it.discount) || 0,
        discountType:
          (it.discountType as "PERCENTAGE" | "FIXED") || "PERCENTAGE",
        taxRate: Number(it.taxRate) || 0,
      },
      taxType,
    );
    totalQty += Number(it.quantity) || 0;
    grossSum += line.gross;
    discSum += line.discountAmount;
    taxSum += isInter ? line.igstAmount : line.cgstAmount + line.sgstAmount;
    grand += line.total;
  }

  const setAllDiscountType = (dtype: "PERCENTAGE" | "FIXED") => {
    items.forEach((_, i) => {
      setValue(`items.${i}.discountType`, dtype, { shouldDirty: true });
    });
  };

  return (
    <div className="min-w-0">
      {/* Header: title (if not in card) + discount Rs/% toggle */}
      <div
        className={`mb-3 flex flex-wrap items-center gap-2 ${
          embedded
            ? "justify-end"
            : "justify-between border-b border-slate-100 pb-3"
        }`}
      >
        {!embedded ? (
          <h3 className="text-sm font-semibold text-slate-800">Product Items</h3>
        ) : null}
        <SalesDiscountToggle
          value={discountTypeGlobal}
          onChange={setAllDiscountType}
        />
      </div>

      {/* Desktop column headers — product 30%, rest equal */}
      <div className="hidden rounded-t-lg border border-b-0 border-slate-200 bg-slate-50/90 lg:grid lg:grid-cols-[2rem_minmax(0,30%)_1fr_1fr_0.7fr_1.1fr_0.9fr_1.3fr_1.2fr] lg:items-center lg:gap-1.5 lg:px-2 lg:py-2">
        <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Sr.
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Product / Other Charges
        </div>
        <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          HSN/SAC
        </div>
        <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Qty
        </div>
        <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          UOM
        </div>
        <div className="text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Price (₹)
        </div>
        <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Disc
        </div>
        <div className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {isInter ? "IGST" : "CGST / SGST"}
        </div>
        <div className="text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Total
        </div>
      </div>

      <div className="overflow-visible rounded-lg border border-slate-200 bg-white lg:rounded-t-none">
        {fields.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No items yet. Add a line to begin.
          </p>
        ) : (
          fields.map((field, index) => (
            <QuotationItemRow
              key={field.id}
              index={index}
              onRemove={() => {
                setSearchOpenIndex(null);
                remove(index);
              }}
              onAdd={() => append(emptyLineItem())}
              canRemove={fields.length > 1}
              isLast={index === fields.length - 1}
              taxType={taxType}
              searchOpenIndex={searchOpenIndex}
              onSearchOpenChange={setSearchOpenIndex}
            />
          ))
        )}

        {/* Footer — clear labels, no glued text */}
        <div className="grid grid-cols-2 gap-2 border-t border-amber-100 bg-amber-50 px-3 py-2.5 text-sm sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 flex items-center font-semibold text-amber-900 sm:col-span-1 lg:col-span-1">
            Total Inv. Val
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase text-slate-500">
              Qty
            </span>
            <span className="font-semibold tabular-nums text-slate-800">
              {formatINR(totalQty)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase text-slate-500">
              Gross
            </span>
            <span className="font-semibold tabular-nums text-slate-800">
              {formatINR(grossSum)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase text-slate-500">
              Disc
            </span>
            <span className="font-semibold tabular-nums text-slate-800">
              {formatINR(discSum)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase text-slate-500">
              {isInter ? "IGST" : "GST"}
            </span>
            <span className="font-semibold tabular-nums text-slate-800">
              {formatINR(taxSum)}
            </span>
          </div>
          <div className="col-span-2 flex flex-col items-end sm:col-span-1 lg:col-span-1">
            <span className="text-[10px] font-medium uppercase text-slate-500">
              Total
            </span>
            <span className="text-base font-bold tabular-nums text-slate-900">
              {formatINR(grand)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
