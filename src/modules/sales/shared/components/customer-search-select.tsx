


"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Loader2,
  Search,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCustomer } from "@/modules/sales/shared/hooks/use-customer";
import type { Customer } from "@/modules/customers/types";

export interface CustomerAddress {
  addressLine1: string | null;
  addressLine2: string | null;
  /** Some APIs use line1 / line2 */
  line1?: string | null;
  line2?: string | null;
  city: string | null;
  state: string | null;
  stateCode?: string | null;
  pincode: string | null;
  country: string | null;
}

export interface SelectedCustomer {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  companyName: string | null;
  mobile: string | null;
  email: string | null;
  gstin: string | null;
  pan: string | null;
  billingAddress: CustomerAddress | null;
  shippingAddress: CustomerAddress | null;
}

interface CustomerSearchSelectProps {
  onSelect: (customer: SelectedCustomer | null) => void;
  /** Hide the built-in label when parent already shows "Customer *" */
  hideLabel?: boolean;
}


/** Read optional API fields without unsafe direct casts */
function asLoose(c: unknown): Record<string, unknown> {
  return (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
}

function strField(c: unknown, ...keys: string[]): string {
  const o = asLoose(c);
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function clean(value?: string | null) {
  return value?.trim() || "";
}

function getCustomerName(customer: Customer) {
  return (
    strField(customer, "name", "customerName", "companyName") ||
    String(customer.id)
  );
}

function getAddress(
  customer: Customer,
  type: "BILLING" | "SHIPPING",
): CustomerAddress | null {
  const raw = asLoose(customer).addresses;
  const addresses = Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : [];

  const match =
    addresses.find((item) => item.type === type && item.isDefault) ??
    addresses.find((item) => item.type === type);

  if (!match) return null;

  const line1 =
    (typeof match.line1 === "string" && match.line1) ||
    (typeof match.addressLine1 === "string" && match.addressLine1) ||
    null;
  const line2 =
    (typeof match.line2 === "string" && match.line2) ||
    (typeof match.addressLine2 === "string" && match.addressLine2) ||
    null;

  return {
    addressLine1: line1,
    addressLine2: line2,
    line1,
    line2,
    city: typeof match.city === "string" ? match.city : null,
    state: typeof match.state === "string" ? match.state : null,
    stateCode: typeof match.stateCode === "string" ? match.stateCode : null,
    pincode: typeof match.pincode === "string" ? match.pincode : null,
    country: typeof match.country === "string" ? match.country : null,
  };
}


function formatAddress(
  address: CustomerAddress | null,
) {
  if (!address) {
    return "";
  }

  return [
    (address.line1 ?? (address as { addressLine1?: string }).addressLine1),
    (address.line2 ?? (address as { addressLine2?: string }).addressLine2),
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]
    .map(clean)
    .filter(Boolean)
    .join(", ");
}

function getCompanyName(customer: Customer) {
  return strField(customer, "companyName");
}

function getPersonName(customer: Customer) {
  const name = getCustomerName(customer);
  const companyName = getCompanyName(customer);

  if (companyName && companyName !== name) {
    return name;
  }

  return "";
}

function getContactLine(
  customer: Customer | SelectedCustomer,
) {
  return [
    strField(customer, "gstin"),
    strField(customer, "pan"),
    strField(customer, "mobile"),
    strField(customer, "email"),
  ]
    .filter(Boolean)
    .join(" | ");
}

function getDisplayName(
  customer: Customer | SelectedCustomer,
) {
  return (
    strField(customer, "companyName") ||
    getCustomerName(customer as Customer)
  );
}

function getCustomerAddress(customer: Customer) {
  return formatAddress(
    getAddress(customer, "BILLING"),
  );
}

function getSelectedCustomerText(
  customer: SelectedCustomer,
) {
  return [
    customer.companyName,
    customer.name !== customer.companyName
      ? customer.name
      : null,
    customer.gstin,
    customer.pan,
    customer.mobile,
    customer.email,
    formatAddress(customer.billingAddress),
  ]
    .map(clean)
    .filter(Boolean)
    .join(" | ");
}

function CustomerDetails({
  customer,
}: {
  customer: Customer | SelectedCustomer;
}) {
  const displayName = getDisplayName(customer);

  const personName =
    "billingAddress" in customer
      ? clean(customer.name) !== displayName
        ? clean(customer.name)
        : ""
      : getPersonName(customer as Customer);

  const contactLine = getContactLine(customer);

  const address =
    "billingAddress" in customer
      ? formatAddress(customer.billingAddress)
      : getCustomerAddress(customer as Customer);

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold leading-5 text-slate-900">
        {displayName}
      </p>

      {personName && (
        <p className="truncate text-xs leading-5 text-slate-600">
          {personName}
        </p>
      )}

      {contactLine && (
        <p className="line-clamp-2 break-words text-xs leading-5 text-slate-600">
          {contactLine}
        </p>
      )}

      {address && (
        <p className="hidden text-xs leading-5 text-slate-500 md:line-clamp-2 md:block">
          {address}
        </p>
      )}
    </div>
  );
}

export default function CustomerSearchSelect({
  onSelect,
  hideLabel = false,
}: CustomerSearchSelectProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const {
    customers,
    loading: customersLoading,
  } = useCustomer();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState<SelectedCustomer | null>(null);

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  const matchingCustomers = useMemo(() => {
    const search = query.trim().toLowerCase();
    const list = customers ?? [];

    // Always return list for dropdown; filter only when user typed search text
    if (!search) return list;

    return list.filter((customer) => {
      const values = [
        strField(customer, "name", "customerName", "companyName"),
        strField(customer, "mobile", "phone"),
        strField(customer, "email"),
        strField(customer, "gstin"),
        strField(customer, "pan"),
      ];
      return values.some((value) => value.toLowerCase().includes(search));
    });
  }, [query, customers]);

  const selectCustomer = (
    customer: Customer,
  ) => {
    const selected: SelectedCustomer = {
      id: String(customer.id),

      tenantId: strField(customer, "tenantId", "businessId"),
      branchId: strField(customer, "branchId"),

      name: getCustomerName(customer),

      companyName:
        strField(customer, "companyName") ||
        null,

      mobile:
        strField(customer, "mobile") || null,

      email:
        strField(customer, "email") || null,

      gstin:
        strField(customer, "gstin") || null,

      pan:
        strField(customer, "pan") || null,

      billingAddress: getAddress(
        customer,
        "BILLING",
      ),

      shippingAddress: getAddress(
        customer,
        "SHIPPING",
      ),
    };

    setSelectedCustomer(selected);
    setQuery(getSelectedCustomerText(selected));
    setOpen(false);

    onSelect(selected);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setQuery("");
    setOpen(false);
    onSelect(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      {!hideLabel ? (
        <Label className="mb-2 block text-xs font-medium text-slate-600">
          Customer <span className="text-red-500">*</span>
        </Label>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400" />

        <Input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);

            if (selectedCustomer) {
              setSelectedCustomer(null);
              onSelect(null);
            }
          }}
          placeholder="Search customer"
          className="h-10 bg-white pl-9 pr-16"
        />

        <div className="absolute right-2 top-1/2 grid -translate-y-1/2 grid-cols-[auto_auto] items-center gap-1 bg-white">
          {query && (
            <button
              type="button"
              onClick={clearCustomer}
              className="grid size-7 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear customer"
            >
              <X className="size-4" />
            </button>
          )}

          <ChevronDown className="size-4 text-slate-400" />
        </div>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[360px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {customersLoading ? (
            <div className="grid grid-cols-[auto_1fr] items-center gap-2 px-3 py-3 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              <span>Loading customers...</span>
            </div>
          ) : matchingCustomers.length > 0 ? (
            <div className="grid">
              {matchingCustomers.map(
                (customer) => {
                  const isSelected =
                    selectedCustomer?.id ===
                    String(customer.id);

                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onClick={() =>
                        selectCustomer(customer)
                      }
                      className={`grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-slate-100 px-3 py-2.5 text-left last:border-b-0 ${
                        isSelected
                          ? "bg-slate-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <CustomerDetails
                        customer={customer}
                      />

                      {isSelected && (
                        <Check className="mt-1 size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                },
              )}
            </div>
          ) : (
            <div className="px-3 py-3 text-sm text-slate-500">
              No customer found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}





//how to use 
//========================
// "use client";

// import { useState } from "react";

// import CustomerSearchSelect, {
//   type SelectedCustomer,
// } from "@/modules/sales/shared/components/customer-search-select";

// export default function CustomerTestPage() {
//   const [selectedCustomer, setSelectedCustomer] =
//     useState<SelectedCustomer | null>(null);

//   return (
//         <CustomerSearchSelect
//           onSelect={setSelectedCustomer}
//         />

      
   
//   );
// }