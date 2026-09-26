"use client";
import { UseFormReturn } from "react-hook-form";
import { FileCheck } from "lucide-react";

import {
  Input,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";

import { FormField } from "@/components/form";

interface Props {
  form: UseFormReturn<any>;
}

export default function VendorTaxInfo({ form }: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  return (
    <section className="rounded-3xl bg-amber-50/60 p-1">
      <div className="rounded-[22px] bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
            <FileCheck size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Tax & Compliance
            </h2>
            <p className="text-sm text-slate-500">
              GST, PAN and other identifiers
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="GST Type"
            required
            error={((errors as any).gstType?.message as string | undefined)}
          >
            <Select
              value={watch("gstType") ?? "REGISTERED"}
              onValueChange={(value) => setValue("gstType", value)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGISTERED">Registered</SelectItem>
                <SelectItem value="UNREGISTERED">Unregistered</SelectItem>
                <SelectItem value="COMPOSITION">Composition</SelectItem>
                <SelectItem value="SEZ">SEZ</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="GSTIN" error={((errors as any).gstin?.message as string | undefined)}>
            <Input
              placeholder="22AAAAA0000A1Z5"
              className="rounded-xl uppercase"
              {...register("gstin", {
                setValueAs: (value: string) => value?.trim().toUpperCase() ?? "",
              })}
            />
          </FormField>

          <FormField label="PAN" error={((errors as any).pan?.message as string | undefined)}>
            <Input
              placeholder="ABCDE1234F"
              className="rounded-xl uppercase"
              {...register("pan", {
                setValueAs: (value: string) => value?.trim().toUpperCase() ?? "",
              })}
            />
          </FormField>

          <FormField label="TAN" error={((errors as any).tan?.message as string | undefined)}>
            <Input
              placeholder="MUMA12345A"
              className="rounded-xl uppercase"
              {...register("tan", {
                setValueAs: (value: string) => value?.trim().toUpperCase() ?? "",
              })}
            />
          </FormField>

          <FormField label="MSME" error={((errors as any).msme?.message as string | undefined)}>
            <Input
              placeholder="UDYAM-XX-00-0000000"
              className="rounded-xl uppercase"
              {...register("msme", {
                setValueAs: (value: string) => value?.trim().toUpperCase() ?? "",
              })}
            />
          </FormField>

          <FormField label="CIN" error={((errors as any).cin?.message as string | undefined)}>
            <Input
              placeholder="U74999DL2020PTC123456"
              className="rounded-xl uppercase"
              {...register("cin", {
                setValueAs: (value: string) => value?.trim().toUpperCase() ?? "",
              })}
            />
          </FormField>

          <FormField label="Aadhaar" error={((errors as any).aadhaar?.message as string | undefined)}>
            <Input
              placeholder="1234 5678 9012"
              className="rounded-xl"
              {...register("aadhaar", {
                setValueAs: (value: string) => value?.replace(/\s+/g, "") ?? "",
              })}
            />
          </FormField>

          <div className="md:col-span-2 space-y-4 rounded-2xl bg-slate-50 p-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2.5">
                <Checkbox
                  checked={Boolean(watch("tdsApplicable"))}
                  onCheckedChange={(checked) =>
                    setValue("tdsApplicable", Boolean(checked))
                  }
                />
                <span className="text-sm text-slate-700">TDS Applicable</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5">
                <Checkbox
                  checked={Boolean(watch("tcsApplicable"))}
                  onCheckedChange={(checked) =>
                    setValue("tcsApplicable", Boolean(checked))
                  }
                />
                <span className="text-sm text-slate-700">TCS Applicable</span>
              </label>
            </div>

            <FormField label="TDS Section" error={((errors as any).tdsSection?.message as string | undefined)}>
              <Input
                placeholder="Section 194Q"
                className="rounded-xl bg-white"
                {...register("tdsSection", {
                  setValueAs: (value: string) => value?.trim() ?? "",
                })}
              />
            </FormField>
          </div>
        </div>
      </div>
    </section>
  );
}
