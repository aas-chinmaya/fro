"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/modules/sales/shared/components/ui/form-field";
import CustomerSearchSelect, {
  type SelectedCustomer,
} from "@/modules/sales/shared/components/customer-search-select";
import InvoiceSearchSelect, {
  type SelectedInvoice,
} from "@/modules/sales/shared/components/invoice-search-select";
import type { CreditNoteFormValues } from "../../types/credit-note-form.types";
import type { CreditNoteReason } from "../../types/credit-note.types";
import { REASON_OPTIONS } from "../../utils/credit-note.utils";

/**
 * Reason → which extra fields matter
 * -------------------------------------------------
 * SALES_RETURN        → invoice REQUIRED (backend validates qty)
 * PRICE_ADJUSTMENT    → invoice optional (link if correcting a bill)
 * POST_SALE_DISCOUNT  → invoice optional
 * TAX_ADJUSTMENT      → invoice optional
 * RATE_DIFFERENCE     → invoice optional
 * BILLING_CORRECTION  → invoice optional
 * OTHER               → invoice optional
 *
 * Invoice is NEVER always-mandatory — only for SALES_RETURN.
 */
function needsInvoice(reason?: CreditNoteReason | null) {
  return reason === "SALES_RETURN";
}

function reasonHint(reason?: CreditNoteReason | null): string {
  switch (reason) {
    case "SALES_RETURN":
      return "Goods returned against an issued / paid invoice. Invoice is required.";
    case "PRICE_ADJUSTMENT":
      return "Price correction after sale. Link invoice if adjusting a specific bill.";
    case "POST_SALE_DISCOUNT":
      return "Discount granted after invoice. Link invoice when known.";
    case "TAX_ADJUSTMENT":
      return "GST / tax correction. Link invoice when known.";
    case "RATE_DIFFERENCE":
      return "Rate difference settlement. Link invoice when known.";
    case "BILLING_CORRECTION":
      return "Billing error correction. Link invoice when known.";
    case "OTHER":
      return "Other credit. Invoice optional.";
    default:
      return "";
  }
}

export function CreditNoteHeaderFields() {
  const {
    register,
    setValue,
    getValues,
    control,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreditNoteFormValues>();

  const reason = useWatch({ control, name: "reason" }) as CreditNoteReason;
  const taxType = useWatch({ control, name: "taxType" }) || "INTRA_STATE";
  const customerId = useWatch({ control, name: "customerId" });
  const invoiceRequired = needsInvoice(reason);

  // Clear invoice requirement errors when reason changes away from SALES_RETURN
  useEffect(() => {
    if (!invoiceRequired) {
      clearErrors(["salesInvoiceId", "salesInvoiceNumber"]);
    }
  }, [invoiceRequired, clearErrors]);

  const fillCustomer = (c: SelectedCustomer | null) => {
    if (!c) {
      setValue("customerId", "", { shouldDirty: true, shouldValidate: true });
      setValue("customerName", "", { shouldDirty: true });
      setValue("customerPhone", null, { shouldDirty: true });
      setValue("customerGSTIN", null, { shouldDirty: true });
      return;
    }
    setValue("customerId", c.id || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("customerName", c.name || c.companyName || "", {
      shouldDirty: true,
    });
    setValue("customerPhone", c.mobile || null, { shouldDirty: true });
    setValue("customerGSTIN", c.gstin || null, { shouldDirty: true });
  };

  const fillInvoice = (inv: SelectedInvoice | null) => {
    if (!inv) {
      setValue("salesInvoiceId", null, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("salesInvoiceNumber", null, { shouldDirty: true });
      return;
    }
    setValue("salesInvoiceId", inv.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("salesInvoiceNumber", inv.invoiceNumber, { shouldDirty: true });

    // Prefill customer only if empty
    if (!getValues("customerId") && inv.customerId) {
      setValue("customerId", inv.customerId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("customerName", inv.customerName || "", { shouldDirty: true });
      setValue("customerPhone", inv.customerPhone || null, {
        shouldDirty: true,
      });
      setValue("customerGSTIN", inv.customerGSTIN || null, {
        shouldDirty: true,
      });
    }
    if (inv.taxType) {
      setValue(
        "taxType",
        inv.taxType === "INTER_STATE" ? "INTER_STATE" : "INTRA_STATE",
        { shouldDirty: true },
      );
    }
    if (inv.placeOfSupply) {
      setValue("placeOfSupply", inv.placeOfSupply, { shouldDirty: true });
    }
  };

  const onReasonChange = (v: string) => {
    const next = v as CreditNoteReason;
    setValue("reason", next, { shouldDirty: true, shouldValidate: true });
    // Leaving sales return → drop forced invoice link (user can re-link)
    if (next !== "SALES_RETURN") {
      // keep existing link if any — just not required
    }
  };

  return (
    <div className="space-y-4">
      {/* Customer */}
      <div className="space-y-2">
        <CustomerSearchSelect onSelect={fillCustomer} />
        {errors.customerId ? (
          <p className="text-[11px] text-red-500">
            {String(errors.customerId.message || "Customer is required")}
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Customer name" required>
            <Input
              className="h-9 bg-slate-50"
              readOnly
              tabIndex={-1}
              {...register("customerName")}
              placeholder="Select a customer"
            />
          </FormField>
          <FormField label="GSTIN">
            <Input
              className="h-9 bg-slate-50"
              readOnly
              tabIndex={-1}
              {...register("customerGSTIN")}
            />
          </FormField>
        </div>
        <input type="hidden" {...register("customerId")} />
      </div>

      {/* Core fields — responsive single grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="Date" required>
          <Input type="date" className="h-9" {...register("creditNoteDate")} />
        </FormField>

        <FormField label="Reason" required>
          <Select value={reason} onValueChange={onReasonChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              {REASON_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Tax type">
          <Select
            value={taxType}
            onValueChange={(v) =>
              setValue("taxType", v as CreditNoteFormValues["taxType"], {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INTRA_STATE">Intra-state</SelectItem>
              <SelectItem value="INTER_STATE">Inter-state</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {reasonHint(reason) ? (
        <p className="text-[11px] leading-relaxed text-slate-500">
          {reasonHint(reason)}
        </p>
      ) : null}

      {/* Invoice — only emphasized / required for SALES_RETURN */}
      <div className="space-y-1">
        <InvoiceSearchSelect
          purpose="credit-note"
          required={invoiceRequired}
          customerId={customerId?.trim() ? customerId : undefined}
          onSelect={fillInvoice}
          placeholder={
            invoiceRequired
              ? "Search issued / paid invoice (required for sales return)"
              : "Optional — link an invoice"
          }
        />
        <input type="hidden" {...register("salesInvoiceId")} />
        <input type="hidden" {...register("salesInvoiceNumber")} />
        {errors.salesInvoiceId ? (
          <p className="text-[11px] text-red-500">
            {String(errors.salesInvoiceId.message || "Invoice is required")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
