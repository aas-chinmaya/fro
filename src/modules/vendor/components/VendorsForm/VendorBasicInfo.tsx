"use client";

import { UseFormReturn } from "react-hook-form";
import { Building2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";


import {
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";

import { FormField, ImageUpload } from "@/components/form";
import { useVendorCategories } from "@/modules/vendor/masters/hooks/useVendorCategories";

interface Props {
  form: UseFormReturn<any>;
}

export default function VendorBasicInfo({ form }: Props) {
  const router = useRouter();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const fieldErrors = errors as any;
  const logoValue = watch("logo");
  const selectedLogo = logoValue ? logoValue : null;
  const { items: vendorCategories, loading: categoriesLoading } = useVendorCategories();

  return (
    <section className="rounded-3xl p-1">
      <div className="rounded-[22px] bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Vendor Information
            </h2>
            <p className="text-sm text-slate-500">
              Company identity and basic profile
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Vendor Type"
            required
            error={fieldErrors.vendorType?.message}
          >
            <Select
              value={watch("vendorType") ?? ""}
              onValueChange={(value) => {
                if (value === "__add_vendor_type__") {
                  router.push("/vendors/masters/vendor-categories");
                  return;
                }
                setValue("vendorType", value);
              }}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue
                  placeholder={categoriesLoading ? "Loading types..." : "Select type"}
                />
              </SelectTrigger>
              <SelectContent>
                {vendorCategories
                  .filter((category) => category.status === "ACTIVE")
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                <SelectItem value="__add_vendor_type__" className="border-t border-gray-100 mt-1 font-medium text-primary">
                  <span className="flex items-center gap-2"><Plus className="h-4 w-4" />Add vendor type</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Vendor Name"
            required
            error={fieldErrors.vendorName?.message}
          >
            <Input
              placeholder="ABC Traders Pvt Ltd"
              className="rounded-xl"
              {...register("vendorName")}
            />
          </FormField>

          <FormField label="Legal Name" error={fieldErrors.legalName?.message}>
            <Input
              placeholder="Legal company name"
              className="rounded-xl"
              {...register("legalName")}
            />
          </FormField>

          <FormField
            label="Display Name"
            error={fieldErrors.displayName?.message}
          >
            <Input
              placeholder="Short display name"
              className="rounded-xl"
              {...register("displayName")}
            />
          </FormField>

          <FormField
            label="Business Category"
            error={fieldErrors.businessCategory?.message}
          >
            <Input
              readOnly
              className="rounded-xl bg-slate-50 text-slate-600"
              {...register("businessCategory")}
            />
          </FormField>

          <input type="hidden" {...register("tenantId")} />

          <FormField label="Logo" error={fieldErrors.logo?.message}>
            <ImageUpload
              value={selectedLogo}
              onChange={(file) =>
                setValue("logo", file ?? null, { shouldDirty: true })
              }
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Remarks" error={fieldErrors.remarks?.message}>
              <Textarea
                placeholder="Additional notes…"
                className="min-h-25 resize-none rounded-xl"
                {...register("remarks")}
              />
            </FormField>
          </div>
        </div>
      </div>
    </section>
  );
}