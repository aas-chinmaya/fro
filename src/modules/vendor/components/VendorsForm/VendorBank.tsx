"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, Landmark } from "lucide-react";

import {
  Input,
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

export default function VendorBank({ form }: Props) {
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const bankErrors = errors.banks as any;

  return (
    <section className="rounded-3xl bg-indigo-50/60 p-1">
      <div className="rounded-[22px] bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Landmark size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Bank Details
            </h2>
            <p className="text-sm text-slate-500">
              Account used for payments
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Account Holder"
            required
            error={bankErrors?.[0]?.accountHolder?.message}
          >
            <Input
              placeholder="ABC Traders Pvt Ltd"
              className="rounded-xl"
              {...register("banks.0.accountHolder")}
            />
          </FormField>

          <FormField
            label="Bank Name"
            required
            error={bankErrors?.[0]?.bankName?.message}
          >
            <Input
              placeholder="State Bank of India"
              className="rounded-xl"
              {...register("banks.0.bankName")}
            />
          </FormField>

          <FormField
            label="Account Number"
            required
            error={bankErrors?.[0]?.accountNumber?.message}
          >
            <div className="relative">
              <Input
                type={showAccountNumber ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]+"
                maxLength={18}
                placeholder="123456789012"
                className="rounded-xl pr-12"
                {...register("banks.0.accountNumber")}
              />
              <button
                type="button"
                aria-label={
                  showAccountNumber
                    ? "Hide account number"
                    : "Show account number"
                }
                onClick={() => setShowAccountNumber((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-primary/30"
              >
                {showAccountNumber ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          <FormField
            label="IFSC Code"
            required
            error={bankErrors?.[0]?.ifscCode?.message}
          >
            <Input
              placeholder="SBIN0001234"
              className="rounded-xl uppercase"
              {...register("banks.0.ifscCode", {
                setValueAs: (value: string) => value?.trim().toUpperCase() ?? "",
              })}
            />
          </FormField>

          <FormField label="Branch" error={bankErrors?.[0]?.branch?.message}>
            <Input
              placeholder="Patia Branch"
              className="rounded-xl"
              {...register("banks.0.branch")}
            />
          </FormField>

          <FormField label="UPI ID" error={bankErrors?.[0]?.upiId?.message}>
            <Input
              placeholder="vendor@upi"
              className="rounded-xl"
              {...register("banks.0.upiId", {
                setValueAs: (value: string) => value?.trim() ?? "",
              })}
            />
          </FormField>

          <FormField
            label="Account Type"
            required
            error={bankErrors?.[0]?.accountType?.message}
          >
            <Select
              value={watch("banks.0.accountType") ?? ""}
              onValueChange={(value) => setValue("banks.0.accountType", value)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAVING">Saving</SelectItem>
                <SelectItem value="CURRENT">Current</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Cancelled Cheque" error={bankErrors?.[0]?.cancelledCheque?.message}>
            <Input
              placeholder="Cancelled cheque ref"
              className="rounded-xl"
              {...register("banks.0.cancelledCheque")}
            />
          </FormField>

        </div>
      </div>
    </section>
  );
}
