"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/editor";
import type { QuotationFormValues } from "../../types/quotation-form.types";
import type { TaxType } from "../../types/quotation.types";
import { formatINR, amountInWords } from "../../utils/quotation-form.utils";
import { QuotationSignatureSection } from "./quotation-signature-section";

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
        strong ? "text-base font-semibold text-slate-900" : "text-sm text-slate-600"
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


export function QuotationSummary() {
  const { control, setValue, watch } = useFormContext<QuotationFormValues>();

  const taxType = (useWatch({ control, name: "taxType" }) ??
    "INTRA_STATE") as TaxType;
  const isInter = taxType === "INTER_STATE";

  const taxableAmount = useWatch({ control, name: "taxableAmount" }) ?? 0;
  const discountAmount = useWatch({ control, name: "discountAmount" }) ?? 0;
  const cgstAmount = useWatch({ control, name: "cgstAmount" }) ?? 0;
  const sgstAmount = useWatch({ control, name: "sgstAmount" }) ?? 0;
  const igstAmount = useWatch({ control, name: "igstAmount" }) ?? 0;
  const roundOffAmount = useWatch({ control, name: "roundOffAmount" }) ?? 0;
  const grandTotal = useWatch({ control, name: "grandTotal" }) ?? 0;

  const terms = watch("termsAndConditions") ?? "";
  const notes = watch("notes") ?? "";

  const [roundOffOn, setRoundOffOn] = useState(true);

  return (
    <div className="space-y-6">
      {/* Row: Internal notes (left) | Payment summary (right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
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
            className="min-h-[140px] resize-y text-sm"
            maxLength={2000}
          />
        </div>

        <div className="w-full">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            Payment summary
          </h3>
          <div className="space-y-2.5 rounded-lg border border-slate-200 bg-white p-4">
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
                    if (!v) {
                      setValue("roundOffAmount", 0, { shouldDirty: true });
                    }
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

          {/* Signature — same width as summary card */}
          <div className="mt-4">
            <QuotationSignatureSection compact />
          </div>
        </div>
      </div>

      {/* Terms last — full width */}
      <div className="space-y-1.5">
        <Label className="text-sm text-slate-600">
          Terms &amp; conditions <span className="text-red-500">*</span>
        </Label>
        <div className="w-full rounded-md border border-slate-200 bg-white [&_.ProseMirror]:min-h-[72px] [&_.ProseMirror]:max-h-[160px] [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:outline-none">
          <RichTextEditor
            value={terms}
            onChange={(value) =>
              setValue("termsAndConditions", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            placeholder="Payment terms, delivery, validity…"
          />
        </div>
      </div>
    </div>
  );
}
