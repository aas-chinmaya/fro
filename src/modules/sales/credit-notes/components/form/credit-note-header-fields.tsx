"use client";

import { useState } from "react";
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
import type { CreditNoteFormValues } from "@/modules/sales/credit-notes/types/credit-note-form.types";
import type { CreditNoteReason } from "@/modules/sales/credit-notes/types/credit-note.types";
import { REASON_OPTIONS, formatINR } from "@/modules/sales/credit-notes/utils/credit-note.utils";

function fmtDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function addrLine(a?: {
  addressLine1?: string | null;
  line1?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
} | null) {
  if (!a) return null;
  return [a.addressLine1 || a.line1, a.city, a.state, a.pincode]
    .filter(Boolean)
    .join(", ");
}

function MetaCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value?: string | null }[];
}) {
  const visible = rows.filter((r) => r.value && String(r.value).trim());
  if (!visible.length) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <div className="space-y-0.5">
        {visible.map((r) => (
          <div key={r.label} className="flex gap-1.5">
            <span className="shrink-0 text-slate-500">{r.label}:</span>
            <span className="font-medium text-slate-800">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreditNoteHeaderFields() {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<CreditNoteFormValues>();

  const reason = useWatch({ control, name: "reason" }) as CreditNoteReason;
  const taxType = useWatch({ control, name: "taxType" }) || "INTRA_STATE";
  const customerId = useWatch({ control, name: "customerId" });
  const hasCustomer = Boolean(customerId?.trim());

  const [selectedCustomer, setSelectedCustomer] =
    useState<SelectedCustomer | null>(null);
  const [selectedInvoice, setSelectedInvoice] =
    useState<SelectedInvoice | null>(null);

  const fillCustomer = (c: SelectedCustomer | null) => {
    setSelectedCustomer(c);
    setSelectedInvoice(null);
    if (!c) {
      setValue("customerId", "", { shouldDirty: true, shouldValidate: true });
      setValue("customerName", "", { shouldDirty: true });
      setValue("customerPhone", null, { shouldDirty: true });
      setValue("customerGSTIN", null, { shouldDirty: true });
      setValue("salesInvoiceId", "", { shouldDirty: true, shouldValidate: true });
      setValue("salesInvoiceNumber", null, { shouldDirty: true });
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
    setValue("salesInvoiceId", "", { shouldDirty: true, shouldValidate: true });
    setValue("salesInvoiceNumber", null, { shouldDirty: true });
  };

  const fillInvoice = (inv: SelectedInvoice | null) => {
    setSelectedInvoice(inv);
    if (!inv) {
      setValue("salesInvoiceId", "", {
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

    if (inv.customerId) {
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

  const billing = selectedCustomer?.billingAddress;
  const customerAddr = addrLine(billing);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        {/* Customer */}
        <div className="space-y-2">
          <CustomerSearchSelect onSelect={fillCustomer} />
          {errors.customerId ? (
            <p className="text-[11px] text-red-500">
              {String(errors.customerId.message || "Select a customer")}
            </p>
          ) : null}
          <input type="hidden" {...register("customerId")} />
          <input type="hidden" {...register("customerName")} />
          <input type="hidden" {...register("customerGSTIN")} />

          {selectedCustomer ? (
            <MetaCard
              title="Customer details"
              rows={[
                {
                  label: "Name",
                  value: selectedCustomer.name || selectedCustomer.companyName,
                },
                {
                  label: "Company",
                  value:
                    selectedCustomer.companyName &&
                    selectedCustomer.companyName !== selectedCustomer.name
                      ? selectedCustomer.companyName
                      : null,
                },
                { label: "Phone", value: selectedCustomer.mobile },
                { label: "Email", value: selectedCustomer.email },
                { label: "GSTIN", value: selectedCustomer.gstin },
                { label: "PAN", value: selectedCustomer.pan },
                { label: "Address", value: customerAddr },
              ]}
            />
          ) : null}
        </div>

        {/* Invoice */}
        <div className="space-y-2">
          {hasCustomer ? (
            <InvoiceSearchSelect
              purpose="credit-note"
              required
              customerId={customerId}
              onSelect={fillInvoice}
              placeholder="Search invoice for this customer"
            />
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-600">
                Sales invoice <span className="text-red-500">*</span>
              </p>
              <Input
                className="h-9 bg-slate-50"
                readOnly
                tabIndex={-1}
                placeholder="Select customer first"
              />
            </div>
          )}
          <input type="hidden" {...register("salesInvoiceId")} />
          <input type="hidden" {...register("salesInvoiceNumber")} />
          {errors.salesInvoiceId ? (
            <p className="text-[11px] text-red-500">
              {String(errors.salesInvoiceId.message || "Select an invoice")}
            </p>
          ) : null}

          {selectedInvoice ? (
            <MetaCard
              title="Invoice details"
              rows={[
                { label: "Number", value: selectedInvoice.invoiceNumber },
                {
                  label: "Date",
                  value: fmtDate(selectedInvoice.invoiceDate),
                },
                {
                  label: "Status",
                  value: selectedInvoice.invoiceStatus
                    ? String(selectedInvoice.invoiceStatus).replaceAll("_", " ")
                    : null,
                },
                {
                  label: "Amount",
                  value:
                    selectedInvoice.grandTotal != null
                      ? `₹${formatINR(selectedInvoice.grandTotal)}`
                      : null,
                },
                {
                  label: "Taxable",
                  value:
                    selectedInvoice.taxableAmount != null
                      ? `₹${formatINR(selectedInvoice.taxableAmount)}`
                      : null,
                },
                {
                  label: "Place of supply",
                  value: selectedInvoice.placeOfSupply,
                },
              ]}
            />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="Date" required>
          <Input type="date" className="h-9" {...register("creditNoteDate")} />
        </FormField>

        <FormField label="Reason" required>
          <Select
            value={reason}
            onValueChange={(v) =>
              setValue("reason", v as CreditNoteReason, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
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
    </div>
  );
}
