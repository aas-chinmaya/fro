"use client";

import { useEffect, useMemo } from "react";
import { useForm, FormProvider, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notify } from "@/lib/toast";

import { quotationCreateSchema } from "../../schemas/quotation.schema";
import {
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
} from "../../api/quotation.api";

import type {
  QuotationFormProps,
  QuotationFormValues,
} from "../../types/quotation-form.types";
import {
  getDefaultQuotationValues,
  mapQuotationToFormValues,
  getSessionFormDefaults,
  sanitizeCreatePayload,
  sanitizeUpdatePayload,
  applyTotalsToValues,
  resolveTaxType,
  resolveFinancialYear,
} from "../../utils/quotation-form.utils";

import { useBusiness } from "@/modules/sales/shared/hooks/use-business";

import { QuotationCustomerFields } from "./quotation-customer-fields";
import { QuotationIssuerFields } from "./quotation-issuer-fields";
import { QuotationItemsSection } from "./quotation-items-section";
import { QuotationSummary } from "./quotation-summary";
import { QuotationFormActions } from "./quotation-form-actions";
import { SalesSectionCard } from "@/modules/sales/shared/components/ui/sales-table";

export function QuotationForm({
  mode,
  quotation,
  onSuccess,
  onCancel,
}: QuotationFormProps) {
  const [createQuotation, { isLoading: isCreating }] =
    useCreateQuotationMutation();
  const [updateQuotation, { isLoading: isUpdating }] =
    useUpdateQuotationMutation();

  const { data: session } = useBusiness();
  const isSubmitting = isCreating || isUpdating;

  const handleReset = () => {
    if (mode === "edit" && quotation) {
      reset(
        mapQuotationToFormValues(
          quotation,
          session?.business?.id,
          session?.user?.id,
        ),
      );
    } else {
      reset({
        ...getDefaultQuotationValues(
          session?.business?.id ?? "",
          session?.user?.id ?? "",
        ),
        ...getSessionFormDefaults(session),
      });
    }
  };

  const isFinalized =
    mode === "edit" &&
    (quotation?.quotationStatus === "FINALIZED" ||
      quotation?.quotationStatus === "ACCEPTED" ||
      quotation?.quotationStatus === "CANCELLED");


  const sessionDefaults = useMemo(
    () => getSessionFormDefaults(session),
    [session],
  );

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationCreateSchema) as unknown as Resolver<QuotationFormValues>,
    defaultValues:
      mode === "edit" && quotation
        ? mapQuotationToFormValues(
            quotation,
            session?.business?.id,
            session?.user?.id,
          )
        : {
            ...getDefaultQuotationValues(
              session?.business?.id ?? "",
              session?.user?.id ?? "",
            ),
            ...sessionDefaults,
          },
    mode: "onChange",
  });

  const { reset, setValue, control } = form;

  const businessStateCode = useWatch({ control, name: "businessStateCode" });
  const placeOfSupplyCode = useWatch({ control, name: "placeOfSupplyCode" });
  const items = useWatch({ control, name: "items" });
  const quotationDate = useWatch({ control, name: "quotationDate" });

  // Deep snapshot so nested qty/price/discount always trigger
  const itemsKey = useMemo(() => JSON.stringify(items ?? []), [items]);

  useEffect(() => {
    const taxType = resolveTaxType(businessStateCode, placeOfSupplyCode);
    setValue("taxType", taxType, { shouldDirty: false });
  }, [businessStateCode, placeOfSupplyCode, setValue]);

  useEffect(() => {
    setValue(
      "financialYear",
      resolveFinancialYear(quotationDate),
      { shouldDirty: false },
    );
  }, [quotationDate, setValue]);

  // Instant totals — any line change / tax type change
  useEffect(() => {
    const current = form.getValues();
    const withTotals = applyTotalsToValues(current);

    setValue("totalItems", withTotals.totalItems, { shouldDirty: false });
    setValue("totalQuantity", withTotals.totalQuantity, { shouldDirty: false });
    setValue("taxableAmount", withTotals.taxableAmount, { shouldDirty: false });
    setValue("discountAmount", withTotals.discountAmount, {
      shouldDirty: false,
    });
    setValue("cgstAmount", withTotals.cgstAmount, { shouldDirty: false });
    setValue("sgstAmount", withTotals.sgstAmount, { shouldDirty: false });
    setValue("igstAmount", withTotals.igstAmount, { shouldDirty: false });
    setValue("cessAmount", withTotals.cessAmount, { shouldDirty: false });
    setValue("roundOffAmount", withTotals.roundOffAmount, {
      shouldDirty: false,
    });
    setValue("grandTotal", withTotals.grandTotal, { shouldDirty: false });

    withTotals.items.forEach((line, i) => {
      setValue(`items.${i}.taxAmount`, line.taxAmount, { shouldDirty: false });
      setValue(`items.${i}.amount`, line.amount, { shouldDirty: false });
      setValue(`items.${i}.total`, line.total, { shouldDirty: false });
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
    if (mode === "edit" && quotation) {
      reset(
        mapQuotationToFormValues(
          quotation,
          session?.business?.id,
          session?.user?.id,
        ),
      );
    }
  }, [mode, quotation, reset, session?.business?.id, session?.user?.id]);

  useEffect(() => {
    if (mode !== "create" || !session) return;
    const current = form.getValues();
    if (!current.businessName && session.business?.name) {
      reset({
        ...getDefaultQuotationValues(
          session.business?.id ?? "",
          session.user?.id ?? "",
        ),
        ...getSessionFormDefaults(session),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, session?.business?.id, session?.user?.id]);


  const firstErrorMessage = (
    errs: Record<string, unknown>,
  ): string => {
    const labels: Record<string, string> = {
      prospectName: "Customer name",
      prospectPhone: "Customer phone",
      prospectEmail: "Customer email",
      prospectAddressLine1: "Customer address",
      prospectCity: "Customer city",
      prospectPincode: "Customer pincode",
      prospectState: "Customer state",
      prospectCountry: "Customer country",
      placeOfSupply: "Place of supply",
      quotationDate: "Quotation date",
      validUntil: "Valid until",
      termsAndConditions: "Terms & conditions",
      signature: "Authorized signatory",
      items: "Product items",
      businessName: "Business name",
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

  const submitWithStatus = async (status: "DRAFT" | "FINALIZED") => {
    const values = form.getValues();
    const valid = await form.trigger();
    if (!valid) {
      let msg = firstErrorMessage(form.formState.errors as Record<string, unknown>);
      // Fallback: parse values so toast always names the missing field
      if (msg === "Please fix the highlighted fields") {
        try {
          quotationCreateSchema.parse(form.getValues());
        } catch (e: unknown) {
          const ze = e as { issues?: Array<{ message?: string; path?: unknown[] }>; errors?: Array<{ message?: string; path?: unknown[] }> };
          const issue = ze?.issues?.[0] || ze?.errors?.[0];
          if (issue?.message) {
            const path = Array.isArray(issue.path) ? issue.path[0] : "";
            const labels: Record<string, string> = {
              prospectName: "Customer name",
              prospectPhone: "Customer phone",
              prospectAddressLine1: "Customer address",
              prospectCity: "Customer city",
              prospectPincode: "Customer pincode",
              prospectState: "Customer state",
              placeOfSupply: "Place of supply",
              quotationDate: "Quotation date",
              validUntil: "Valid until",
              termsAndConditions: "Terms & conditions",
              items: "Product items",
            };
            const label = (path && labels[String(path)]) || String(path || "Field");
            msg = `${label}: ${issue.message}`;
          }
        }
      }
      notify.error(msg);
      return;
    }

    if (status === "FINALIZED") {
      const terms = (values.termsAndConditions || "").replace(/<[^>]+>/g, "").trim();
      const sig = values.signature;
      if (!terms) {
        notify.error("Terms & conditions are required to finalize");
        return;
      }
      if (!sig) {
        notify.error("Signature is required to finalize");
        return;
      }
    }

    const withStatus = { ...values, status };

    try {
      if (mode === "create") {
        // Never send tenantId / branchId / createdBy — backend uses auth
        const payload = sanitizeCreatePayload(withStatus);
        const res = await createQuotation(payload).unwrap();
        notify.success(
          res.message ||
            (status === "FINALIZED" ? "Quotation finalized" : "Draft saved"),
        );
        onSuccess?.(res.data);
      } else if (mode === "edit" && quotation?.id) {
        if (isFinalized) {
          notify.error("Finalized quotations cannot be edited");
          return;
        }
        const payload = sanitizeUpdatePayload(withStatus);
        const res = await updateQuotation({
          id: quotation.id,
          data: { ...payload, status },
        }).unwrap();
        notify.success(
          res.message ||
            (status === "FINALIZED" ? "Quotation finalized" : "Draft updated"),
        );
        onSuccess?.(res.data);
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
      notify.error(
        typeof apiMessage === "string"
          ? apiMessage
          : JSON.stringify(apiMessage),
      );
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
          This quotation is finalized — editing is disabled.
        </div>
      )}
      <fieldset disabled={!!isFinalized} className="min-w-0 space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SalesSectionCard title="Customer information">
            <QuotationCustomerFields />
          </SalesSectionCard>
          <SalesSectionCard title="Issuer details">
            <QuotationIssuerFields />
          </SalesSectionCard>
        </div>

        <SalesSectionCard title="Product Items">
          <QuotationItemsSection embedded />
          <div className="mt-6 border-t border-slate-100 pt-5">
            <QuotationSummary />
          </div>
        </SalesSectionCard>

        </fieldset>
        <QuotationFormActions
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

export default QuotationForm;
