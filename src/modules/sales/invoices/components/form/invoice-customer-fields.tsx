"use client";

import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

type CustomerAddress = {
  id?: string;
  type?: string;
  label?: string | null;
  contactPerson?: string | null;
  contactNumber?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  line1?: string | null;
  line2?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  stateCode?: string | null;
  pincode?: string | null;
  country?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
};

function activeAddresses(list?: CustomerAddress[] | null): CustomerAddress[] {
  if (!Array.isArray(list)) return [];
  return list.filter((a) => a && a.isActive !== false);
}

function addressLabel(a: CustomerAddress, index: number): string {
  const parts = [
    a.label,
    a.addressLine1 || a.line1,
    a.city,
    a.state,
    a.pincode,
  ].filter(Boolean);
  const base = parts.join(", ") || `Address ${index + 1}`;
  const type = String(a.type || "").toUpperCase();
  return type ? `${base} (${type})` : base;
}

function resolveState(raw?: string | null, code?: string | null) {
  if (!raw && !code) return { label: "", code: "" };
  const match = STATES.find(
    (s) =>
      (raw &&
        (s.label.toLowerCase() === String(raw).toLowerCase() ||
          s.value === String(raw).toLowerCase())) ||
      (code && s.code === String(code)),
  );
  if (match) return { label: match.label, code: match.code };
  return { label: String(raw || ""), code: String(code || "") };
}

type SetVal = (
  name: keyof InvoiceFormValues | string,
  value: unknown,
  opts?: { shouldDirty?: boolean; shouldValidate?: boolean },
) => void;

