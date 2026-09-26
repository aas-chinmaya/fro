"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomerSearchSelect, {
  type SelectedCustomer,
} from "@/modules/sales/shared/components/customer-search-select";
import { getStateOptions } from "@/modules/sales/shared/utils/state-code";
import type { InvoiceFormValues } from "../../types/invoice-form.types";

const STATES = getStateOptions();

/** Invoice customer — search select is separate; name field is manual entry */
export function InvoiceCustomerFields() {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const billingState = useWatch({ control, name: "billingState" }) ?? "";
  const placeOfSupply = useWatch({ control, name: "placeOfSupply" }) ?? "";
  const reverseCharge = useWatch({ control, name: "reverseCharge" }) ?? false;

  const err = (key: keyof InvoiceFormValues) =>
    (errors[key]?.message as string | undefined) || undefined;

  const fillFromCustomer = (c: SelectedCustomer | null) => {
    if (!c) return;
    setValue("buyerName", c.name || "", { shouldDirty: true, shouldValidate: true });
    setValue("buyerCompanyName", c.companyName || "", { shouldDirty: true });
    setValue("buyerPhone", c.mobile || "", { shouldDirty: true, shouldValidate: true });
    setValue("buyerEmail", c.email || null, { shouldDirty: true });
    setValue("buyerGSTIN", c.gstin || "", { shouldDirty: true });
    setValue("buyerPAN", c.pan || "", { shouldDirty: true });

    const a = c.billingAddress;
    if (a) {
      const line1 = a.addressLine1 || a.line1 || "";
      const line2 = a.addressLine2 || a.line2 || "";
      setValue("billingAddressLine1", line1, { shouldDirty: true });
      setValue("billingAddressLine2", line2 || "", { shouldDirty: true });
      setValue("billingCity", a.city || "", { shouldDirty: true });
      setValue("billingPincode", a.pincode || "", { shouldDirty: true });
      setValue("billingCountry", a.country || "India", { shouldDirty: true });
      if (a.state) {
        const match = STATES.find(
          (s) =>
            s.label.toLowerCase() === a.state!.toLowerCase() ||
            s.value === a.state!.toLowerCase(),
        );
        if (match) {
          setValue("billingState", match.label, { shouldDirty: true });
          setValue("billingStateCode", match.code, { shouldDirty: true });
          setValue("placeOfSupply", match.label, { shouldDirty: true });
          setValue("placeOfSupplyCode", match.code, { shouldDirty: true });
        } else {
          setValue("billingState", a.state, { shouldDirty: true });
          setValue("billingStateCode", a.stateCode || "", { shouldDirty: true });
        }
      }
    }
  };

  const stateValue = (raw: string) =>
    STATES.find(
      (s) =>
        s.label.toLowerCase() === String(raw).toLowerCase() ||
        s.value === String(raw).toLowerCase(),
    )?.value ?? "";

  return (
    <div className="space-y-3">
      {/* Search existing customer — does not replace the name input */}
      <CustomerSearchSelect onSelect={fillFromCustomer} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-slate-600">
            Customer name <span className="text-red-500">*</span>
          </Label>
          <Input className="h-9" maxLength={200} {...register("buyerName")} />
          {err("buyerName") ? (
            <p className="text-[11px] text-red-600">{err("buyerName")}</p>
          ) : null}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-slate-600">Company name</Label>
          <Input className="h-9" maxLength={200} {...register("buyerCompanyName")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            className="h-9"
            maxLength={20}
            placeholder="+919876543210"
            {...register("buyerPhone")}
          />
          {err("buyerPhone") ? (
            <p className="text-[11px] text-red-600">{err("buyerPhone")}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Email</Label>
          <Input className="h-9" type="email" maxLength={100} {...register("buyerEmail")} />
          {err("buyerEmail") ? (
            <p className="text-[11px] text-red-600">{err("buyerEmail")}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">GSTIN</Label>
          <Input className="h-9" maxLength={15} {...register("buyerGSTIN")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">PAN</Label>
          <Input className="h-9" maxLength={10} {...register("buyerPAN")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-slate-600">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input className="h-9" maxLength={300} {...register("billingAddressLine1")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-slate-600">Address line 2</Label>
          <Input className="h-9" maxLength={300} {...register("billingAddressLine2")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
            City <span className="text-red-500">*</span>
          </Label>
          <Input className="h-9" maxLength={100} {...register("billingCity")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
            Pincode <span className="text-red-500">*</span>
          </Label>
          <Input className="h-9" maxLength={6} inputMode="numeric" {...register("billingPincode")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
             State / UT <span className="text-red-500">*</span>
          </Label>
          <Select
            value={stateValue(billingState)}
            onValueChange={(v) => {
              const s = STATES.find((x) => x.value === v);
              if (!s) return;
              setValue("billingState", s.label, { shouldDirty: true, shouldValidate: true });
              setValue("billingStateCode", s.code, { shouldDirty: true });
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label} ({s.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
            Country <span className="text-red-500">*</span>
          </Label>
          <Input className="h-9" maxLength={100} {...register("billingCountry")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
            Place of supply <span className="text-red-500">*</span>
          </Label>
          <Select
            value={stateValue(placeOfSupply)}
            onValueChange={(v) => {
              const s = STATES.find((x) => x.value === v);
              if (!s) return;
              setValue("placeOfSupply", s.label, { shouldDirty: true, shouldValidate: true });
              setValue("placeOfSupplyCode", s.code, { shouldDirty: true });
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select place of supply" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label} ({s.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Reverse charge</Label>
          <Select
            value={reverseCharge ? "yes" : "no"}
            onValueChange={(v) =>
              setValue("reverseCharge", v === "yes", { shouldDirty: true })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
