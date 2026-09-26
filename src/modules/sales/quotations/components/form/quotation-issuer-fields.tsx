"use client";

import { useFormContext, useWatch } from "react-hook-form";
import {
  Building2,
  Calendar,
  ImageIcon,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  FileText,

  Eye, EyeOff
} from "lucide-react";
import { Input } from "@/components/ui/input";

import { FormField } from "@/modules/sales/shared/components/ui/form-field";
import type { QuotationFormValues } from "../../types/quotation-form.types";

/** Quotation issuer — logo + business top, bank toggles, then dates */
export function QuotationIssuerFields() {
  const { control, register, setValue } =
    useFormContext<QuotationFormValues>();

  const name = useWatch({ control, name: "businessName" });
  const legal = useWatch({ control, name: "businessLegalName" });
  const gstin = useWatch({ control, name: "businessGSTIN" });
  const phone = useWatch({ control, name: "businessPhone" });
  const email = useWatch({ control, name: "businessEmail" });
  const a1 = useWatch({ control, name: "businessAddressLine1" });
  const a2 = useWatch({ control, name: "businessAddressLine2" });
  const city = useWatch({ control, name: "businessCity" });
  const state = useWatch({ control, name: "businessState" });
  const pincode = useWatch({ control, name: "businessPincode" });
  const country = useWatch({ control, name: "businessCountry" });
  const logo = useWatch({ control, name: "businessLogo" });

  const bankName = useWatch({ control, name: "businessBankName" });
  const bankAcc = useWatch({ control, name: "businessBankAccountNumber" });
  const bankIfsc = useWatch({ control, name: "businessBankIFSC" });
  const bankBranch = useWatch({ control, name: "businessBankBranch" });
  const upiId = useWatch({ control, name: "businessUPIId" });
  const showBank = !!useWatch({ control, name: "showBankDetails" });
  const showUpi = !!useWatch({ control, name: "showUPIDetails" });

  const hasBank = !!(bankName || bankAcc || bankIfsc || bankBranch);
  const hasUpi = !!upiId;
  const address = [a1, a2, city, state, pincode, country]
    .filter(Boolean)
    .join(", ");

  const onLogoFile = (file: File | undefined) => {
    if (!file || file.size > 1_500_000) return;
    const reader = new FileReader();
    reader.onload = () =>
      setValue("businessLogo", String(reader.result || ""), {
        shouldDirty: true,
      });
    reader.readAsDataURL(file);
  };
const maskValue = (value?: string | null) => {
  if (!value) return "—";
  if (value.length <= 4) return "••••";

  return `${value.slice(0, 1)}${"•".repeat(Math.max(value.length - 2, 3))}${value.slice(-1)}`;
}; 
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        From (your business)
      </p>

      {/* Logo + business card */}
      <div className="flex flex-row items-start gap-3">
        <div className="order-2 ml-auto flex shrink-0 flex-col items-center gap-1.5">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={String(logo)}
                alt="Logo"
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-slate-300" />
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            {logo ? "Change logo" : "Choose file"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                onLogoFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {logo ? (
            <button
              type="button"
              className="text-[10px] text-red-500 hover:text-red-600"
              onClick={() =>
                setValue("businessLogo", null, { shouldDirty: true })
              }
            >
              Remove
            </button>
          ) : null}
        </div>

        <div className="order-1 min-w-0 flex-1 space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm">
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div className="min-w-0">
              <p className="font-medium text-slate-900">{name || "—"}</p>
              {legal && legal !== name ? (
                <p className="text-xs text-slate-500">{legal}</p>
              ) : null}
            </div>
          </div>
          {gstin ? (
            <p className="flex items-center gap-2 text-xs text-slate-600">
              <FileText className="h-3.5 w-3.5 shrink-0" /> GSTIN: {gstin}
            </p>
          ) : null}
          {phone ? (
            <p className="flex items-center gap-2 text-xs text-slate-600">
              <Phone className="h-3.5 w-3.5 shrink-0" /> {phone}
            </p>
          ) : null}
          {email ? (
            <p className="flex items-center gap-2 text-xs text-slate-600">
              <Mail className="h-3.5 w-3.5 shrink-0" /> {email}
            </p>
          ) : null}
          {address ? (
            <p className="flex items-start gap-2 text-xs text-slate-600">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {address}
            </p>
          ) : null}
        </div>
      </div>


   
<div className="space-y-3">
  {/* Bank Details */}
  <div className="rounded-lg border border-slate-200 bg-white p-3">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Landmark className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-slate-800">
          Bank Details
        </span>
      </div>

      <button
        type="button"
        disabled={!hasBank}
        onClick={() =>
          setValue("showBankDetails", !showBank, {
            shouldDirty: true,
          })
        }
        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-primary/10 text-primary"
        title={showBank ? "Hide in Quotation" : "Show in Quotation"}
      >
        {showBank ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>
    </div>

    {hasBank ? (
      <div className="space-y-2 rounded-md border border-slate-100 bg-slate-50/50 p-3 text-xs">
        <div className="flex cursor-pointer items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-slate-400">Bank Name</span>
          <span className="font-medium text-slate-700">
            {showBank ? bankName : maskValue(bankName)}
          </span>
        </div>

        <div className="flex cursor-pointer items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-slate-400">Account Number</span>
          <span className="font-medium text-slate-700">
            {showBank ? bankAcc : maskValue(bankAcc)}
          </span>
        </div>

        <div className="flex cursor-pointer items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-slate-400">IFSC</span>
          <span className="font-medium text-slate-700">
            {showBank ? bankIfsc : maskValue(bankIfsc)}
          </span>
        </div>

        <div className="flex cursor-pointer items-center justify-between">
          <span className="text-slate-400">Branch</span>
          <span className="font-medium text-slate-700">
            {showBank ? bankBranch : maskValue(bankBranch)}
          </span>
        </div>
      </div>
    ) : (
      <p className="cursor-pointer text-xs text-slate-400">
        No bank details on file.
      </p>
    )}
  </div>

  {/* UPI Details */}
  <div className="rounded-lg border border-slate-200 bg-white p-3">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-slate-800">
          UPI Details
        </span>
      </div>

      <button
        type="button"
        disabled={!hasUpi}
        onClick={() =>
          setValue("showUPIDetails", !showUpi, {
            shouldDirty: true,
          })
        }
        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-primary/10 text-primary"
        title={showUpi ? "Hide in Quotation" : "Show in Quotation"}
      >
        {showUpi ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>
    </div>

    {hasUpi ? (
      <div className="rounded-md border border-slate-100 bg-slate-50/50 p-3 text-xs">
        <div className="flex cursor-pointer items-center justify-between">
          <span className="text-slate-400">UPI ID</span>
          <span className="font-medium text-slate-700">
            {showUpi ? upiId : maskValue(upiId)}
          </span>
        </div>
      </div>
    ) : (
      <p className="cursor-pointer text-xs text-slate-400">
        No UPI details on file.
      </p>
    )}
  </div>
</div>
      {/* Dates */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Quotation date" required>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="date"
              className="h-9 pl-8"
              {...register("quotationDate")}
            />
          </div>
        </FormField>
        <FormField label="Valid until" required>
          <Input type="date" className="h-9" {...register("validUntil")} />
        </FormField>
      </div>

      {/* Hidden session fields */}
      {(
        [
          "businessName",
          "businessLegalName",
          "businessGSTIN",
          "businessPAN",
          "businessPhone",
          "businessEmail",
          "businessAddressLine1",
          "businessAddressLine2",
          "businessCity",
          "businessState",
          "businessStateCode",
          "businessPincode",
          "businessCountry",
          "businessBankName",
          "businessBankAccountNumber",
          "businessBankIFSC",
          "businessBankBranch",
          "businessUPIId",
          "businessLogo",
        ] as const
      ).map((k) => (
        <input key={k} type="hidden" {...register(k)} />
      ))}
    </div>
  );
}
