"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/editor";
import type { InvoiceFormValues } from "../../types/invoice-form.types";
import type { TaxType, TdsEntry } from "../../types/invoice.types";
import {
  formatINR,
  amountInWords,
  applyTotalsToValues,
  TDS_SECTION_OPTIONS,
  normalizeTdsEntries,
} from "../../utils/invoice-form.utils";
import { InvoicePaymentSection } from "./invoice-payment-section";

function SumRow({
  label,
  value,
  hint,
  strong,
  money = true,
}: {
  label: string;
  value: string;
  hint?: string;
  strong?: boolean;
  money?: boolean;
}) {
  const trimmed = value.trim();
  const negative = trimmed.startsWith("−") || trimmed.startsWith("-");
  const numeric = trimmed
    .replace(/^[−-]\s*/, "")
    .replace(/^₹\s*/, "")
    .trim();

  return (
    <div
      className={`flex items-start justify-between gap-3 ${
        strong
          ? "text-base font-semibold text-slate-900"
          : "text-sm text-slate-600"
      }`}
    >
      <span className="min-w-0">
        {label}
        {hint ? (
          <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
            {hint}
          </span>
        ) : null}
      </span>
      <span className="inline-flex shrink-0 items-center gap-0.5 tabular-nums text-slate-800">
        {money ? (
          <>
            {negative ? <span>−</span> : null}
            <span className="text-slate-500" aria-hidden>
              ₹
            </span>
            <span>{numeric}</span>
          </>
        ) : (
          <span>{value}</span>
        )}
      </span>
    </div>
  );
}

