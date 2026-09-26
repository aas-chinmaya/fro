"use client";

import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { CreditCard, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvoiceFormValues } from "../../types/invoice-form.types";

const METHODS = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Card",
  "Cheque",
  "Other",
] as const;

const STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
] as const;

function hasExistingPayment(v: {
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  paidAmount?: number | null;
  paymentDate?: string | null;
  transactionId?: string | null;
}) {
  const status = String(v.paymentStatus || "PENDING").toUpperCase();
  if (status !== "PENDING") return true;
  const method = String(v.paymentMethod || "Cash");
  if (method && method !== "Cash") return true;
  if ((Number(v.paidAmount) || 0) > 0) return true;
  if (String(v.transactionId || "").trim()) return true;
  if (String(v.paymentDate || "").trim()) return true;
  return false;
}

export function InvoicePaymentSection() {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const paymentStatus =
    (useWatch({ control, name: "paymentStatus" }) as string) || "PENDING";
  const paymentMethod =
    (useWatch({ control, name: "paymentMethod" }) as string) || "Cash";
  const paidAmount = useWatch({ control, name: "paidAmount" });
  const paymentDate = useWatch({ control, name: "paymentDate" });
  const transactionId = useWatch({ control, name: "transactionId" });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (
      hasExistingPayment({
        paymentStatus,
        paymentMethod,
        paidAmount,
        paymentDate,
        transactionId,
      })
    ) {
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusUp = String(paymentStatus).toUpperCase();
  const needsPayment =
    statusUp === "PAID" || statusUp === "PARTIAL" || statusUp === "OVERDUE";
  const isCash = !paymentMethod || paymentMethod.toLowerCase() === "cash";
  const req = needsPayment;

  const e = (k: keyof InvoiceFormValues) =>
    (errors[k]?.message as string | undefined) || undefined;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2.5 text-left transition hover:border-slate-400 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-primary" />
        <span className="text-sm font-medium text-slate-700 group-hover:text-primary">
          Add payment details
        </span>
        <span className="text-xs text-slate-400">(optional)</span>
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <CreditCard className="h-4 w-4 text-slate-500" />
          Payment information
        </span>
        {!needsPayment ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            title="Hide"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="space-y-3 px-4 py-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">Payment status</Label>
            <Select
              value={statusUp}
              onValueChange={(v) =>
                setValue(
                  "paymentStatus",
                  v as InvoiceFormValues["paymentStatus"],
                  { shouldDirty: true, shouldValidate: true },
                )
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">
              Payment method
              {req ? <span className="text-red-500"> *</span> : null}
            </Label>
            <Select
              value={String(paymentMethod || "Cash")}
              onValueChange={(v) => {
                setValue("paymentMethod", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                if (v === "Cash") {
                  setValue("transactionId", null, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {e("paymentMethod") ? (
              <p className="text-[11px] text-red-600">{e("paymentMethod")}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">
              Paid amount (₹)
              {req ? <span className="text-red-500"> *</span> : null}
            </Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              className="h-9"
              {...register("paidAmount", { valueAsNumber: true })}
            />
            {e("paidAmount") ? (
              <p className="text-[11px] text-red-600">{e("paidAmount")}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">
              Payment date
              {req ? <span className="text-red-500"> *</span> : null}
            </Label>
            <Input type="date" className="h-9" {...register("paymentDate")} />
            {e("paymentDate") ? (
              <p className="text-[11px] text-red-600">{e("paymentDate")}</p>
            ) : null}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-slate-600">
              Transaction / reference ID
              {!isCash ? (
                <span className="text-red-500"> *</span>
              ) : (
                <span className="text-slate-400"> (optional for Cash)</span>
              )}
            </Label>
            <Input
              className={`h-9 ${e("transactionId") ? "border-red-500" : ""}`}
              maxLength={100}
              placeholder={
                isCash ? "Optional" : "Required for non-cash payments"
              }
              {...register("transactionId")}
            />
            {e("transactionId") ? (
              <p className="text-[11px] text-red-600">{e("transactionId")}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
