"use client";

import {
  useEffect,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

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
import { notify } from "@/lib/toast";

import {
  useCreatePaymentReceiptMutation,
  useUpdatePaymentReceiptMutation,
} from "../../api/payment-receipt.api";
import {
  LIMITS,
  paymentReceiptFormSchema,
  sanitizeFieldInput,
  toIsoReceiptDate,
  computeFinancialYear,
} from "../../schemas/payment-receipt.schema";
import type {
  PaymentReceipt,
  PaymentReceiptFormValues,
  CreatePaymentReceiptPayload,
} from "../../types/payment-receipt.types";
import { PAYMENT_RECEIPT_FORM_DEFAULTS } from "../../types/payment-receipt.types";
import { InvoiceSearchSelect } from "./invoice-search-select";

const METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "NET_BANKING", label: "Net banking" },
] as const;

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
    defaultValues: {
      ...PAYMENT_RECEIPT_FORM_DEFAULTS,
      financialYear: computeFinancialYear(
        PAYMENT_RECEIPT_FORM_DEFAULTS.receiptDate,
      ),
    },
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
  const isCash = paymentMethod === "CASH";
  const busy = creating || updating || isSubmitting;

  useEffect(() => {
    if (mode === "edit" && receipt) {
      const dateOnly = receipt.receiptDate
        ? receipt.receiptDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      reset({
        receiptDate: dateOnly,
        financialYear:
          receipt.financialYear || computeFinancialYear(dateOnly),
        customerId: receipt.customerId || receipt.customer?.id || "",
        customerName: receipt.customerName || receipt.customer?.name || "",
        customerPhone:
          receipt.customerPhone || receipt.customer?.mobile || "",
        customerGSTIN:
          receipt.customerGSTIN || receipt.customer?.gstin || "",
        invoiceId: "",
        paymentMethod:
          (receipt.payment
            ?.paymentMethod as PaymentReceiptFormValues["paymentMethod"]) ||
          "CASH",
        transactionReference: receipt.payment?.transactionReference || "",
        amount: Number(receipt.amount) || 0,
        notes: receipt.notes || "",
      });
    }
  }, [mode, receipt, reset]);

  useEffect(() => {
    if (receiptDate) {
      setValue("financialYear", computeFinancialYear(receiptDate), {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [receiptDate, setValue]);

  /** Fill from shared search — fields stay editable after select */
  const fillFromCustomer = (c: SelectedCustomer | null) => {
    if (!c) {
      setValue("customerId", "", { shouldDirty: true, shouldValidate: true });
      setValue("customerName", "", { shouldDirty: true, shouldValidate: true });
      setValue("customerPhone", "", { shouldDirty: true });
      setValue("customerGSTIN", "", { shouldDirty: true });
      return;
    }
    setValue("customerId", String(c.id || ""), {
      shouldDirty: true,
      shouldValidate: true,
    });
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

  /** Reset only user fields; date/FY back to today */
  const handleReset = () => {
    const today = new Date().toISOString().slice(0, 10);
    reset({
      receiptDate: today,
      financialYear: computeFinancialYear(today),
      customerId: "",
      customerName: "",
      customerPhone: "",
      customerGSTIN: "",
      invoiceId: "",
      paymentMethod: "CASH",
      transactionReference: "",
      amount: 0,
      notes: "",
    });
  };

  const buildPayload = (
    values: PaymentReceiptFormValues,
  ): CreatePaymentReceiptPayload => {
    const payload: CreatePaymentReceiptPayload = {
      receiptDate: toIsoReceiptDate(values.receiptDate),
      financialYear:
        values.financialYear?.trim() ||
        computeFinancialYear(values.receiptDate),
      customerId: values.customerId.trim(),
      customerName: values.customerName.trim(),
      amount: Number(values.amount) || 0,
      paymentMethod: values.paymentMethod,
    };
    if (values.customerPhone?.trim())
      payload.customerPhone = values.customerPhone.trim();
    if (values.customerGSTIN?.trim())
      payload.customerGSTIN = values.customerGSTIN.trim();
    if (values.invoiceId?.trim()) payload.invoiceId = values.invoiceId.trim();
    if (
      values.paymentMethod !== "CASH" &&
      values.transactionReference?.trim()
    ) {
      payload.transactionReference = values.transactionReference.trim();
    }
    if (values.notes?.trim()) payload.notes = values.notes.trim();
    return payload;
  };

  const onSubmit = async (values: PaymentReceiptFormValues) => {
    if (!values.customerId?.trim()) {
      notify.error("Please select a customer");
      return;
    }
    const payload = buildPayload(values);
    try {
      if (mode === "edit" && receipt?.id) {
        const res = await updateReceipt({
          id: receipt.id,
          data: payload,
        }).unwrap();
        notify.success(res.message || "Payment receipt updated");
        router.push(`/sales/payment-receipts/${receipt.id}`);
      } else {
        const res = await createReceipt(payload).unwrap();
        notify.success(res.message || "Payment receipt created");
        const newId = res.data?.id;
        router.push(
          newId
            ? `/sales/payment-receipts/${newId}`
            : "/sales/payment-receipts",
        );
      }
    } catch (err: unknown) {
      const e = err as {
        data?: { message?: string } | string;
        message?: string;
      };
      const msg =
        (typeof e?.data === "object" && e?.data?.message) ||
        (typeof e?.data === "string" ? e.data : null) ||
        e?.message ||
        "Something went wrong";
      notify.error(String(msg));
    }
  };

  const err = (key: keyof PaymentReceiptFormValues) =>
    (errors[key]?.message as string | undefined) || undefined;

  return (
    <div className="mx-auto w-full space-y-6 pb-10">
      <FormPageHeader
        title={mode === "edit" ? "Edit payment receipt" : "New payment receipt"}
        description="Record cash / online payment received from a customer"
        onBack={
          onCancel || (() => router.push("/sales/payment-receipts"))
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Single card for entire form */}
        <SalesSectionCard title="Payment receipt">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Date + FY */}
            <div className="space-y-1.5">
              <Label htmlFor="receiptDate">
                Receipt date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="receiptDate"
                type="date"
                {...register("receiptDate")}
                disabled={busy}
              />
              {err("receiptDate") ? (
                <p className="text-xs text-red-500">{err("receiptDate")}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="financialYear">Financial year</Label>
              <Input
                id="financialYear"
                readOnly
                className="bg-muted/40"
                {...register("financialYear")}
              />
            </div>

            {/* Customer search */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>
                Customer <span className="text-red-500">*</span>
              </Label>
              <CustomerSearchSelect onSelect={fillFromCustomer} hideLabel />
              {err("customerId") || err("customerName") ? (
                <p className="text-xs text-red-500">
                  {err("customerId") || err("customerName")}
                </p>
              ) : null}
            </div>

            {/* Amount + method */}
            <div className="space-y-1.5">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <Input
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    disabled={busy}
                    value={
                      field.value === 0 || field.value === undefined
                        ? "0"
                        : String(field.value)
                    }
                    onChange={(e) => {
                      let raw = e.target.value.replace(/[^0-9.]/g, "");
                      // only one decimal point
                      const parts = raw.split(".");
                      if (parts.length > 2) {
                        raw = parts[0] + "." + parts.slice(1).join("");
                      }
                      // strip leading zeros (keep "0." for decimals)
                      if (raw && !raw.startsWith("0.")) {
                        raw = raw.replace(/^0+(?=\d)/, "");
                      }
                      if (raw === "" || raw === ".") {
                        field.onChange(0);
                        return;
                      }
                      const n = Number(raw);
                      field.onChange(Number.isFinite(n) ? n : 0);
                    }}
                    onBlur={field.onBlur}
                    placeholder="0"
                  />
                )}
              />
              {err("amount") ? (
                <p className="text-xs text-red-500">{err("amount")}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={busy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {!isCash ? (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="transactionReference">
                  Transaction reference{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="transactionReference"
                  {...register("transactionReference")}
                  onChange={(e) =>
                    onSafeChange(e, LIMITS.REF, (v) =>
                      setValue("transactionReference", v, {
                        shouldDirty: true,
                        shouldValidate: true,
                      }),
                    )
                  }
                  disabled={busy}
                  placeholder="UPI ref / UTR / card auth…"
                />
                {err("transactionReference") ? (
                  <p className="text-xs text-red-500">
                    {err("transactionReference")}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-1.5 sm:col-span-2">
              <InvoiceSearchSelect
                value={useWatch({ control, name: "invoiceId" }) || ""}
                onSelect={(inv) =>
                  setValue("invoiceId", inv?.id || "", { shouldDirty: true })
                }
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                {...register("notes")}
                onChange={(e) =>
                  onSafeChange(e, LIMITS.NOTES, (v) =>
                    setValue("notes", v, { shouldDirty: true }),
                  )
                }
                disabled={busy}
                className="resize-none"
              />
            </div>
          </div>
        </SalesSectionCard>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={
              onCancel || (() => router.push("/sales/payment-receipts"))
            }
          >
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : mode === "edit" ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
