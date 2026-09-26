"use client";

import { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { QuotationFormValues } from "../../types/quotation-form.types";
import type { TaxType } from "../../types/quotation.types";
import {
  calcLine,
  formatINR,
  sanitizePlainText,
} from "../../utils/quotation-form.utils";
import ItemSearchSelect, {
  type SelectedItem,
} from "@/modules/sales/shared/components/item-search-select";
import {
  SalesRowAddButton,
  SalesRowRemoveButton,
} from "@/modules/sales/shared/components/ui/sales-table";

interface Props {
  index: number;
  onRemove: () => void;
  onAdd: () => void;
  canRemove: boolean;
  isLast: boolean;
  taxType: TaxType;
  searchOpenIndex: number | null;
  onSearchOpenChange: (index: number | null) => void;
}

const MAX_QTY = 1_00_000;
const MAX_PRICE = 10_00_00_000;

const cell =
  "h-8 w-full min-w-0 rounded border border-slate-200 bg-white px-1.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/25";

export function QuotationItemRow({
  index,
  onRemove,
  onAdd,
  canRemove,
  isLast,
  taxType,
  searchOpenIndex,
  onSearchOpenChange,
}: Props) {
  const { setValue, control } = useFormContext<QuotationFormValues>();
  const isInter = taxType === "INTER_STATE";
  const prefix = `items.${index}` as const;
  const isSearchOpen = searchOpenIndex === index;

  const quantity = useWatch({ control, name: `${prefix}.quantity` }) ?? 0;
  const rate = useWatch({ control, name: `${prefix}.rate` }) ?? 0;
  const price = useWatch({ control, name: `${prefix}.price` });
  const discount = useWatch({ control, name: `${prefix}.discount` }) ?? 0;
  const discountType =
    useWatch({ control, name: `${prefix}.discountType` }) ?? "PERCENTAGE";
  const taxRate = useWatch({ control, name: `${prefix}.taxRate` }) ?? 0;
  const itemName = useWatch({ control, name: `${prefix}.itemName` }) ?? "";
  const unit = useWatch({ control, name: `${prefix}.unit` }) ?? "PCS";
  const description =
    useWatch({ control, name: `${prefix}.description` }) ?? "";
  const hsnSac = useWatch({ control, name: `${prefix}.hsnSac` }) ?? "";
  const stockAvailable = useWatch({
    control,
    name: `${prefix}.stockAvailable`,
  }) as number | null | undefined;

  const unitPrice =
    price != null && Number(price) > 0 ? Number(price) : Number(rate) || 0;

  /** Quotation: no stock cap — inventory is item-info only */
  const qtyCap = MAX_QTY;

  const line = useMemo(
    () =>
      calcLine(
        {
          quantity: Number(quantity) || 0,
          rate: unitPrice,
          price: unitPrice,
          discount: Number(discount) || 0,
          discountType: discountType as "PERCENTAGE" | "FIXED",
          taxRate: Number(taxRate) || 0,
        },
        taxType,
      ),
    [quantity, unitPrice, discount, discountType, taxRate, taxType],
  );

  useEffect(() => {
    setValue(`${prefix}.amount`, line.taxable, { shouldDirty: false });
    setValue(`${prefix}.total`, line.total, { shouldDirty: false });
    setValue(`${prefix}.taxAmount`, line.taxAmount, { shouldDirty: false });
    setValue(`${prefix}.cgstRate`, line.cgstRate, { shouldDirty: false });
    setValue(`${prefix}.cgstAmount`, line.cgstAmount, { shouldDirty: false });
    setValue(`${prefix}.sgstRate`, line.sgstRate, { shouldDirty: false });
    setValue(`${prefix}.sgstAmount`, line.sgstAmount, { shouldDirty: false });
    setValue(`${prefix}.igstRate`, line.igstRate, { shouldDirty: false });
    setValue(`${prefix}.igstAmount`, line.igstAmount, { shouldDirty: false });
  }, [line, prefix, setValue]);


  const clearLine = () => {
    setValue(`${prefix}.itemId`, null, { shouldDirty: true });
    setValue(`${prefix}.itemName`, "", { shouldDirty: true });
    setValue(`${prefix}.description`, null, { shouldDirty: true });
    setValue(`${prefix}.hsnSac`, null, { shouldDirty: true });
    setValue(`${prefix}.rate`, 0, { shouldDirty: true });
    setValue(`${prefix}.price`, 0, { shouldDirty: true });
    setValue(`${prefix}.quantity`, 1, { shouldDirty: true });
    setValue(`${prefix}.unit`, "PCS", { shouldDirty: true });
    setValue(`${prefix}.taxRate`, 18, { shouldDirty: true });
    setValue(`${prefix}.discount`, 0, { shouldDirty: true });
    setValue(`${prefix}.stockAvailable`, null, { shouldDirty: true });
  };

  const applyItem = (item: SelectedItem | null) => {
    if (!item) {
      clearLine();
      return;
    }
    setValue(`${prefix}.itemId`, item.id, { shouldDirty: true });
    setValue(`${prefix}.itemName`, sanitizePlainText(item.name, 200), {
      shouldDirty: true,
    });
    setValue(
      `${prefix}.description`,
      item.description
        ? sanitizePlainText(item.description, 500) || null
        : null,
      { shouldDirty: true },
    );
    setValue(
      `${prefix}.hsnSac`,
      item.hsnSac
        ? sanitizePlainText(item.hsnSac, 12).replace(/[^0-9A-Za-z]/g, "") ||
            null
        : null,
      { shouldDirty: true },
    );
    setValue(`${prefix}.rate`, item.rate, { shouldDirty: true });
    setValue(`${prefix}.price`, item.rate, { shouldDirty: true });
    setValue(
      `${prefix}.unit`,
      sanitizePlainText(item.unit || "PCS", 20) || "PCS",
      { shouldDirty: true },
    );
    const tax = Number(item.taxRate) || 18;
    setValue(`${prefix}.taxRate`, tax, { shouldDirty: true });
    if (item.cgstRate != null) {
      setValue(`${prefix}.cgstRate`, Number(item.cgstRate) || 0, {
        shouldDirty: true,
      });
    }
    if (item.sgstRate != null) {
      setValue(`${prefix}.sgstRate`, Number(item.sgstRate) || 0, {
        shouldDirty: true,
      });
    }
    if (item.igstRate != null) {
      setValue(`${prefix}.igstRate`, Number(item.igstRate) || 0, {
        shouldDirty: true,
      });
    }
    // Quotation: inventory is product master only — never bind/clamp to stock
    setValue(`${prefix}.stockAvailable`, null, { shouldDirty: true });
    const nextQty = Math.max(Number(quantity) || 1, 1);
    setValue(`${prefix}.quantity`, Math.min(nextQty, MAX_QTY), {
      shouldDirty: true,
    });
    onSearchOpenChange(null);
  };

  const num = (field: "quantity" | "price" | "discount", raw: string) => {
    let v = Number(raw);
    if (Number.isNaN(v) || v < 0) v = 0;
    if (field === "quantity") {
      setValue(`${prefix}.quantity`, Math.min(v, qtyCap), { shouldDirty: true });
      return;
    }
    if (field === "price") {
      v = Math.min(v, MAX_PRICE);
      setValue(`${prefix}.rate`, v, { shouldDirty: true });
      setValue(`${prefix}.price`, v, { shouldDirty: true });
      return;
    }
    const maxDisc =
      discountType === "PERCENTAGE"
        ? 100
        : Math.min(MAX_PRICE, unitPrice * (Number(quantity) || 0) || MAX_PRICE);
    setValue(`${prefix}.discount`, Math.min(v, maxDisc), { shouldDirty: true });
  };

  const setSafeText = (
    field: "itemName" | "description" | "hsnSac",
    raw: string,
    max: number,
  ) => {
    let clean = sanitizePlainText(raw, max);
    if (field === "hsnSac") {
      clean = clean.replace(/[^0-9A-Za-z]/g, "").slice(0, 12);
    }
    setValue(
      `${prefix}.${field}`,
      field === "itemName" ? clean : clean || null,
      { shouldDirty: true },
    );
  };

  const taxCell = itemName ? (
    isInter ? (
      <div className="text-[10px] leading-tight text-slate-600">
        <div className="font-medium text-slate-700">
          IGST {line.igstRate || 0}%
        </div>
        <div className="tabular-nums">₹{formatINR(line.igstAmount)}</div>
      </div>
    ) : (
      <div className="space-y-0.5 text-[10px] leading-tight text-slate-600">
        <div>
          <span className="font-medium text-slate-700">
            CGST {line.cgstRate || 0}%
          </span>{" "}
          <span className="tabular-nums">₹{formatINR(line.cgstAmount)}</span>
        </div>
        <div>
          <span className="font-medium text-slate-700">
            SGST {line.sgstRate || 0}%
          </span>{" "}
          <span className="tabular-nums">₹{formatINR(line.sgstAmount)}</span>
        </div>
      </div>
    )
  ) : (
    <span className="text-[10px] text-slate-400">—</span>
  );

  const actions = (
    <div className="flex items-center gap-1">
      {isLast ? <SalesRowAddButton onClick={onAdd} /> : null}
      {canRemove ? <SalesRowRemoveButton onClick={onRemove} /> : null}
    </div>
  );

  return (
    <div
      className={`relative border-b border-slate-100 last:border-b-0 ${
        isSearchOpen ? "z-50" : "z-0"
      }`}
      style={{ isolation: isSearchOpen ? "auto" : "isolate" }}
    >
      {/* ===== Desktop: product col 2 rows; total + icons on 2nd row ===== */}
      <div className="hidden lg:grid lg:grid-cols-[2rem_minmax(0,30%)_1fr_1fr_0.7fr_1.1fr_0.9fr_1.3fr_1.2fr] lg:gap-x-1.5 lg:gap-y-1 lg:px-2 lg:py-2">
        {/* Sr — spans both rows */}
        <div className="row-span-2 flex items-start justify-center pt-2 text-xs text-slate-400">
          {index + 1}
        </div>

        {/* Product name (row 1) */}
        <div className="relative min-w-0">
          <ItemSearchSelect
            value={itemName}
            onSelect={applyItem}
            showStock={false}
            onQueryChange={(q) => setSafeText("itemName", q, 200)}
            onOpenChange={(open) => onSearchOpenChange(open ? index : null)}
            placeholder="Enter product name"
          />
        </div>

        {/* Row-1 fields: HSN Qty UOM Price Disc Tax Total(placeholder align) */}
        <div>
          <input
            value={hsnSac || ""}
            maxLength={12}
            placeholder="HSN/SAC"
            onChange={(e) => setSafeText("hsnSac", e.target.value, 12)}
            className={`${cell} text-center`}
          />
        </div>
        <div>
          <input
            type="number"
            min={0}
            max={qtyCap}
            inputMode="decimal"
            className={`${cell} text-center tabular-nums`}
            value={quantity || ""}
            placeholder="Qty"
            onChange={(e) => num("quantity", e.target.value)}
          />
        </div>
        <div className="flex h-8 items-center justify-center">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
            {itemName ? unit || "PCS" : "UOM"}
          </span>
        </div>
        <div>
          <input
            type="number"
            min={0}
            max={MAX_PRICE}
            inputMode="decimal"
            className={`${cell} text-right tabular-nums`}
            value={unitPrice || ""}
            placeholder="0"
            onChange={(e) => num("price", e.target.value)}
          />
        </div>
        <div>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            className={`${cell} text-center tabular-nums`}
            value={discount || ""}
            placeholder="0"
            onChange={(e) => num("discount", e.target.value)}
          />
        </div>
        <div className="flex items-center justify-center">{taxCell}</div>
        <div className="flex h-8 items-center justify-end">
          <span className="text-xs font-semibold tabular-nums text-slate-800">
            {itemName ? formatINR(line.total) : "—"}
          </span>
        </div>

        {/* Product note (row 2) — same product column */}
        <div className="min-w-0">
          <textarea
            rows={2}
            maxLength={500}
            placeholder="Item note…"
            value={description || ""}
            onChange={(e) => setSafeText("description", e.target.value, 500)}
            className="w-full resize-none rounded border-0 bg-amber-50 px-2 py-1 text-[11px] leading-snug text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-300"
          />
        </div>

        {/* Row-2: stock hint under qty, empty fillers, actions at end */}
        <div className="col-start-3" />
      
        <div />
        <div />
        <div />
        <div />
        <div />
        <div className="flex items-center justify-end gap-1.5">
          {actions}
        </div>
      </div>

      {/* ===== Mobile / tablet ===== */}
      <div className="space-y-2.5 px-3 py-3 lg:hidden">
        <div className="flex gap-2">
          <span className="mt-2 w-5 shrink-0 text-center text-[11px] text-slate-400">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <ItemSearchSelect
              value={itemName}
              onSelect={applyItem}
            showStock={false}
              onQueryChange={(q) => setSafeText("itemName", q, 200)}
              onOpenChange={(open) => onSearchOpenChange(open ? index : null)}
              placeholder="Enter product name"
            />
            <textarea
              rows={2}
              maxLength={500}
              placeholder="Item note…"
              value={description || ""}
              onChange={(e) => setSafeText("description", e.target.value, 500)}
              className="w-full resize-none rounded border-0 bg-amber-50 px-2.5 py-1.5 text-[11px] leading-snug text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-300"
            />
          </div>
        </div>

        <div className="ml-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div>
            <label className="mb-0.5 block text-[10px] font-medium uppercase text-slate-400">
              HSN / SAC
            </label>
            <input
              value={hsnSac || ""}
              maxLength={12}
              placeholder="—"
              onChange={(e) => setSafeText("hsnSac", e.target.value, 12)}
              className={`${cell} text-center`}
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium uppercase text-slate-400">
              Qty
            </label>
            <input
              type="number"
              min={0}
              max={qtyCap}
              inputMode="decimal"
              className={`${cell} text-center tabular-nums`}
              value={quantity || ""}
              placeholder="1"
              onChange={(e) => num("quantity", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium uppercase text-slate-400">
              UOM
            </label>
            <div className="flex h-8 items-center">
              <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600">
                {itemName ? unit || "PCS" : "—"}
              </span>
            </div>
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium uppercase text-slate-400">
              Price (₹)
            </label>
            <input
              type="number"
              min={0}
              max={MAX_PRICE}
              inputMode="decimal"
              className={`${cell} text-right tabular-nums`}
              value={unitPrice || ""}
              placeholder="0"
              onChange={(e) => num("price", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium uppercase text-slate-400">
              Discount
            </label>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              className={`${cell} text-center tabular-nums`}
              value={discount || ""}
              placeholder="0"
              onChange={(e) => num("discount", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium uppercase text-slate-400">
              {isInter ? "IGST" : "CGST / SGST"}
            </label>
            <div className="min-h-8 rounded border border-slate-100 bg-slate-50 px-2 py-1">
              {taxCell}
            </div>
          </div>
        </div>

        <div className="ml-7 flex items-center justify-between border-t border-slate-50 pt-2">
          <span className="text-xs font-semibold tabular-nums text-slate-800">
            Total: {itemName ? formatINR(line.total) : "—"}
          </span>
          {actions}
        </div>
      </div>
    </div>
  );
}
