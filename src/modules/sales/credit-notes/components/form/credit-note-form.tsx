"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
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

export function CreditNoteForm({ onSuccess, onCancel }: CreditNoteFormProps) {
  const [createCreditNote, { isLoading: saving }] =
    useCreateCreditNoteMutation();

  const form = useForm<CreditNoteFormValues>({
    resolver: zodResolver(
      createCreditNoteFormSchema,
    ) as unknown as Resolver<CreditNoteFormValues>,
    defaultValues: getDefaultCreditNoteValues(),
    mode: "onChange",
  });

  const { handleSubmit, getValues } = form;

  const onSubmit = async (values: CreditNoteFormValues) => {
    if (!values.customerId?.trim()) {
      notify.error("Select a customer");
      return;
    }
    if (values.reason === "SALES_RETURN" && !values.salesInvoiceId?.trim()) {
      notify.error("Sales invoice is required for sales return");
      return;
    }
    const filled = (values.items || []).filter(
      (it) => (it.itemName || "").trim() || it.productId,
    );
    if (!filled.length) {
      notify.error("Add at least one item");
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

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
        {/* Single card: header + reason-driven fields + items + summary */}
        <SalesSectionCard title="Credit note">
          <div className="space-y-6">
            <CreditNoteHeaderFields />
            <div className="border-t border-slate-100 pt-4">
              <CreditNoteItemsSection embedded />
            </div>
            <div className="border-t border-slate-100 pt-4">
              <CreditNoteSummary />
            </div>
          </div>
        </SalesSectionCard>

        <CreditNoteFormActions isSubmitting={saving} onCancel={onCancel} />
      </form>
    </FormProvider>
  );
}
