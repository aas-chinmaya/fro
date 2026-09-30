"use client";

import { useEffect, useMemo } from "react";
import { useForm, FormProvider, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notify } from "@/lib/toast";

import { invoiceCreateSchema } from "../../schemas/invoice.schema";
import {
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
} from "../../api/invoice.api";

import type {
  InvoiceFormProps,
  InvoiceFormValues,
} from "../../types/invoice-form.types";
import {
  getDefaultInvoiceValues,
  mapInvoiceToFormValues,
  getSessionFormDefaults,
  sanitizeCreatePayload,
  sanitizeUpdatePayload,
  applyTotalsToValues,
  resolveTaxType,
  resolveFinancialYear,
} from "../../utils/invoice-form.utils";

import { useBusiness } from "@/modules/sales/shared/hooks/use-business";

import { InvoiceCustomerFields } from "./invoice-customer-fields";
import { InvoiceIssuerFields } from "./invoice-issuer-fields";
import { InvoiceItemsSection } from "./invoice-items-section";
import { InvoiceSummary } from "./invoice-summary";
import { InvoiceFormActions } from "./invoice-form-actions";
import { SalesSectionCard } from "@/modules/sales/shared/components/ui/sales-table";

export function InvoiceForm({
  mode,
  invoice,
  onSuccess,
  onCancel,
}: InvoiceFormProps) {
  const [createInvoice, { isLoading: isCreating }] =
    useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] =
    useUpdateInvoiceMutation();

  const { data: session } = useBusiness();
  const isSubmitting = isCreating || isUpdating;

  const handleReset = () => {
    if (mode === "edit" && invoice) {
      reset(mapInvoiceToFormValues(invoice));
    } else {
      reset({
        ...getDefaultInvoiceValues(),
        ...getSessionFormDefaults(session),
      });
    }
  };

  const isFinalized =
    mode === "edit" &&
    String(invoice?.invoiceStatus || "").toUpperCase() !== "DRAFT";


  const sessionDefaults = useMemo(
    () => getSessionFormDefaults(session),
    [session],
  );

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceCreateSchema) as unknown as Resolver<InvoiceFormValues>,
    defaultValues:
      mode === "edit" && invoice
        ? mapInvoiceToFormValues(invoice)
        : {
            ...getDefaultInvoiceValues(),
            ...sessionDefaults,
          },
    mode: "onChange",
  });

  const { reset, setValue, control } = form;

  const businessStateCode = useWatch({ control, name: "sellerStateCode" });
  const placeOfSupplyCode = useWatch({ control, name: "placeOfSupplyCode" });
  const items = useWatch({ control, name: "items" });
  const invoiceDate = useWatch({ control, name: "invoiceDate" });

  // Deep snapshot so nested qty/price/discount always trigger
  const itemsKey = useMemo(() => JSON.stringify(items ?? []), [items]);

  useEffect(() => {
    const taxType = resolveTaxType(businessStateCode, placeOfSupplyCode);
    setValue("taxType", taxType, { shouldDirty: false });
  }, [businessStateCode, placeOfSupplyCode, setValue]);

  useEffect(() => {
    setValue(
      "financialYear",
      resolveFinancialYear(invoiceDate),
      { shouldDirty: false },
    );
  }, [invoiceDate, setValue]);

  // Instant totals — any line change / tax type change
  useEffect(() => {
    const current = form.getValues();
    // Auto nearest-rupee when round-off still at 0 (default on); otherwise keep
    const enableRound =
      Number(current.roundOffAmount) === 0 ? true : undefined;
    const withTotals = applyTotalsToValues(current, enableRound);

    setValue("totalItems", withTotals.totalItems, { shouldDirty: false });
    setValue("totalQuantity", withTotals.totalQuantity, { shouldDirty: false });
    setValue("taxableAmount", withTotals.taxableAmount, { shouldDirty: false });
    setValue("discountAmount", withTotals.discountAmount, {
      shouldDirty: false,
    });
    setValue("cgstAmount", withTotals.cgstAmount, { shouldDirty: false });
    setValue("sgstAmount", withTotals.sgstAmount, { shouldDirty: false });
    setValue("igstAmount", withTotals.igstAmount, { shouldDirty: false });
    setValue("cessAmount", withTotals.cessAmount ?? 0, { shouldDirty: false });
    setValue("roundOffAmount", withTotals.roundOffAmount, {
      shouldDirty: false,
    });
    setValue("grandTotal", withTotals.grandTotal, { shouldDirty: false });

    withTotals.items.forEach((line, i) => {
      setValue(`items.${i}.taxAmount`, line.taxAmount, { shouldDirty: false });
      setValue(`items.${i}.amount`, line.amount, { shouldDirty: false });
      setValue(`items.${i}.total`, line.total, { shouldDirty: false });
      setValue(`items.${i}.taxableAmount`, line.taxableAmount, {
        shouldDirty: false,
      });
      setValue(`items.${i}.discountValue`, line.discountValue, {
        shouldDirty: false,
      });
      setValue(`items.${i}.cgstRate`, line.cgstRate, { shouldDirty: false });
      setValue(`items.${i}.cgstAmount`, line.cgstAmount, {
        shouldDirty: false,
      });
      setValue(`items.${i}.sgstRate`, line.sgstRate, { shouldDirty: false });
      setValue(`items.${i}.sgstAmount`, line.sgstAmount, {
        shouldDirty: false,
      });
      setValue(`items.${i}.igstRate`, line.igstRate, { shouldDirty: false });
      setValue(`items.${i}.igstAmount`, line.igstAmount, {
        shouldDirty: false,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, businessStateCode, placeOfSupplyCode, setValue]);

  useEffect(() => {
    if (mode === "edit" && invoice) {
      const mapped = mapInvoiceToFormValues(invoice);
      const sessionBank = getSessionFormDefaults(session);
      if (!mapped.businessLogo && sessionBank.businessLogo) {
        mapped.businessLogo = sessionBank.businessLogo;
      }
reset(mapped);
    }
  }, [mode, invoice, reset, session]);

  useEffect(() => {
    if (mode !== "create" || !session) return;
    const current = form.getValues();
    if (!current.sellerTradeName && session.business?.name) {
      reset({
        ...getDefaultInvoiceValues(),
        ...getSessionFormDefaults(session),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, session?.business?.id]);


  const firstErrorMessage = (
    errs: Record<string, unknown>,
  ): string => {
    const labels: Record<string, string> = {
      buyerName: "Customer name",
      buyerPhone: "Customer phone",
      buyerEmail: "Customer email",
      billingAddressLine1: "Customer address",
      billingCity: "Customer city",
      billingPincode: "Customer pincode",
      billingState: "Customer state",
      billingCountry: "Customer country",
      placeOfSupply: "Place of supply",
      invoiceDate: "Invoice date",
      invoiceDate: "Invoice date",
      termsAndConditions: "Terms & conditions",
      items: "Product items",
      sellerTradeName: "Business name",
      transactionId: "Transaction / reference ID",
      paymentMethod: "Payment method",
    };

    const walk = (
      obj: unknown,
      path: string[] = [],
    ): string | null => {
      if (!obj || typeof obj !== "object") return null;
      const rec = obj as Record<string, unknown>;
      if (typeof rec.message === "string" && rec.message) {
        const key = path[0] || "";
        const label = labels[key] || key || "Field";
        const msg = rec.message;
        if (msg.toLowerCase().includes("required") || msg.length < 40) {
          return `${label}: ${msg}`;
        }
        return msg;
      }
      for (const k of Object.keys(rec)) {
        if (k === "ref" || k === "type" || k === "types") continue;
        const found = walk(rec[k], path.concat(k));
        if (found) return found;
      }
      return null;
    };

    return walk(errs) || "Please fix the highlighted fields";
  };

  const notifySuccess = (
    status: "DRAFT" | "ISSUED",
    res: { message?: string; data?: { id?: string } | null },
    modeLabel: "saved" | "updated",
  ) => {
    notify.success(
      res.message ||
        (status === "ISSUED"
          ? modeLabel === "updated"
            ? "Invoice issued"
            : "Invoice issued"
          : modeLabel === "updated"
            ? "Draft updated"
            : "Draft saved"),
    );
    const inv = res?.data;
    if (inv?.id) onSuccess?.(inv as never);
  };

  const submitWithStatus = async (status: "DRAFT" | "ISSUED") => {
    const values = form.getValues();

    // ---------- DRAFT: partial OK (create + update) ----------
    if (status === "DRAFT") {
      const hasCustomer =
        !!(values.customerId || "").toString().trim() ||
        !!(values.buyerName || "").trim();
      const hasProduct = (values.items || []).some((it) => {
        const id = String(it.itemId || it.productId || "").trim();
        const name = (it.itemName || it.productName || "").trim();
        return !!id || !!name;
      });

      if (!hasCustomer && !hasProduct) {
        notify.error(
          "Select a customer or add at least one product to save draft",
        );
        return;
      }

      const withStatus = {
        ...values,
        status: "DRAFT" as const,
        invoiceStatus: "DRAFT" as const,
      };

      try {
        if (mode === "create") {
          const payload = sanitizeCreatePayload(withStatus);
          const res = await createInvoice(payload).unwrap();
          notifySuccess("DRAFT", res, "saved");
        } else if (mode === "edit" && invoice?.id) {
          if (isFinalized) {
            notify.error("Only draft invoices can be edited");
            return;
          }
          const payload = sanitizeUpdatePayload(withStatus);
          const res = await updateInvoice({
            id: invoice.id,
            data: { ...payload, status: "DRAFT" },
          }).unwrap();
          notifySuccess("DRAFT", res, "updated");
        }
      } catch (err: unknown) {
        const e = err as {
          data?: { message?: string } | string;
          error?: string;
          message?: string;
        };
        const apiMessage =
          (typeof e?.data === "object" && e?.data?.message) ||
          e?.error ||
          (typeof e?.data === "string" ? e.data : null) ||
          e?.message ||
          "Something went wrong";
        const msg =
          typeof apiMessage === "string"
            ? apiMessage
            : JSON.stringify(apiMessage);
        // Never surface null.id crashes as toast
        if (!/Cannot read properties of null/i.test(msg)) {
          notify.error(msg);
        } else {
          notify.error("Save failed. Please try again.");
        }
      }
      return;
    }

    // ---------- ISSUE: full required validation ----------
    const valid = await form.trigger();
    if (!valid) {
      let msg = firstErrorMessage(
        form.formState.errors as Record<string, unknown>,
      );
      if (msg === "Please fix the highlighted fields") {
        try {
          invoiceCreateSchema.parse(form.getValues());
        } catch (e: unknown) {
          const ze = e as {
            issues?: Array<{ message?: string; path?: unknown[] }>;
            errors?: Array<{ message?: string; path?: unknown[] }>;
          };
          const issue = ze?.issues?.[0] || ze?.errors?.[0];
          if (issue?.message) {
            const path = Array.isArray(issue.path) ? issue.path[0] : "";
            const labels: Record<string, string> = {
              buyerName: "Customer name",
              buyerPhone: "Customer phone",
              billingAddressLine1: "Customer address",
              billingCity: "Customer city",
              billingPincode: "Customer pincode",
              billingState: "Customer state",
              placeOfSupply: "Place of supply",
              invoiceDate: "Invoice date",
              termsAndConditions: "Terms & conditions",
              items: "Product items",
              transactionId: "Transaction / reference ID",
            };
            const label =
              (path && labels[String(path)]) || String(path || "Field");
            msg = `${label}: ${issue.message}`;
          }
        }
      }
      notify.error(msg);
      return;
    }

    const terms = (values.termsAndConditions || "")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!terms) {
      notify.error("Terms & conditions are required to issue");
      return;
    }

    const withStatus = {
      ...values,
      status: "ISSUED" as const,
      invoiceStatus: "ISSUED" as const,
    };

    try {
      if (mode === "create") {
        const payload = sanitizeCreatePayload(withStatus);
        const res = await createInvoice(payload).unwrap();
        notifySuccess("ISSUED", res, "saved");
      } else if (mode === "edit" && invoice?.id) {
        if (isFinalized) {
          notify.error("Only draft invoices can be edited");
          return;
        }
        const payload = sanitizeUpdatePayload(withStatus);
        const res = await updateInvoice({
          id: invoice.id,
          data: { ...payload, status: "ISSUED" },
        }).unwrap();
        notifySuccess("ISSUED", res, "updated");
      }
    } catch (err: unknown) {
      const e = err as {
        data?: { message?: string } | string;
        error?: string;
        message?: string;
      };
      const apiMessage =
        (typeof e?.data === "object" && e?.data?.message) ||
        e?.error ||
        (typeof e?.data === "string" ? e.data : null) ||
        e?.message ||
        "Something went wrong";
      const msg =
        typeof apiMessage === "string"
          ? apiMessage
          : JSON.stringify(apiMessage);
      if (!/Cannot read properties of null/i.test(msg)) {
        notify.error(msg);
      } else {
        notify.error("Save failed. Please try again.");
      }
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="flex w-full min-w-0 flex-col space-y-6 pb-10"
        noValidate
      >
      {isFinalized && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This invoice is finalized — editing is disabled.
        </div>
      )}
      <fieldset disabled={!!isFinalized} className="min-w-0 space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SalesSectionCard title="Customer information">
            <InvoiceCustomerFields />
          </SalesSectionCard>
          <SalesSectionCard title="Issuer details">
            <InvoiceIssuerFields />
          </SalesSectionCard>
        </div>

        <SalesSectionCard title="Product Items">
          <InvoiceItemsSection embedded />
          <div className="mt-6 border-t border-slate-100 pt-5">
            <InvoiceSummary />
          </div>
        </SalesSectionCard>

        </fieldset>
        <InvoiceFormActions
          mode={mode}
          isSubmitting={isSubmitting}
          readOnly={!!isFinalized}
          onSubmitIntent={submitWithStatus}
          onReset={handleReset}
          onCancel={onCancel}
        />
      </form>
    </FormProvider>
  );
}

export default InvoiceForm;
