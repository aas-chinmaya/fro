"use client";

import { useEffect, type ClipboardEvent, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { notify } from "@/lib/toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FormPageHeader } from "@/modules/sales/shared/components/ui/form-page-header";
import { SalesSectionCard } from "@/modules/sales/shared/components/ui/sales-table";
import CustomerSearchSelect, {
  type SelectedCustomer,
} from "@/modules/sales/shared/components/customer-search-select";

import {
  useCreatePaymentReceiptMutation,
  useUpdatePaymentReceiptMutation,
} from "../../api/payment-receipt.api";
import {
  LIMITS,
  paymentReceiptFormSchema,
  sanitizeFieldInput,
} from "../../schemas/payment-receipt.schema";
import type {
  PaymentReceipt,
  PaymentReceiptFormValues,
} from "../../types/payment-receipt.types";
import { PAYMENT_RECEIPT_FORM_DEFAULTS } from "../../types/payment-receipt.types";
import { InvoiceSearchSelect } from "./invoice-search-select";

const METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "NET_BANKING", label: "Net banking" },
] as const;

function computeFinancialYear(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    if (month >= 4) return `${year}-${String(year + 1).slice(-2)}`;
    return `${year - 1}-${String(year).slice(-2)}`;
  } catch {
    return String(new Date().getFullYear());
  }
}

function onSafePaste(
  e: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  maxLen: number,
  set: (v: string) => void,
) {
  e.preventDefault();
  set(sanitizeFieldInput(e.clipboardData.getData("text") || "", maxLen));
}

function onSafeChange(
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  maxLen: number,
  set: (v: string) => void,
) {
  set(sanitizeFieldInput(e.target.value, maxLen));
}

interface Props {
  mode?: "create" | "edit";
  receipt?: PaymentReceipt | null;
  onCancel?: () => void;
}