function applyAddress(
  setValue: SetVal,
  prefix: "billing" | "shipping",
  a: CustomerAddress | null | undefined,
  setPlaceOfSupply: boolean,
) {
  if (!a) return;
  const line1 = a.addressLine1 || a.line1 || "";
  const line2 = a.addressLine2 || a.line2 || "";
  const st = resolveState(a.state, a.stateCode);

  if (prefix === "billing") {
    setValue("billingAddressLine1", line1, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("billingAddressLine2", line2 || "", { shouldDirty: true });
    setValue("billingCity", a.city || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("billingPincode", a.pincode || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("billingCountry", a.country || "India", { shouldDirty: true });
    setValue("billingState", st.label, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("billingStateCode", st.code, { shouldDirty: true });
    if (setPlaceOfSupply) {
      setValue("placeOfSupply", st.label, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("placeOfSupplyCode", st.code, { shouldDirty: true });
    }
  } else {
    setValue("shippingAddressLine1", line1, { shouldDirty: true });
    setValue("shippingAddressLine2", line2 || "", { shouldDirty: true });
    setValue("shippingCity", a.city || "", { shouldDirty: true });
    setValue("shippingPincode", a.pincode || "", { shouldDirty: true });
    setValue("shippingCountry", a.country || "India", { shouldDirty: true });
    setValue("shippingState", st.label, { shouldDirty: true });
    setValue("shippingStateCode", st.code, { shouldDirty: true });
  }
}

/**
 * Customer identity from select only (read-only after select).
 * Billing: from customer addresses (picker if 2+).
 * Shipping: same as billing, OR another customer address, OR type custom.
 */
export function InvoiceCustomerFields() {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const customerId = useWatch({ control, name: "customerId" });
  const buyerName = useWatch({ control, name: "buyerName" }) ?? "";
  const buyerCompanyName = useWatch({ control, name: "buyerCompanyName" }) ?? "";
  const buyerPhone = useWatch({ control, name: "buyerPhone" }) ?? "";
  const buyerEmail = useWatch({ control, name: "buyerEmail" }) ?? "";
  const buyerGSTIN = useWatch({ control, name: "buyerGSTIN" }) ?? "";
  const buyerPAN = useWatch({ control, name: "buyerPAN" }) ?? "";
  const buyerType = useWatch({ control, name: "buyerType" }) ?? "";
  const billingState = useWatch({ control, name: "billingState" }) ?? "";
  const placeOfSupply = useWatch({ control, name: "placeOfSupply" }) ?? "";
  const reverseCharge = useWatch({ control, name: "reverseCharge" }) ?? false;
  const sameAsBilling = useWatch({ control, name: "sameAsBilling" }) ?? true;
  const shippingState = useWatch({ control, name: "shippingState" }) ?? "";

  const [addressList, setAddressList] = useState<CustomerAddress[]>([]);
  const [billingAddrId, setBillingAddrId] = useState<string>("");
  const [shippingAddrId, setShippingAddrId] = useState<string>("");
  const [customShipping, setCustomShipping] = useState(false);

  const err = (key: keyof InvoiceFormValues) =>
    (errors[key]?.message as string | undefined) || undefined;

  const stateValue = (raw: string) =>
    STATES.find(
      (s) =>
        s.label.toLowerCase() === String(raw).toLowerCase() ||
        s.value === String(raw).toLowerCase(),
    )?.value ?? "";

  const clearShipping = () => {
    setValue("shippingAddressLine1", "", { shouldDirty: true });
    setValue("shippingAddressLine2", "", { shouldDirty: true });
    setValue("shippingCity", "", { shouldDirty: true });
    setValue("shippingState", "", { shouldDirty: true });
    setValue("shippingStateCode", "", { shouldDirty: true });
    setValue("shippingPincode", "", { shouldDirty: true });
    setValue("shippingCountry", "", { shouldDirty: true });
    setShippingAddrId("");
    setCustomShipping(false);
  };

  const clearCustomerFields = () => {
    setValue("customerId", null, { shouldDirty: true });
    setValue("buyerName", "", { shouldDirty: true, shouldValidate: true });
    setValue("buyerCompanyName", "", { shouldDirty: true });
    setValue("buyerPhone", "", { shouldDirty: true, shouldValidate: true });
    setValue("buyerEmail", null, { shouldDirty: true });
    setValue("buyerGSTIN", "", { shouldDirty: true });
    setValue("buyerPAN", "", { shouldDirty: true });
    setValue("buyerType", "REGISTERED", { shouldDirty: true });
    setValue("buyerContactPerson", "", { shouldDirty: true });
    setValue("billingAddressLine1", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("billingAddressLine2", "", { shouldDirty: true });
    setValue("billingCity", "", { shouldDirty: true, shouldValidate: true });
    setValue("billingPincode", "", { shouldDirty: true, shouldValidate: true });
    setValue("billingCountry", "India", { shouldDirty: true });
    setValue("billingState", "", { shouldDirty: true, shouldValidate: true });
    setValue("billingStateCode", "", { shouldDirty: true });
    setValue("placeOfSupply", "", { shouldDirty: true, shouldValidate: true });
    setValue("placeOfSupplyCode", "", { shouldDirty: true });
    setValue("sameAsBilling", true, { shouldDirty: true });
    clearShipping();
    setAddressList([]);
    setBillingAddrId("");
  };

  const fillFromCustomer = (c: SelectedCustomer | null) => {
    if (!c) {
      clearCustomerFields();
      return;
    }

    setValue("customerId", c.id || null, { shouldDirty: true });
    setValue("buyerName", c.name || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("buyerCompanyName", c.companyName || "", { shouldDirty: true });
    setValue("buyerPhone", c.mobile || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("buyerEmail", c.email || null, { shouldDirty: true });
    setValue("buyerGSTIN", c.gstin || "", { shouldDirty: true });
    setValue("buyerPAN", c.pan || "", { shouldDirty: true });

    const cAny = c as SelectedCustomer & {
      customerType?: string;
      type?: string;
      contactPerson?: string;
      buyerType?: string;
      addresses?: CustomerAddress[];
    };
    const explicitType = String(
      cAny.buyerType || cAny.customerType || cAny.type || "",
    )
      .trim()
      .toUpperCase();
    setValue(
      "buyerType",
      explicitType || (c.gstin ? "REGISTERED" : "UNREGISTERED"),
      { shouldDirty: true },
    );
    setValue("buyerContactPerson", cAny.contactPerson || c.name || "", {
      shouldDirty: true,
    });

    // Build address list from:
    // 1) full addresses[] if select passes it
    // 2) else billingAddress + shippingAddress from CustomerSearchSelect
    let addrs = activeAddresses(cAny.addresses);
    if (!addrs.length) {
      const list: CustomerAddress[] = [];
      const bill = c.billingAddress as CustomerAddress | null | undefined;
      const ship = c.shippingAddress as CustomerAddress | null | undefined;
      if (bill) {
        list.push({
          ...bill,
          id: (bill as { id?: string }).id || "billing",
          type: (bill as { type?: string }).type || "BILLING",
          isDefault: true,
          isActive: true,
        });
      }
      if (ship) {
        const same =
          bill &&
          (bill.addressLine1 || bill.line1) === (ship.addressLine1 || ship.line1) &&
          bill.pincode === ship.pincode;
        if (!same) {
          list.push({
            ...ship,
            id: (ship as { id?: string }).id || "shipping",
            type: (ship as { type?: string }).type || "SHIPPING",
            isDefault: true,
            isActive: true,
          });
        }
      }
      addrs = list;
    }

    // Dedupe
    const seen = new Set<string>();
    addrs = addrs.filter((a) => {
      const key = a.id || `${a.addressLine1 || a.line1}|${a.pincode}|${a.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setAddressList(addrs);

    if (addrs.length === 0) {
      setValue("sameAsBilling", true, { shouldDirty: true });
      clearShipping();
      setBillingAddrId("");
      return;
    }

    const billingOnes = addrs.filter(
      (a) => String(a.type || "").toUpperCase() === "BILLING",
    );
    const sorted = [...(billingOnes.length ? billingOnes : addrs)].sort(
      (a, b) => Number(!!b.isDefault) - Number(!!a.isDefault),
    );
    const billing = sorted[0];
    setBillingAddrId(billing.id || "0");
    applyAddress(setValue as SetVal, "billing", billing, true);

    setValue("sameAsBilling", true, { shouldDirty: true });
    clearShipping();
  };

  const onPickBillingAddress = (id: string) => {
    setBillingAddrId(id);
    const a =
      addressList.find((x) => (x.id || "") === id) ||
      addressList[Number(id)] ||
      null;
    applyAddress(setValue as SetVal, "billing", a, true);
    if (sameAsBilling) clearShipping();
  };

  const onPickShippingSource = (id: string) => {
    if (id === "billing") {
      setValue("sameAsBilling", true, { shouldDirty: true });
      clearShipping();
      return;
    }
    if (id === "custom") {
      setValue("sameAsBilling", false, { shouldDirty: true });
      setCustomShipping(true);
      setShippingAddrId("custom");
      setValue("shippingAddressLine1", "", { shouldDirty: true });
      setValue("shippingAddressLine2", "", { shouldDirty: true });
      setValue("shippingCity", "", { shouldDirty: true });
      setValue("shippingState", "", { shouldDirty: true });
      setValue("shippingStateCode", "", { shouldDirty: true });
      setValue("shippingPincode", "", { shouldDirty: true });
      setValue("shippingCountry", "India", { shouldDirty: true });
      return;
    }
    setCustomShipping(false);
    setShippingAddrId(id);
    setValue("sameAsBilling", false, { shouldDirty: true });
    const a =
      addressList.find((x) => (x.id || "") === id) ||
      addressList[Number(id)] ||
      null;
    applyAddress(setValue as SetVal, "shipping", a, false);
  };

  const onSameAsBillingChange = (checked: boolean) => {
    setValue("sameAsBilling", checked, { shouldDirty: true });
    if (checked) {
      clearShipping();
      return;
    }
    if (addressList.length >= 1) {
      // Prefer SHIPPING type different from current billing
      const shippingOnes = addressList.filter(
        (x) =>
          String(x.type || "").toUpperCase() === "SHIPPING" &&
          (x.id || "") !== billingAddrId,
      );
      const other =
        shippingOnes[0] ||
        addressList.find((x) => (x.id || "") !== billingAddrId) ||
        null;
      if (other) {
        const id = other.id || "1";
        setShippingAddrId(id);
        setCustomShipping(false);
        applyAddress(setValue as SetVal, "shipping", other, false);
        return;
      }
    }
    setCustomShipping(true);
    setShippingAddrId("custom");
    setValue("shippingCountry", "India", { shouldDirty: true });
  };

  const showBillingPicker = addressList.length > 1;

  const addressOptions = useMemo(
    () =>
      addressList.map((a, i) => ({
        id: a.id || String(i),
        label: addressLabel(a, i),
      })),
    [addressList],
  );

  return (
    <div className="space-y-3">
      <CustomerSearchSelect onSelect={fillFromCustomer} />
      {err("customerId") ? (
        <p className="text-[11px] text-red-600">{err("customerId")}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-slate-600">
            Customer name <span className="text-red-500">*</span>
          </Label>
          <Input
            className="h-9 bg-slate-50"
            value={buyerName}
            readOnly
            tabIndex={-1}
            placeholder="Select a customer"
          />
          {err("buyerName") ? (
            <p className="text-[11px] text-red-600">{err("buyerName")}</p>
          ) : null}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs text-slate-600">Company name</Label>
          <Input
            className="h-9 bg-slate-50"
            value={buyerCompanyName}
            readOnly
            tabIndex={-1}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">
            Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            className="h-9 bg-slate-50"
            value={buyerPhone}
            readOnly
            tabIndex={-1}
          />
          {err("buyerPhone") ? (
            <p className="text-[11px] text-red-600">{err("buyerPhone")}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Email</Label>
          <Input
            className="h-9 bg-slate-50"
            value={buyerEmail || ""}
            readOnly
            tabIndex={-1}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">GSTIN</Label>
          <Input
            className="h-9 bg-slate-50"
            value={buyerGSTIN}
            readOnly
            tabIndex={-1}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">PAN</Label>
          <Input
            className="h-9 bg-slate-50"
            value={buyerPAN}
            readOnly
            tabIndex={-1}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Buyer type</Label>
          <Input
            className="h-9 bg-slate-50"
            value={buyerType || "—"}
            readOnly
            tabIndex={-1}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Contact person</Label>
          <Input
            className="h-9"
            maxLength={120}
            placeholder="Optional"
            {...register("buyerContactPerson")}
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-medium text-slate-700">
          Billing address
        </p>

        {showBillingPicker ? (
          <div className="mb-3 space-y-1">
            <Label className="text-xs text-slate-600">
              Choose billing address
            </Label>
            <Select value={billingAddrId} onValueChange={onPickBillingAddress}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select billing address" />
              </SelectTrigger>
              <SelectContent>
                {addressOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs text-slate-600">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-9 bg-slate-50"
              readOnly
              tabIndex={-1}
              {...register("billingAddressLine1")}
            />
            {err("billingAddressLine1") ? (
              <p className="text-[11px] text-red-600">
                {err("billingAddressLine1")}
              </p>
            ) : null}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs text-slate-600">Address line 2</Label>
            <Input
              className="h-9 bg-slate-50"
              readOnly
              tabIndex={-1}
              {...register("billingAddressLine2")}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-600">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-9 bg-slate-50"
              readOnly
              tabIndex={-1}
              {...register("billingCity")}
            />
            {err("billingCity") ? (
              <p className="text-[11px] text-red-600">{err("billingCity")}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-600">
              Pincode <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-9 bg-slate-50"
              readOnly
              tabIndex={-1}
              {...register("billingPincode")}
            />
            {err("billingPincode") ? (
              <p className="text-[11px] text-red-600">{err("billingPincode")}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-600">
              State / UT <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-9 bg-slate-50"
              value={billingState}
              readOnly
              tabIndex={-1}
            />
            {err("billingState") ? (
              <p className="text-[11px] text-red-600">{err("billingState")}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-600">
              Country <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-9 bg-slate-50"
              readOnly
              tabIndex={-1}
              {...register("billingCountry")}
            />
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
                setValue("placeOfSupply", s.label, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
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
            {err("placeOfSupply") ? (
              <p className="text-[11px] text-red-600">{err("placeOfSupply")}</p>
            ) : null}
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

      <div className="border-t border-slate-100 pt-3">
        <div className="mb-2 flex items-center gap-2">
          <Checkbox
            id="sameAsBilling"
            checked={!!sameAsBilling}
            onCheckedChange={(v) => onSameAsBillingChange(v === true)}
          />
          <Label
            htmlFor="sameAsBilling"
            className="cursor-pointer text-xs font-medium text-slate-700"
          >
            Shipping address same as billing
          </Label>
        </div>

        {!sameAsBilling ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Shipping source</Label>
              <Select
                value={customShipping ? "custom" : shippingAddrId || "billing"}
                onValueChange={onPickShippingSource}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Choose shipping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Same as billing</SelectItem>
                  {addressOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">
                    Other address (type manually)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs text-slate-600">Ship address</Label>
                <Input
                  className={`h-9 ${customShipping ? "" : "bg-slate-50"}`}
                  maxLength={300}
                  readOnly={!customShipping}
                  tabIndex={customShipping ? 0 : -1}
                  {...register("shippingAddressLine1")}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs text-slate-600">
                  Ship address line 2
                </Label>
                <Input
                  className={`h-9 ${customShipping ? "" : "bg-slate-50"}`}
                  maxLength={300}
                  readOnly={!customShipping}
                  tabIndex={customShipping ? 0 : -1}
                  {...register("shippingAddressLine2")}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Ship city</Label>
                <Input
                  className={`h-9 ${customShipping ? "" : "bg-slate-50"}`}
                  maxLength={100}
                  readOnly={!customShipping}
                  tabIndex={customShipping ? 0 : -1}
                  {...register("shippingCity")}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Ship pincode</Label>
                <Input
                  className={`h-9 ${customShipping ? "" : "bg-slate-50"}`}
                  maxLength={6}
                  inputMode="numeric"
                  readOnly={!customShipping}
                  tabIndex={customShipping ? 0 : -1}
                  {...register("shippingPincode")}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Ship state</Label>
                {customShipping ? (
                  <Select
                    value={stateValue(shippingState)}
                    onValueChange={(v) => {
                      const s = STATES.find((x) => x.value === v);
                      if (!s) return;
                      setValue("shippingState", s.label, { shouldDirty: true });
                      setValue("shippingStateCode", s.code, {
                        shouldDirty: true,
                      });
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
                ) : (
                  <Input
                    className="h-9 bg-slate-50"
                    value={shippingState}
                    readOnly
                    tabIndex={-1}
                  />
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-600">Ship country</Label>
                <Input
                  className={`h-9 ${customShipping ? "" : "bg-slate-50"}`}
                  maxLength={100}
                  readOnly={!customShipping}
                  tabIndex={customShipping ? 0 : -1}
                  {...register("shippingCountry")}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <input type="hidden" {...register("customerId")} />
      <input type="hidden" {...register("billingState")} />
      <input type="hidden" {...register("billingStateCode")} />
      <input type="hidden" {...register("shippingState")} />
      <input type="hidden" {...register("shippingStateCode")} />
    </div>
  );
}
