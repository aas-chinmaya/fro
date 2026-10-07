"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldErrors, Resolver } from "react-hook-form";
import { notify } from "@/lib/toast";
import { SalesSectionCard } from "@/modules/sales/shared/components/ui/sales-table";

import { useCreateCreditNoteMutation } from "../../api/credit-note.api";
import { createCreditNoteFormSchema } from "../../schemas/credit-note.schema";
import type {
  CreditNoteFormProps,
  CreditNoteFormValues,
} from "../../types/credit-note-form.types";
import {
  getDefaultCreditNoteValues,
  toCreatePayload,
} from "../../utils/credit-note.utils";

import { CreditNoteHeaderFields } from "./credit-note-header-fields";
import { CreditNoteItemsSection } from "./credit-note-items-section";
import { CreditNoteSummary } from "./credit-note-summary";
import { CreditNoteFormActions } from "./credit-note-form-actions";

function firstErrorMessage(errors: FieldErrors<CreditNoteFormValues>): string {
  if (errors.customerId?.message) return String(errors.customerId.message);
  if (errors.salesInvoiceId?.message)
    return String(errors.salesInvoiceId.message);
  if (errors.remarks?.message) return String(errors.remarks.message);
  if (errors.items?.message) return String(errors.items.message);
  if (errors.items && Array.isArray(errors.items)) {
    for (const row of errors.items) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, { message?: string }>;
      for (const key of Object.keys(r)) {
        if (r[key]?.message) return String(r[key].message);
      }
    }
  }
  if (errors.creditNoteDate?.message)
    return String(errors.creditNoteDate.message);
  if (errors.reason?.message) return String(errors.reason.message);
  return "Please fix the highlighted fields";
}

export function CreditNoteForm({ onSuccess, onCancel }: CreditNoteFormProps) {
  const [createCreditNote, { isLoading: saving }] =
    useCreateCreditNoteMutation();

  const form = useForm<CreditNoteFormValues>({
    resolver: zodResolver(
      createCreditNoteFormSchema,
    ) as unknown as Resolver<CreditNoteFormValues>,
    defaultValues: getDefaultCreditNoteValues(),
    mode: "onSubmit",
  });

  const { handleSubmit, getValues } = form;

  const onSubmit = async (values: CreditNoteFormValues) => {
    if (!values.customerId?.trim()) {
      notify.error("Select a customer");
      return;
    }
    if (!values.salesInvoiceId?.trim()) {
      notify.error("Select an invoice");
      return;
    }
    if (values.reason === "OTHER" && !(values.remarks || "").trim()) {
      notify.error("Remarks are required for Other reason");
      return;
    }
    const filled = (values.items || []).filter(
      (it) => (it.itemName || "").trim() || (it.productId || "").trim(),
    );
    if (!filled.length) {
      notify.error("Add at least one item");
      return;
    }
    if (filled.some((it) => !(it.productId || "").trim())) {
      notify.error("Select an item for each line");
      return;
    }

    try {
      const payload = toCreatePayload(getValues());
      const res = await createCreditNote(payload).unwrap();
      notify.success(res.message || "Credit note created");
      onSuccess?.(res.data);
    } catch (e) {
      const err = e as { data?: { message?: string }; message?: string };
      notify.error(err?.data?.message || err?.message || "Save failed");
    }
  };

  const onInvalid = (errors: FieldErrors<CreditNoteFormValues>) => {
    notify.error(firstErrorMessage(errors));
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex w-full min-w-0 flex-col space-y-6 pb-24"
        noValidate
      >
        <SalesSectionCard title="Credit note details">
          <CreditNoteHeaderFields />
        </SalesSectionCard>

        <SalesSectionCard title="Product Items">
          <CreditNoteItemsSection embedded />
          <div className="mt-6 border-t border-slate-100 pt-5">
            <CreditNoteSummary />
          </div>
        </SalesSectionCard>

        <CreditNoteFormActions isSubmitting={saving} onCancel={onCancel} />
      </form>
    </FormProvider>
  );
}
