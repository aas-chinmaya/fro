"use client";

import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CreditNoteFormValues } from "../../types/credit-note-form.types";
import type { CreditNoteReason, TaxType } from "../../types/credit-note.types";
import {
  applyTotalsToValues,
  formatINR,
} from "../../utils/credit-note.utils";

function SumRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 ${
        strong
          ? "text-base font-semibold text-slate-900"
          : "text-sm text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span className="inline-flex shrink-0 items-center gap-0.5 tabular-nums text-slate-800">
        <span className="text-slate-500" aria-hidden>
          ₹
        </span>
        <span>{value}</span>
      </span>
    </div>
  );
}

export function CreditNoteSummary() {
  const {
    control,
    setValue,
    getValues,
    register,
    formState: { errors },
  } = useFormContext<CreditNoteFormValues>();
  const [roundOffOn, setRoundOffOn] = useState(true);

  const taxType = (useWatch({ control, name: "taxType" }) ??
    "INTRA_STATE") as TaxType;
  const isInter = taxType === "INTER_STATE";
  const items = useWatch({ control, name: "items" });
  const reason = useWatch({ control, name: "reason" }) as CreditNoteReason;
  const remarksRequired = reason === "OTHER";

  useEffect(() => {
    const next = applyTotalsToValues(getValues(), roundOffOn);
    setValue("taxableAmount", next.taxableAmount, { shouldDirty: false });
    setValue("discountAmount", next.discountAmount, { shouldDirty: false });
    setValue("cgstAmount", next.cgstAmount, { shouldDirty: false });
    setValue("sgstAmount", next.sgstAmount, { shouldDirty: false });
    setValue("igstAmount", next.igstAmount, { shouldDirty: false });
    setValue("roundOffAmount", next.roundOffAmount, { shouldDirty: false });
    setValue("grandTotal", next.grandTotal, { shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, taxType, roundOffOn, setValue]);

  const taxableAmount = useWatch({ control, name: "taxableAmount" }) ?? 0;
  const cgstAmount = useWatch({ control, name: "cgstAmount" }) ?? 0;
  const sgstAmount = useWatch({ control, name: "sgstAmount" }) ?? 0;
  const igstAmount = useWatch({ control, name: "igstAmount" }) ?? 0;
  const roundOffAmount = useWatch({ control, name: "roundOffAmount" }) ?? 0;
  const grandTotal = useWatch({ control, name: "grandTotal" }) ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
      <div className="space-y-2">
        <Label className="text-sm text-slate-600">
          Remarks
          {remarksRequired ? (
            <span className="ml-1 text-red-500">*</span>
          ) : null}
        </Label>
        <Textarea
          className="min-h-[120px] resize-y text-sm"
          {...register("remarks")}
          placeholder={
            remarksRequired
              ? "Required for Other reason…"
              : "Optional remarks…"
          }
          maxLength={1000}
        />
        {errors.remarks ? (
          <p className="text-[11px] text-red-500">
            {String(errors.remarks.message || "Remarks are required")}
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5 text-sm">
        <SumRow label="Taxable amount" value={formatINR(taxableAmount)} />
        {isInter ? (
          <SumRow label="IGST" value={formatINR(igstAmount)} />
        ) : (
          <>
            <SumRow label="CGST" value={formatINR(cgstAmount)} />
            <SumRow label="SGST" value={formatINR(sgstAmount)} />
          </>
        )}
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-2">
            Round off
            <Switch checked={roundOffOn} onCheckedChange={setRoundOffOn} />
          </span>
          <span className="tabular-nums">₹{formatINR(roundOffAmount)}</span>
        </div>
        <div className="border-t border-slate-200 pt-2">
          <SumRow label="Grand total" value={formatINR(grandTotal)} strong />
        </div>
      </div>
    </div>
  );
}
