"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type {
  InvoiceFormMode,
  InvoiceFormValues,
} from "../../types/invoice-form.types";

interface InvoiceFormActionsProps {
  mode: InvoiceFormMode;
  isSubmitting: boolean;
  readOnly?: boolean;
  onSubmitIntent: (status: "DRAFT" | "FINALIZED") => void;
  onReset?: () => void;
  onCancel?: () => void;
}

function stripHtml(html: string) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

export function InvoiceFormActions({
  mode,
  isSubmitting,
  readOnly,
  onSubmitIntent,
  onReset,
  onCancel,
}: InvoiceFormActionsProps) {
  const { control } = useFormContext<InvoiceFormValues>();

  const buyerName = useWatch({ control, name: "buyerName" });
  const buyerPhone = useWatch({ control, name: "buyerPhone" });
  const billingAddressLine1 = useWatch({
    control,
    name: "billingAddressLine1",
  });
  const billingCity = useWatch({ control, name: "billingCity" });
  const billingPincode = useWatch({ control, name: "billingPincode" });
  const billingState = useWatch({ control, name: "billingState" });
  const billingCountry = useWatch({ control, name: "billingCountry" });
  const placeOfSupply = useWatch({ control, name: "placeOfSupply" });
  const invoiceDate = useWatch({ control, name: "invoiceDate" });
  const items = useWatch({ control, name: "items" });
  const terms = useWatch({ control, name: "termsAndConditions" });
  const signature = useWatch({ control, name: "signature" });

  const filledItems = (items || []).filter(
    (it) => (it?.itemName || "").trim().length > 0,
  );
  const hasItems = filledItems.length > 0;
  const hasTerms = stripHtml(terms || "").length > 0;

  const customerOk =
    !!(buyerName || "").trim() &&
    !!(buyerPhone || "").trim() &&
    !!(billingAddressLine1 || "").trim() &&
    !!(billingCity || "").trim() &&
    /^[0-9]{6}$/.test(String(billingPincode || "")) &&
    !!(billingState || "").trim() &&
    !!(billingCountry || "").trim() &&
    !!(placeOfSupply || "").trim();

  const hasInvoiceDate = !!(invoiceDate || "").trim();

  const canSaveDraft =
    !readOnly &&
    customerOk &&
    hasInvoiceDate &&
    hasItems &&
    hasTerms &&
    !isSubmitting;
  const canFinalize =
    canSaveDraft && !!(signature && String(signature).trim());

  const hint = !customerOk
    ? "Complete required customer fields."
    : !hasInvoiceDate
      ? "Invoice date is required."
      : !hasItems
        ? "Add at least one item."
        : !hasTerms
          ? "Terms & conditions are required."
          : !canFinalize
            ? "Authorized signatory required to finalize."
            : null;

  return (
    <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Back */}
        <div className="flex items-center gap-2">
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onCancel}
              className="gap-1.5 text-slate-600"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : null}
          {!readOnly && mode === "create" && onReset ? (
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onReset}
              className="text-slate-500"
            >
              Reset
            </Button>
          ) : null}
        </div>

        {/* Right: primary actions */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {!readOnly ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={!canSaveDraft}
                onClick={() => onSubmitIntent("DRAFT")}
                className="w-full sm:w-auto"
              >
                {isSubmitting
                  ? "Saving…"
                  : mode === "create"
                    ? "Save as draft"
                    : "Update draft"}
              </Button>
              <Button
                type="button"
                disabled={!canFinalize}
                onClick={() => onSubmitIntent("FINALIZED")}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting…" : "Finalize invoice"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              This invoice is locked and cannot be edited.
            </p>
          )}
        </div>
      </div>
      {!readOnly && hint ? (
        <p className="mt-2 text-center text-[11px] text-slate-500 sm:text-right">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
