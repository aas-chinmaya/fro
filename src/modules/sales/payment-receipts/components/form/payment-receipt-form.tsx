"use client";

import {
  useEffect,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";
import {
  useForm,
  useWatch,
  Controller,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
    resolver: zodResolver(
      paymentReceiptFormSchema,
    ) as Resolver<PaymentReceiptFormValues>,
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
    <div className="w-full bg-white">
      {/* Header — same tight style as view */}
      <div className="flex h-12 w-full items-center gap-2 border-b border-gray-200 px-3 sm:h-14 sm:px-4">
        <button
          type="button"
          onClick={
            onCancel || (() => router.push("/sales/payment-receipts"))
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="hidden text-[11px] text-gray-500 sm:block">
            Sales / Payment Receipt
          </p>
          <h1 className="truncate text-sm font-semibold text-gray-900">
            {mode === "edit" ? "Edit payment receipt" : "New payment receipt"}
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full border-b border-gray-200"
      >
        <div className="grid gap-4 px-3 py-4 sm:grid-cols-2 sm:px-5 sm:py-5">
          {/* Date + FY */}
          <div className="space-y-1.5">
            <Label htmlFor="receiptDate">
              Receipt date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="receiptDate"
              type="date"
              className="rounded-md"
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
              className="rounded-md bg-muted/40"
              {...register("financialYear")}
            />
          </div>

          {/* Customer search only — name shows inside select */}
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

          {/* Amount */}
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
                  className="rounded-md"
                  disabled={busy}
                  value={
                    field.value === 0 || field.value === undefined
                      ? "0"
                      : String(field.value)
                  }
                  onChange={(e) => {
                    let raw = e.target.value.replace(/[^0-9.]/g, "");
                    const parts = raw.split(".");
                    if (parts.length > 2) {
                      raw = parts[0] + "." + parts.slice(1).join("");
                    }
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

          {/* Method */}
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
                  <SelectTrigger className="rounded-md">
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
                Transaction reference <span className="text-red-500">*</span>
              </Label>
              <Input
                id="transactionReference"
                className="rounded-md"
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
              className="resize-none rounded-md"
              {...register("notes")}
              onChange={(e) =>
                onSafeChange(e, LIMITS.NOTES, (v) =>
                  setValue("notes", v, { shouldDirty: true }),
                )
              }
              disabled={busy}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-3 py-3 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={handleReset}
            className="rounded-md"
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
            className="rounded-md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={busy}
            className="rounded-md bg-primary text-white hover:bg-primary"
          >
            {busy ? "Saving…" : mode === "edit" ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
