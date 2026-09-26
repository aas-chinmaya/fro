"use client";

import { UseFormReturn } from "react-hook-form";
import { MapPin } from "lucide-react";

import {
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

import { FormField } from "@/components/form";

interface Props {
  form: UseFormReturn<any>;
}

const countries = [
  { id: "country-india", name: "India" },
  { id: "country-uae", name: "United Arab Emirates" },
  { id: "country-usa", name: "United States" },
  { id: "country-uk", name: "United Kingdom" },
  { id: "country-australia", name: "Australia" },
] as const;

const statesByCountry: Record<string, { id: string; name: string }[]> = {
  "country-india": [
    { id: "state-india-andhra-pradesh", name: "Andhra Pradesh" },
    { id: "state-india-arunachal-pradesh", name: "Arunachal Pradesh" },
    { id: "state-india-assam", name: "Assam" },
    { id: "state-india-bihar", name: "Bihar" },
    { id: "state-india-chhattisgarh", name: "Chhattisgarh" },
    { id: "state-india-goa", name: "Goa" },
    { id: "state-india-gujarat", name: "Gujarat" },
    { id: "state-india-haryana", name: "Haryana" },
    { id: "state-india-himachal-pradesh", name: "Himachal Pradesh" },
    { id: "state-india-jharkhand", name: "Jharkhand" },
    { id: "state-india-karnataka", name: "Karnataka" },
    { id: "state-india-kerala", name: "Kerala" },
    { id: "state-india-madhya-pradesh", name: "Madhya Pradesh" },
    { id: "state-india-maharashtra", name: "Maharashtra" },
    { id: "state-india-manipur", name: "Manipur" },
    { id: "state-india-meghalaya", name: "Meghalaya" },
    { id: "state-india-mizoram", name: "Mizoram" },
    { id: "state-india-nagaland", name: "Nagaland" },
    { id: "state-india-odisha", name: "Odisha" },
    { id: "state-india-punjab", name: "Punjab" },
    { id: "state-india-rajasthan", name: "Rajasthan" },
    { id: "state-india-sikkim", name: "Sikkim" },
    { id: "state-india-tamil-nadu", name: "Tamil Nadu" },
    { id: "state-india-telangana", name: "Telangana" },
    { id: "state-india-tripura", name: "Tripura" },
    { id: "state-india-uttar-pradesh", name: "Uttar Pradesh" },
    { id: "state-india-uttarakhand", name: "Uttarakhand" },
    { id: "state-india-west-bengal", name: "West Bengal" },
    { id: "state-india-andaman-nicobar", name: "Andaman and Nicobar Islands" },
    { id: "state-india-chandigarh", name: "Chandigarh" },
    { id: "state-india-dadra-nagar", name: "Dadra and Nagar Haveli and Daman and Diu" },
    { id: "state-india-lakshadweep", name: "Lakshadweep" },
    { id: "state-india-delhi", name: "Delhi" },
    { id: "state-india-puducherry", name: "Puducherry" },
  ],
  "country-uae": [
    { id: "state-uae-dubai", name: "Dubai" },
    { id: "state-uae-abudhabi", name: "Abu Dhabi" },
    { id: "state-uae-sharjah", name: "Sharjah" },
  ],
  "country-usa": [
    { id: "state-usa-california", name: "California" },
    { id: "state-usa-texas", name: "Texas" },
    { id: "state-usa-newyork", name: "New York" },
  ],
  "country-uk": [
    { id: "state-uk-england", name: "England" },
    { id: "state-uk-scotland", name: "Scotland" },
    { id: "state-uk-wales", name: "Wales" },
  ],
  "country-australia": [
    { id: "state-australia-nsw", name: "New South Wales" },
    { id: "state-australia-victoria", name: "Victoria" },
    { id: "state-australia-queensland", name: "Queensland" },
  ],
};

const resolveCountryId = (value: string) =>
  countries.find((country) => country.id === value || country.name === value)?.id ?? value;

const resolveStateId = (countryId: string, value: string) =>
  statesByCountry[countryId]?.find((state) => state.id === value || state.name === value)?.id ?? value;

export default function VendorAddress({ form }: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const sameAsBilling = watch("sameAsBilling") ?? true;
  const billingCountryValue = watch("addresses.0.countryId") ?? "";
  const shippingCountryValue = watch("shippingAddress.countryId") ?? "";
  const billingCountryId = resolveCountryId(billingCountryValue);
  const shippingCountryId = resolveCountryId(shippingCountryValue);
  const billingStates = statesByCountry[billingCountryId] ?? [];
  const shippingStates = statesByCountry[shippingCountryId] ?? [];
  const billingStateId = resolveStateId(billingCountryId, watch("addresses.0.stateId") ?? "");
  const shippingStateId = resolveStateId(shippingCountryId, watch("shippingAddress.stateId") ?? "");
  const billingAddressLine1Error = ((errors as any).addresses?.[0]?.addressLine1?.message as string | undefined);
  const billingAddressLine2Error = ((errors as any).addresses?.[0]?.addressLine2?.message as string | undefined);
  const billingCountryError = ((errors as any).addresses?.[0]?.countryId?.message as string | undefined);
  const billingStateError = ((errors as any).addresses?.[0]?.stateId?.message as string | undefined);
  const billingCityError = ((errors as any).addresses?.[0]?.cityId?.message as string | undefined);
  const billingPincodeError = ((errors as any).addresses?.[0]?.pincode?.message as string | undefined);
  const billingStatusError = ((errors as any).addresses?.[0]?.status?.message as string | undefined);
  const shippingAddressLine1Error = ((errors as any).shippingAddress?.addressLine1?.message as string | undefined);
  const shippingAddressLine2Error = ((errors as any).shippingAddress?.addressLine2?.message as string | undefined);
  const shippingCountryError = ((errors as any).shippingAddress?.countryId?.message as string | undefined);
  const shippingStateError = ((errors as any).shippingAddress?.stateId?.message as string | undefined);
  const shippingCityError = ((errors as any).shippingAddress?.cityId?.message as string | undefined);
  const shippingPincodeError = ((errors as any).shippingAddress?.pincode?.message as string | undefined);

  return (
    <section className="rounded-3xl bg-primary/10/60 p-1">
      <div className="rounded-[22px] bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white">
            <MapPin size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Address</h2>
            <p className="text-sm text-slate-500">
              Billing and shipping locations for the vendor.
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Billing address</h3>
              <p className="text-sm text-slate-500">Primary location used for invoices and records.</p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80">
              <Checkbox
                checked={sameAsBilling}
                onCheckedChange={(checked) => setValue("sameAsBilling", Boolean(checked))}
              />
              Same as shipping
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField label="Address Line 1" required error={billingAddressLine1Error}>
                <Input
                  placeholder="Street / Building"
                  className="rounded-xl"
                  {...register("addresses.0.addressLine1")}
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Address Line 2" error={billingAddressLine2Error}>
                <Input
                  placeholder="Area / Landmark"
                  className="rounded-xl"
                  {...register("addresses.0.addressLine2")}
                />
              </FormField>
            </div>

            <FormField label="Landmark" error={((errors as any).addresses?.[0]?.landmark?.message as string | undefined)}>
              <Input
                placeholder="Near landmark"
                className="rounded-xl"
                {...register("addresses.0.landmark")}
              />
            </FormField>

            <FormField label="District" error={((errors as any).addresses?.[0]?.district?.message as string | undefined)}>
              <Input
                placeholder="District"
                className="rounded-xl"
                {...register("addresses.0.district")}
              />
            </FormField>

            <FormField label="Country" required error={billingCountryError}>
              <Select
                value={billingCountryId}
                onValueChange={(value) => {
                  setValue("addresses.0.countryId", value);
                  setValue("addresses.0.stateId", "");
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="State" required error={billingStateError}>
              <Select
                value={billingStateId}
                onValueChange={(value) => setValue("addresses.0.stateId", value)}
                disabled={!billingCountryId}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={billingCountryId ? "Select state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {billingStates.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="City" required error={billingCityError}>
              <Input
                placeholder="Bhubaneswar"
                className="rounded-xl"
                {...register("addresses.0.cityId")}
              />
            </FormField>

            <FormField label="Pincode" required error={billingPincodeError}>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="751024"
                className="rounded-xl"
                {...register("addresses.0.pincode")}
              />
            </FormField>

            <FormField label="Address Status" error={billingStatusError}>
              <Select
                value={watch("addresses.0.status")}
                onValueChange={(value) => setValue("addresses.0.status", value)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>

        {!sameAsBilling && (
          <div className="mt-6 border-t border-primary/30 pt-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Shipping address</h3>
              <p className="text-sm text-slate-500">Used when delivering goods to a different location.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormField label="Address Line 1" required error={shippingAddressLine1Error}>
                  <Input
                    placeholder="Shipping street / building"
                    className="rounded-xl"
                    {...register("shippingAddress.addressLine1")}
                  />
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField label="Address Line 2" error={shippingAddressLine2Error}>
                  <Input
                    placeholder="Shipping area / landmark"
                    className="rounded-xl"
                    {...register("shippingAddress.addressLine2")}
                  />
                </FormField>
              </div>

              <FormField label="Landmark" error={((errors as any).shippingAddress?.landmark?.message as string | undefined)}>
                <Input
                  placeholder="Shipping landmark"
                  className="rounded-xl"
                  {...register("shippingAddress.landmark")}
                />
              </FormField>

              <FormField label="District" error={((errors as any).shippingAddress?.district?.message as string | undefined)}>
                <Input
                  placeholder="Shipping district"
                  className="rounded-xl"
                  {...register("shippingAddress.district")}
                />
              </FormField>

              <FormField label="Country" required error={shippingCountryError}>
                <Select
                    value={shippingCountryId}
                    onValueChange={(value) => {
                      setValue("shippingAddress.countryId", value);
                      setValue("shippingAddress.stateId", "");
                    }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="State" required error={shippingStateError}>
                <Select
                  value={shippingStateId}
                  onValueChange={(value) => setValue("shippingAddress.stateId", value)}
                  disabled={!shippingCountryId}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={shippingCountryId ? "Select state" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingStates.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="City" required error={shippingCityError}>
                <Input
                  placeholder="Bhubaneswar"
                  className="rounded-xl"
                  {...register("shippingAddress.cityId")}
                />
              </FormField>

              <FormField label="Pincode" required error={shippingPincodeError}>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="751024"
                  className="rounded-xl"
                  {...register("shippingAddress.pincode")}
                />
              </FormField>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
