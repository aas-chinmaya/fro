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
import type { QuotationFormValues } from "../../types/quotation-form.types";

const STATES = getStateOptions();

export function QuotationCustomerFields() {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<QuotationFormValues>();

  const prospectState = useWatch({ control, name: "prospectState" }) ?? "";
  const placeOfSupply = useWatch({ control, name: "placeOfSupply" }) ?? "";
  const reverseCharge = useWatch({ control, name: "reverseCharge" }) ?? false;

  const err = (key: keyof QuotationFormValues) =>
    (errors[key]?.message as string | undefined) || undefined;

  const fillFromCustomer = (c: SelectedCustomer | null) => {
    if (!c) return;

    setValue("prospectName", c.name || "", { shouldDirty: true, shouldValidate: true });
    setValue("prospectCompanyName", c.companyName || "", { shouldDirty: true });
    setValue("prospectPhone", c.mobile || "", { shouldDirty: true, shouldValidate: true });
    setValue("prospectEmail", c.email || null, { shouldDirty: true });
    setValue("prospectGSTIN", c.gstin || "", { shouldDirty: true });
    setValue("prospectPAN", c.pan || "", { shouldDirty: true });

    const a = c.billingAddress;
    if (a) {
      setValue("prospectAddressLine1", a.addressLine1 || a.line1 || "", {
        shouldDirty: true,
      });
      setValue("prospectAddressLine2", a.addressLine2 || a.line2 || "", {
        shouldDirty: true,
      });
      setValue("prospectCity", a.city || "", { shouldDirty: true });
      setValue("prospectPincode", a.pincode || "", { shouldDirty: true });
      setValue("prospectCountry", a.country || "India", { shouldDirty: true });
      if (a.state) {
        const match = STATES.find(
          (s) =>
            s.label.toLowerCase() === a.state!.toLowerCase() ||
            s.value === a.state!.toLowerCase(),
        );
        if (match) {
          setValue("prospectState", match.label, { shouldDirty: true });
          setValue("prospectStateCode", match.code, { shouldDirty: true });
          setValue("placeOfSupply", match.label, { shouldDirty: true });
          setValue("placeOfSupplyCode", match.code, { shouldDirty: true });
        } else {
          setValue("prospectState", a.state, { shouldDirty: true });
          setValue("prospectStateCode", a.stateCode || "", { shouldDirty: true });
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
      <CustomerSearchSelect onSelect={fillFromCustomer} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-slate-600">
            Customer name <span className="text-red-500">*</span>
          </Label>
          <Input className="h-9" maxLength={200} {...register("prospectName")} />
          {err("prospectName") ? (
            <p className="text-[11px] text-red-600">{err("prospectName")}</p>
          ) : null}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-slate-600">Company name</Label>
          <Input className="h-9" maxLength={200} {...register("prospectCompanyName")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            className="h-9"
            maxLength={20}
            placeholder="+919876543210"
            {...register("prospectPhone")}
          />
          {err("prospectPhone") ? (
            <p className="text-[11px] text-red-600">{err("prospectPhone")}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Email</Label>
          <Input className="h-9" type="email" maxLength={100} {...register("prospectEmail")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">GSTIN</Label>
          <Input className="h-9" maxLength={15} {...register("prospectGSTIN")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">PAN</Label>
          <Input className="h-9" maxLength={10} {...register("prospectPAN")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-slate-600">
            Address  <span className="text-red-500">*</span>
          </Label>
          <Input className="h-9" maxLength={300} {...register("prospectAddressLine1")} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-slate-600">Address line 2</Label>
          <Input className="h-9" maxLength={300} {...register("prospectAddressLine2")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
            City <span className="text-red-500">*</span>
          </Label>
          <Input className="h-9" maxLength={100} {...register("prospectCity")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
            Pincode <span className="text-red-500">*</span>
          </Label>
          <Input className="h-9" maxLength={6} inputMode="numeric" {...register("prospectPincode")} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
             State / UT <span className="text-red-500">*</span>
          </Label>
          <Select
            value={stateValue(prospectState)}
            onValueChange={(v) => {
              const s = STATES.find((x) => x.value === v);
              if (!s) return;
              setValue("prospectState", s.label, { shouldDirty: true, shouldValidate: true });
              setValue("prospectStateCode", s.code, { shouldDirty: true });
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
          <Input className="h-9" maxLength={100} {...register("prospectCountry")} />
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