export default function PaymentReceiptForm({
  mode = "create",
  receipt = null,
  onCancel,
}: Props) {
  const router = useRouter();
  const [createReceipt, { isLoading: creating }] =
    useCreatePaymentReceiptMutation();
  const [updateReceipt, { isLoading: updating }] =
    useUpdatePaymentReceiptMutation();

  const form = useForm<PaymentReceiptFormValues>({
    resolver: zodResolver(paymentReceiptFormSchema),
    mode: "onChange",
    defaultValues: PAYMENT_RECEIPT_FORM_DEFAULTS,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const paymentMethod =
    useWatch({ control, name: "paymentMethod" }) || "CASH";
  const receiptDate = useWatch({ control, name: "receiptDate" });
  const customerName = useWatch({ control, name: "customerName" });
  const amount = useWatch({ control, name: "amount" });
  const invoiceId = useWatch({ control, name: "invoiceId" });
  const isCash = paymentMethod === "CASH";

  useEffect(() => {
    if (mode === "edit" && receipt) {
      reset({
        receiptDate: receipt.receiptDate?.slice(0, 10) || "",
        financialYear: receipt.financialYear || "",
        customerName: receipt.customerName || "",
        customerPhone: receipt.customerPhone || "",
        customerGSTIN: receipt.customerGSTIN || "",
        invoiceId: receipt.invoiceId || "",
        paymentMethod:
          (receipt.paymentMethod as PaymentReceiptFormValues["paymentMethod"]) ||
          "CASH",
        transactionReference: receipt.transactionReference || "",
        amount: Number(receipt.amount) || 0,
        notes: receipt.notes || "",
      });
    }
  }, [mode, receipt, reset]);

  useEffect(() => {
    if (receiptDate) {
      setValue("financialYear", computeFinancialYear(receiptDate), {
        shouldDirty: true,
      });
    }
  }, [receiptDate, setValue]);

  const fillFromCustomer = (c: SelectedCustomer | null) => {
    if (!c) {
      setValue("customerName", "", { shouldDirty: true, shouldValidate: true });
      setValue("customerPhone", "", { shouldDirty: true });
      setValue("customerGSTIN", "", { shouldDirty: true });
      return;
    }
    setValue("customerName", sanitizeFieldInput(c.name || "", LIMITS.NAME), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(
      "customerPhone",
      sanitizeFieldInput(c.mobile || "", LIMITS.PHONE),
      { shouldDirty: true },
    );
    setValue(
      "customerGSTIN",
      sanitizeFieldInput(c.gstin || "", LIMITS.GSTIN),
      { shouldDirty: true },
    );
  };

  const onSubmit = async (values: PaymentReceiptFormValues) => {
    const payload = {
      receiptDate: values.receiptDate,
      financialYear:
        values.financialYear?.trim() ||
        computeFinancialYear(values.receiptDate),
      customerName: values.customerName.trim(),
      customerPhone: values.customerPhone?.trim() || undefined,
      customerGSTIN: values.customerGSTIN?.trim() || undefined,
      invoiceId: values.invoiceId?.trim() || undefined,
      paymentMethod: values.paymentMethod,
      transactionReference: values.transactionReference?.trim() || undefined,
      amount: Number(values.amount) || 0,
      notes: values.notes?.trim() || undefined,
    };

    try {
      if (mode === "edit" && receipt?.id) {
        const res = await updateReceipt({
          id: receipt.id,
          data: payload,
        }).unwrap();
        notify.success(
          (res as { message?: string })?.message || "Receipt updated",
        );
        router.push(`/sales/payment-receipts/${receipt.id}`);
      } else {
        const res = await createReceipt(payload).unwrap();
        notify.success(
          (res as { message?: string })?.message || "Receipt created",
        );
        const id = (res as { data?: { id?: string } })?.data?.id;
        if (id) router.push(`/sales/payment-receipts/${id}`);
        else router.push("/sales/payment-receipts");
      }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(e?.data?.message || e?.message || "Failed to save receipt");
    }
  };

  const err = (k: keyof PaymentReceiptFormValues) =>
    (errors[k]?.message as string | undefined) || undefined;

  const saving = isSubmitting || creating || updating;
  const canSave =
    !!(customerName || "").trim() &&
    Number(amount) > 0 &&
    !!(receiptDate || "").trim() &&
    !saving;

  const refReg = register("transactionReference");
  const notesReg = register("notes");

  return (
    <div className="flex w-full min-w-0 flex-col space-y-6 pb-10">
      <FormPageHeader
        title={
          mode === "edit" ? "Edit payment receipt" : "Create payment receipt"
        }
        description="Record a customer payment"
        backHref="/sales/payment-receipts"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full min-w-0 flex-col space-y-6"
        noValidate
      >
        <SalesSectionCard title="Payment receipt">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Customer search only — name / phone / GSTIN stored, not shown */}
            <div className="space-y-1 sm:col-span-2">
        
              <CustomerSearchSelect onSelect={fillFromCustomer} />
              {customerName ? (
                <p className="text-xs text-slate-500">
                  Selected:{" "}
                  <span className="font-medium text-slate-800">
                    {customerName}
                  </span>
                </p>
              ) : null}
              {err("customerName") ? (
                <p className="text-[11px] text-red-600">{err("customerName")}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-600">
                Receipt date <span className="text-red-500">*</span>
              </Label>
              <Input type="date" className="h-9" {...register("receiptDate")} />
              {err("receiptDate") ? (
                <p className="text-[11px] text-red-600">{err("receiptDate")}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Financial year</Label>
              <Input
                className="h-9 bg-slate-50"
                readOnly
                {...register("financialYear")}
              />
            </div>

            <div className="sm:col-span-2">
              <InvoiceSearchSelect
                value={invoiceId || null}
                onSelect={(inv) =>
                  setValue("invoiceId", inv?.id || "", { shouldDirty: true })
                }
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-600">
                Payment method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => {
                  setValue(
                    "paymentMethod",
                    v as PaymentReceiptFormValues["paymentMethod"],
                    { shouldDirty: true, shouldValidate: true },
                  );
                  if (v === "CASH") {
                    setValue("transactionReference", "", {
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
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-600">
                Amount (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="h-9"
                {...register("amount", { valueAsNumber: true })}
              />
              {err("amount") ? (
                <p className="text-[11px] text-red-600">{err("amount")}</p>
              ) : null}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs text-slate-600">
                Transaction / reference ID
                {!isCash ? (
                  <span className="text-red-500"> *</span>
                ) : (
                  <span className="text-slate-400"> (optional for Cash)</span>
                )}
              </Label>
              <Input
                className={`h-9 ${err("transactionReference") ? "border-red-500" : ""}`}
                maxLength={LIMITS.REF}
                {...refReg}
                onChange={(e) =>
                  onSafeChange(e, LIMITS.REF, (v) =>
                    setValue("transactionReference", v, {
                      shouldDirty: true,
                      shouldValidate: true,
                    }),
                  )
                }
                onPaste={(e) =>
                  onSafePaste(e, LIMITS.REF, (v) =>
                    setValue("transactionReference", v, {
                      shouldDirty: true,
                      shouldValidate: true,
                    }),
                  )
                }
              />
              {err("transactionReference") ? (
                <p className="text-[11px] text-red-600">
                  {err("transactionReference")}
                </p>
              ) : null}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs text-slate-600">Notes</Label>
              <Textarea
                className="min-h-[80px] resize-y text-sm"
                maxLength={LIMITS.NOTES}
                placeholder="Optional notes…"
                {...notesReg}
                onChange={(e) =>
                  onSafeChange(e, LIMITS.NOTES, (v) =>
                    setValue("notes", v, { shouldDirty: true }),
                  )
                }
                onPaste={(e) =>
                  onSafePaste(e, LIMITS.NOTES, (v) =>
                    setValue("notes", v, { shouldDirty: true }),
                  )
                }
              />
            </div>
          </div>
        </SalesSectionCard>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="gap-1.5 self-start"
            onClick={() =>
              onCancel ? onCancel() : router.push("/sales/payment-receipts")
            }
            disabled={saving}
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => reset(PAYMENT_RECEIPT_FORM_DEFAULTS)}
            >
              Reset
            </Button>
            <Button type="submit" disabled={!canSave}>
              {saving
                ? "Saving…"
                : mode === "edit"
                  ? "Update receipt"
                  : "Save receipt"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
