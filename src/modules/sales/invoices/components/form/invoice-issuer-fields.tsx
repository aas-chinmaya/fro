"use client";

import { useFormContext, useWatch } from "react-hook-form";
import {
  Building2,
  Calendar,
  FileText,
  ImageIcon,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Smartphone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/modules/sales/shared/components/ui/form-field";
import type { InvoiceFormValues } from "../../types/invoice-form.types";
import type { InvoiceType } from "../../types/invoice.types";

const INVOICE_TYPES: { value: InvoiceType; label: string }[] = [
  { value: "B2B", label: "B2B" },
  { value: "B2C", label: "B2C" },
  { value: "EXPORT", label: "Export" },
  { value: "SEZ", label: "SEZ" },
];

/**
 * Invoice issuer — same layout as quotation:
 * title → logo + business card → bank toggles → bank details → type/currency/date
 */
export function InvoiceIssuerFields() {
  const { control, register, setValue } =
    useFormContext<InvoiceFormValues>();

  const trade = useWatch({ control, name: "sellerTradeName" });
  const legal = useWatch({ control, name: "sellerLegalName" });
  const gstin = useWatch({ control, name: "sellerGSTIN" });
  const phone = useWatch({ control, name: "sellerPhone" });
  const email = useWatch({ control, name: "sellerEmail" });
  const a1 = useWatch({ control, name: "sellerAddressLine1" });
  const a2 = useWatch({ control, name: "sellerAddressLine2" });
  const city = useWatch({ control, name: "sellerCity" });
  const state = useWatch({ control, name: "sellerState" });
  const pincode = useWatch({ control, name: "sellerPincode" });
  const country = useWatch({ control, name: "sellerCountry" });
  const logo = useWatch({ control, name: "businessLogo" });

  const bankName = useWatch({ control, name: "sellerBankName" });
  const bankAcc = useWatch({ control, name: "sellerBankAccountNumber" });
  const bankIfsc = useWatch({ control, name: "sellerBankIFSC" });
  const bankBranch = useWatch({ control, name: "sellerBankBranch" });
  const upiId = useWatch({ control, name: "sellerUPIId" });
  const showBank = !!useWatch({ control, name: "showBankDetails" });
  const showUpi = !!useWatch({ control, name: "showUPIDetails" });
  const invoiceType =
    (useWatch({ control, name: "invoiceType" }) as InvoiceType) || "B2B";

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
              <p className="font-medium text-slate-900">
                {trade || legal || "—"}
              </p>
              {legal && legal !== trade ? (
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

      {/* Bank: toggle → details → UPI toggle → UPI details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5">
          <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <Landmark className="h-3.5 w-3.5" /> Show bank details on document
          </span>
          <Switch
            checked={showBank}
            disabled={!hasBank}
            onCheckedChange={(v) =>
              setValue("showBankDetails", v, { shouldDirty: true })
            }
          />
        </div>
        {hasBank ? (
          <div className="space-y-1 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700">
            {bankName ? <p className="font-medium">{bankName}</p> : null}
            {bankAcc ? <p>A/C: {bankAcc}</p> : null}
            {bankIfsc ? <p>IFSC: {bankIfsc}</p> : null}
            {bankBranch ? <p>Branch: {bankBranch}</p> : null}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No bank details on file.</p>
        )}

        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5">
          <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <Smartphone className="h-3.5 w-3.5" /> Show UPI on document
          </span>
          <Switch
            checked={showUpi}
            disabled={!hasUpi}
            onCheckedChange={(v) =>
              setValue("showUPIDetails", v, { shouldDirty: true })
            }
          />
        </div>
        {hasUpi ? (
          <div className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700">
            UPI: {upiId}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No UPI on file.</p>
        )}
      </div>

      {/* Invoice-specific: type, currency, date */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">Invoice type</Label>
          <Select
            value={invoiceType}
            onValueChange={(v) => {
              const type = v as InvoiceType;
              setValue("invoiceType", type, { shouldDirty: true });
              setValue("isExport", type === "EXPORT", { shouldDirty: true });
              setValue("isSEZ", type === "SEZ", { shouldDirty: true });
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">Currency</Label>
          <Select value="INR" disabled>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormField label="Invoice date" required>
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="date"
            className="h-9 pl-8"
            {...register("invoiceDate")}
          />
        </div>
      </FormField>

      {/* Hidden seller fields */}
      {(
        [
          "sellerTradeName",
          "sellerLegalName",
          "sellerGSTIN",
          "sellerPAN",
          "sellerPhone",
          "sellerEmail",
          "sellerAddressLine1",
          "sellerAddressLine2",
          "sellerCity",
          "sellerState",
          "sellerStateCode",
          "sellerPincode",
          "sellerCountry",
          "sellerBankName",
          "sellerBankAccountNumber",
          "sellerBankIFSC",
          "sellerBankBranch",
          "sellerUPIId",
          "businessLogo",
          "currency",
        ] as const
      ).map((k) => (
        <input key={k} type="hidden" {...register(k)} />
      ))}
    </div>
  );
}
