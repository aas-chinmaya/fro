"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/editor";
import type { InvoiceFormValues } from "../../types/invoice-form.types";
import type { TaxType } from "../../types/invoice.types";
import { formatINR, amountInWords, applyTotalsToValues } from "../../utils/invoice-form.utils";
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

export function InvoiceSummary() {
  const { control, setValue, watch, getValues } = useFormContext<InvoiceFormValues>();

  const taxType = (useWatch({ control, name: "taxType" }) ??
    "INTRA_STATE") as TaxType;
  const isInter = taxType === "INTER_STATE";

  // Watch items deeply so summary updates on every qty/rate/discount change
  const items = useWatch({ control, name: "items" }) ?? [];
  const formRoundOff = useWatch({ control, name: "roundOffAmount" }) ?? 0;

  const terms = watch("termsAndConditions") ?? "";
  const notes = watch("notes") ?? "";

  const [roundOffOn, setRoundOffOn] = useState(true);

  // Live totals from items (source of truth) — does not wait for parent effect
  const live = (() => {
    const withTotals = applyTotalsToValues(
      { ...getValues(), items, taxType, roundOffAmount: formRoundOff } as InvoiceFormValues,
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
  } = live;

  return (
    <div className="space-y-5">
      {/* Matching card shells: payment (left) | summary (right) */}
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
              className="min-h-[120px] resize-y text-sm"
              maxLength={2000}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Payment summary
              </h3>
            </div>
            <div className="space-y-2.5 border-t border-slate-100 px-4 py-3">
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
            </div>
          </div>

        </div>
      </div>

      {/* Terms last — full width, max 1000 characters (plain text) */}
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
