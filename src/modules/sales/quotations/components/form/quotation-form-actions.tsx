"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type {
  QuotationFormMode,
  QuotationFormValues,
} from "../../types/quotation-form.types";

interface QuotationFormActionsProps {
  mode: QuotationFormMode;
  isSubmitting: boolean;
  readOnly?: boolean;
  onSubmitIntent: (status: "DRAFT" | "FINALIZED") => void;
  onReset?: () => void;
  onCancel?: () => void;
}

function stripHtml(html: string) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

export function QuotationFormActions({
  mode,
  isSubmitting,
  readOnly,
  onSubmitIntent,
  onReset,
  onCancel,
}: QuotationFormActionsProps) {
  const { control } = useFormContext<QuotationFormValues>();

  const prospectName = useWatch({ control, name: "prospectName" });
  const prospectPhone = useWatch({ control, name: "prospectPhone" });
  const prospectAddressLine1 = useWatch({
    control,
    name: "prospectAddressLine1",
  });
  const prospectCity = useWatch({ control, name: "prospectCity" });
  const prospectPincode = useWatch({ control, name: "prospectPincode" });
  const prospectState = useWatch({ control, name: "prospectState" });
  const prospectCountry = useWatch({ control, name: "prospectCountry" });
  const placeOfSupply = useWatch({ control, name: "placeOfSupply" });
  const quotationDate = useWatch({ control, name: "quotationDate" });
  const validUntil = useWatch({ control, name: "validUntil" });
  const items = useWatch({ control, name: "items" });
  const terms = useWatch({ control, name: "termsAndConditions" });
  const signature = useWatch({ control, name: "signature" });

  const filledItems = (items || []).filter(
    (it) => (it?.itemName || "").trim().length > 0,
  );
  const hasItems = filledItems.length > 0;
  const hasTerms = stripHtml(terms || "").length > 0;

  const customerOk =
    !!(prospectName || "").trim() &&
    !!(prospectPhone || "").trim() &&
    !!(prospectAddressLine1 || "").trim() &&
    !!(prospectCity || "").trim() &&
    /^[0-9]{6}$/.test(String(prospectPincode || "")) &&
    !!(prospectState || "").trim() &&
    !!(prospectCountry || "").trim() &&
    !!(placeOfSupply || "").trim();

  const hasDates = !!(quotationDate && validUntil);

  const canSaveDraft =
    !readOnly && customerOk && hasDates && hasItems && hasTerms && !isSubmitting;
  const canFinalize =
    canSaveDraft && !!(signature && String(signature).trim());

  const hint = !customerOk
    ? "Complete required customer fields."
    : !hasDates
      ? "Date and valid until are required."
      : !hasItems
        ? "Add at least one item."
        : !hasTerms
          ? "Terms & conditions are required."
          : !canFinalize
            ? "Authorized signatory required to finalize."
            : null;

  return (
    <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-6 rounded-md">
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
                {isSubmitting ? "Submitting…" : "Finalize quotation"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              This quotation is locked and cannot be edited.
            </p>
          )}
        </div>
      </div>
   
    </div>
  );
}