/** Place-of-supply style multi-select with checkmarks. Trigger shows "N selected". */
function TdsSectionSelect({
  selected,
  onChange,
}: {
  selected: TdsEntry[];
  onChange: (next: TdsEntry[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(
    () => new Set(selected.map((e) => e.section.toUpperCase())),
    [selected],
  );

  const triggerLabel = useMemo(() => {
    if (selected.length === 0) return "";
    if (selected.length === 1) {
      return `${selected[0].section} @ ${selected[0].rate}%`;
    }
    return `${selected.length} selected`;
  }, [selected]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const toggle = (section: string, checked: boolean) => {
    const key = section.toUpperCase();
    if (checked) {
      if (selectedSet.has(key)) return;
      const opt = TDS_SECTION_OPTIONS.find((o) => o.value === key);
      onChange([
        ...selected,
        { section: key, rate: opt?.defaultRate ?? 0 },
      ]);
      return;
    }
    onChange(selected.filter((e) => e.section.toUpperCase() !== key));
  };

  return (
    <div ref={wrapRef} className="relative space-y-1">
      <Label className="text-xs text-slate-600">TDS section</Label>
      <button
        type="button"
        className="flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-sm text-slate-800 shadow-sm outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-200"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span
          className={
            triggerLabel
              ? "truncate text-slate-800"
              : "truncate text-slate-400"
          }
        >
          {triggerLabel || "Select TDS section"}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-md">
          {TDS_SECTION_OPTIONS.map((opt) => {
            const checked = selectedSet.has(opt.value);
            const rowId = `tds-opt-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={rowId}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-slate-50"
              >
                <Checkbox
                  id={rowId}
                  checked={checked}
                  onCheckedChange={(v) => toggle(opt.value, v === true)}
                />
                <span className="min-w-0 flex-1 text-sm text-slate-800">
                  {opt.value}
                  <span className="ml-1.5 text-slate-500">
                    ({opt.label.replace(/^[\w]+\s*—\s*/, "")})
                  </span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-slate-500">
                  {opt.defaultRate}%
                </span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function InvoiceSummary() {
  const { control, setValue, watch, getValues } =
    useFormContext<InvoiceFormValues>();

  const taxType = (useWatch({ control, name: "taxType" }) ??
    "INTRA_STATE") as TaxType;
  const isInter = taxType === "INTER_STATE";

  const items = useWatch({ control, name: "items" }) ?? [];
  const formRoundOff = useWatch({ control, name: "roundOffAmount" }) ?? 0;
  const tdsEntries = (useWatch({ control, name: "tdsEntries" }) ??
    []) as TdsEntry[];

  const terms = watch("termsAndConditions") ?? "";
  const notes = watch("notes") ?? "";

  const [roundOffOn, setRoundOffOn] = useState(true);
  const tdsOn = tdsEntries.length > 0;

  const setTdsEntries = (next: TdsEntry[]) => {
    const cleaned = normalizeTdsEntries(next);
    setValue("tdsEntries", cleaned, { shouldDirty: true });
    const current = getValues();
    const withTotals = applyTotalsToValues(
      { ...current, tdsEntries: cleaned } as InvoiceFormValues,
      roundOffOn ? true : false,
    );
    setValue("tdsAmount", withTotals.tdsAmount ?? 0, { shouldDirty: true });
    setValue("grandTotal", withTotals.grandTotal ?? 0, { shouldDirty: false });
  };

  const live = (() => {
    const withTotals = applyTotalsToValues(
      {
        ...getValues(),
        items,
        taxType,
        roundOffAmount: formRoundOff,
        tdsEntries,
      } as InvoiceFormValues,
      roundOffOn ? true : false,
    );
    return {
      taxableAmount: withTotals.taxableAmount ?? 0,
      discountAmount: withTotals.discountAmount ?? 0,
      cgstAmount: withTotals.cgstAmount ?? 0,
      sgstAmount: withTotals.sgstAmount ?? 0,
      igstAmount: withTotals.igstAmount ?? 0,
      roundOffAmount: withTotals.roundOffAmount ?? 0,
      grandTotal: withTotals.grandTotal ?? 0,
      tdsAmount: withTotals.tdsAmount ?? 0,
    };
  })();

  const {
    taxableAmount,
    discountAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    roundOffAmount,
    grandTotal,
    tdsAmount,
  } = live;

  const netPayable = Math.max(
    0,
    Math.round((grandTotal - tdsAmount) * 100) / 100,
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <InvoicePaymentSection />

          <div className="space-y-1.5">
            <Label className="text-sm text-slate-600">Internal notes</Label>
            <Textarea
              value={notes.replace(/<[^>]+>/g, "")}
              onChange={(e) =>
                setValue("notes", e.target.value, {
                  shouldDirty: true,
                })
              }
              placeholder="Internal remarks (not shown on PDF)…"
              className="h-[88px] min-h-[88px] max-h-[88px] resize-none text-sm"
              maxLength={2000}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-800">
              Payment summary
            </h3>
            <div className="space-y-2.5">
              <SumRow label="Taxable amount" value={formatINR(taxableAmount)} />
              {discountAmount > 0 ? (
                <SumRow
                  label="Discount"
                  value={`− ${formatINR(discountAmount)}`}
                />
              ) : null}

              {isInter ? (
                <SumRow
                  label="IGST"
                  hint="Inter-state supply — single GST"
                  value={formatINR(igstAmount)}
                />
              ) : (
                <>
                  <SumRow
                    label="CGST"
                    hint="Central GST (intra-state)"
                    value={formatINR(cgstAmount)}
                  />
                  <SumRow
                    label="SGST"
                    hint="State GST (intra-state)"
                    value={formatINR(sgstAmount)}
                  />
                </>
              )}

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>Round off</span>
                  <Switch
                    checked={roundOffOn}
                    onCheckedChange={(v) => {
                      setRoundOffOn(v);
                      const current = getValues();
                      const next = applyTotalsToValues(current, v);
                      setValue("roundOffAmount", next.roundOffAmount ?? 0, {
                        shouldDirty: true,
                      });
                      setValue("grandTotal", next.grandTotal ?? 0, {
                        shouldDirty: false,
                      });
                    }}
                  />
                </div>
                <span className="text-sm tabular-nums text-slate-800">
                  {formatINR(roundOffAmount)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <SumRow
                  label="Grand total"
                  value={formatINR(grandTotal)}
                  strong
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  {amountInWords(grandTotal)}
                </p>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm font-medium text-slate-700">
                    TDS applicable
                  </Label>
                  <Switch
                    checked={tdsOn}
                    onCheckedChange={(v) => {
                      if (v) {
                        setTdsEntries([{ section: "194J", rate: 10 }]);
                      } else {
                        setTdsEntries([]);
                      }
                    }}
                  />
                </div>

                {tdsOn ? (
                  <div className="space-y-2.5">
                    <TdsSectionSelect
                      selected={tdsEntries}
                      onChange={setTdsEntries}
                    />

                    {tdsAmount > 0 ? (
                      <>
                        <SumRow
                          label="TDS"
                          hint={tdsEntries
                            .map((e) => `${e.section} @ ${e.rate}%`)
                            .join(", ")}
                          value={`− ${formatINR(tdsAmount)}`}
                        />
                        <SumRow
                          label="Net payable"
                          value={formatINR(netPayable)}
                          strong
                        />
                        <p className="text-[11px] text-slate-500">
                          {amountInWords(netPayable)}
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Select a section from the dropdown
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm text-slate-600">
            Terms &amp; conditions <span className="text-red-500">*</span>
          </Label>
          <span className="text-[11px] text-slate-400">
            {(terms || "").replace(/<[^>]+>/g, "").length}/1000
          </span>
        </div>
        <div className="w-full rounded-lg border border-slate-200 bg-white [&_.ProseMirror]:min-h-[72px] [&_.ProseMirror]:max-h-[160px] [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:outline-none">
          <RichTextEditor
            value={terms}
            onChange={(value) => {
              const plain = (value || "").replace(/<[^>]+>/g, "");
              if (plain.length > 1000) return;
              setValue("termsAndConditions", value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            placeholder="Payment terms, delivery…"
          />
        </div>
      </div>
    </div>
  );
}
