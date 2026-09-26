"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Wallet } from "lucide-react";

import {
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";

import { FormField } from "@/components/form";
import { currencyMasterService } from "@/modules/business/masters/services/master.service";

interface CurrencyOption {
  id: string | number;
  currencyName: string;
  currencyCode: string;
  currencySymbol?: string | null;
  status?: boolean;
}

interface Props {
  form: UseFormReturn<any>;
}

export default function VendorPaymentInfo({ form }: Props) {
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);

  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const fieldErrors = errors as any;

  useEffect(() => {
    let mounted = true;

    const loadCurrencies = async () => {
      try {
        const result = await currencyMasterService.list();
        if (mounted) {
          setCurrencies(Array.isArray(result) ? result : []);
        }
      } finally {
        if (mounted) setCurrenciesLoading(false);
      }
    };

    loadCurrencies();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-3xl bg-emerald-50/60 p-1">
      <div className="rounded-[22px] bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Wallet size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
             Purchase & Payment Settings
            </h2>
            <p className="text-sm text-slate-500">
              Currency, terms and credit settings
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Currency"
            required
            error={fieldErrors.currencyId?.message}
          >
            <Select
              value={String(watch("currencyId") ?? "")}
              onValueChange={(value) =>
                setValue("currencyId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue
                  placeholder={currenciesLoading ? "Loading currencies..." : "Select currency"}
                />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={String(currency.id)}>
                    {currency.currencyName} ({currency.currencyCode})
                    {currency.currencySymbol ? ` - ${currency.currencySymbol}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Payment Term"
            error={fieldErrors.paymentTerm?.message}
          >
            <Input
              placeholder="e.g. 30 days"
              className="rounded-xl"
              {...form.register("paymentTerm")}
            />
          </FormField>

          <FormField
            label="Payment Mode"
            error={fieldErrors.paymentMode?.message}
          >
            <Select
              value={watch("paymentMode")}
              onValueChange={(value) => setValue("paymentMode", value)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK">Bank</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
                <SelectItem value="NEFT">NEFT</SelectItem>
                <SelectItem value="RTGS">RTGS</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Balance Type"
            error={fieldErrors.balanceType?.message}
          >
            <Select
              value={watch("balanceType")}
              onValueChange={(value) => setValue("balanceType", value)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select balance type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBIT">Debit</SelectItem>
                <SelectItem value="CREDIT">Credit</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="GST Slab"
            error={fieldErrors.gstSlab?.message}
          >
            <Input
              placeholder="e.g. 18%"
              className="rounded-xl"
              {...form.register("gstSlab")}
            />
          </FormField>

          <FormField
            label="Purchase Ledger"
            error={fieldErrors.purchaseLedger?.message}
          >
            <Input
              placeholder="Purchase ledger name"
              className="rounded-xl"
              {...form.register("purchaseLedger")}
            />
          </FormField>

          <FormField
            label="Credit Limit"
            error={fieldErrors.creditLimit?.message}
          >
            <Input
              type="number"
              placeholder="0"
              className="rounded-xl"
              {...form.register("creditLimit", { valueAsNumber: true })}
            />
          </FormField>

          <FormField
            label="Opening Balance"
            error={fieldErrors.openingBalance?.message}
          >
            <Input
              type="number"
              placeholder="0"
              className="rounded-xl"
              {...form.register("openingBalance", { valueAsNumber: true })}
            />
          </FormField>
        </div>
      </div>
    </section>
  );
}
