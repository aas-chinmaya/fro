"use client";

import { useFormContext, useWatch } from "react-hook-form";
import {
  Building2,
  Calendar,
  FileText,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/modules/sales/shared/components/ui/form-field";
import type { QuotationFormValues } from "../../types/quotation-form.types";

/** Quotation issuer — logo display-only (same as invoice) + business card + dates */
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

  const address = [a1, a2, city, state, pincode, country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        From (your business)
      </p>

      {/* Logo (display only) + business card — same as invoice */}
      <div className="flex flex-row items-start gap-3">
        {/* Logo - SHOW ONLY */}
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
        </div>

        {/* Business card */}
        <div className="order-1 min-w-0 flex-1 space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm">
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div className="min-w-0">
              <p className="font-medium text-slate-900">
                {name || legal || "—"}
              </p>
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

      {/* Dates */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Quotation date" required>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="date"
              className="pl-9"
              {...register("quotationDate")}
            />
          </div>
        </FormField>
        <FormField label="Valid until" required>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="date"
              className="pl-9"
              {...register("validUntil")}
            />
          </div>
        </FormField>
      </div>

      {/* Hidden fields kept in form state (same as invoice) */}
      <input type="hidden" {...register("businessName")} />
      <input type="hidden" {...register("businessLegalName")} />
      <input type="hidden" {...register("businessGSTIN")} />
      <input type="hidden" {...register("businessPAN")} />
      <input type="hidden" {...register("businessPhone")} />
      <input type="hidden" {...register("businessEmail")} />
      <input type="hidden" {...register("businessAddressLine1")} />
      <input type="hidden" {...register("businessAddressLine2")} />
      <input type="hidden" {...register("businessCity")} />
      <input type="hidden" {...register("businessState")} />
      <input type="hidden" {...register("businessStateCode")} />
      <input type="hidden" {...register("businessPincode")} />
      <input type="hidden" {...register("businessCountry")} />
      <input type="hidden" {...register("businessLogo")} />
    </div>
  );
}
