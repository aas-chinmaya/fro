"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Download,
  Plus,
  Upload,
} from "lucide-react";
import VendorCard from "./VendorCard";
import VendorStats from "./VendorStats";
import VendorFilters from "./VendorFilters";
import Pagination from "@/components/data-table/Pagination";
import {
  Button,
} from "@/components/ui";
import { vendorApi } from "@/modules/vendor/api/vendor.api";
import {
  useVendorImportExport,
} from "@/modules/vendor/hooks/usevendor";
import { notify } from "@/lib/toast";
import type {
  Vendor,
  VendorAddress,
  VendorBank,
  VendorContact,
  VendorDocument,
} from "../types";
import {
  selectBusinessRecords,
} from "@/modules/business/store/businessSlice";
import {
  useAppSelector,
} from "@/store/hooks";

interface VendorListProps {
  vendors?: Vendor[];
}
const normalizeVendorStatus = (
  value?: string | null
): string => {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  switch (normalized) {
    case "ACTIVE":
      return "Active";

    case "INACTIVE":
      return "Inactive";

    case "BLOCKED":
      return "Blocked";

    default:
      return value?.trim() || "Active";
  }
};
const normalizeVendorType = (
  value?: string | null
): string => {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  switch (normalized) {
    case "SUPPLIER":
      return "Supplier";

    case "MANUFACTURER":
      return "Manufacturer";

    case "WHOLESALER":
      return "Wholesaler";

    case "SERVICE_PROVIDER":
      return "Service Provider";

    case "CONTRACTOR":
      return "Contractor";

    default:
      return value?.trim() || "Supplier";
  }
};
const toNumber = (
  value: unknown,
  fallback = 0
): number => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const getRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
};

const getString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const normalizeVendorData = (
  vendor: Vendor | Record<string, unknown>
): Vendor => {
  const vendorRecord = getRecord(vendor) ?? {};
  const contactRecord = getRecord(vendorRecord["contact"]);
  const addressRecord = getRecord(vendorRecord["address"]);
  const bankRecord = getRecord(vendorRecord["bank"]);

  const contact: VendorContact | null =
    contactRecord
      ? {
          id: getString(contactRecord["id"]),
          vendorId: getString(contactRecord["vendorId"] ?? vendorRecord["id"]),
          name: getString(contactRecord["name"] ?? contactRecord["contactPerson"]),
          designation: getString(contactRecord["designation"]),
          mobile: getString(contactRecord["mobile"]),
          email: getString(contactRecord["email"]),
          isPrimary: true,
        }
      : null;

  const contacts: VendorContact[] =
    contact
      ? [contact]
      : Array.isArray(vendorRecord["contacts"])
        ? (vendorRecord["contacts"] as VendorContact[])
        : [];

  const address: VendorAddress | null =
    addressRecord
      ? {
          id: getString(addressRecord["id"]),
          vendorId: getString(addressRecord["vendorId"] ?? vendorRecord["id"]),
          addressLine1: getString(addressRecord["addressLine1"] ?? addressRecord["billingAddressLine1"]),
          addressLine2: getString(addressRecord["addressLine2"] ?? addressRecord["billingAddressLine2"]),
          countryId: getString(addressRecord["countryId"] ?? addressRecord["billingCountry"]),
          stateId: getString(addressRecord["stateId"] ?? addressRecord["billingState"]),
          cityId: getString(addressRecord["cityId"] ?? addressRecord["billingCity"]),
          pincode: getString(addressRecord["pincode"] ?? addressRecord["billingPincode"]),
          isBilling: Boolean(addressRecord["isBilling"] ?? true),
          isShipping: Boolean(addressRecord["isShipping"] ?? addressRecord["isShippingSameAsBilling"] ?? true),
          status: getString(addressRecord["status"], "Active"),
        }
      : null;

  const addresses: VendorAddress[] =
    address
      ? [address]
      : Array.isArray(vendorRecord["addresses"])
        ? (vendorRecord["addresses"] as VendorAddress[])
        : [];

  const bank: VendorBank | null =
    bankRecord
      ? {
          id: getString(bankRecord["id"]),
          vendorId: getString(bankRecord["vendorId"] ?? vendorRecord["id"]),
          accountHolder: getString(bankRecord["accountHolder"] ?? bankRecord["accountHolderName"]),
          bankName: getString(bankRecord["bankName"]),
          accountNumber: getString(bankRecord["accountNumber"]),
          ifscCode: getString(bankRecord["ifscCode"] ?? bankRecord["ifsc"]),
          branch: getString(bankRecord["branch"]),
          upiId: getString(bankRecord["upiId"]),
          isPrimary: true,
        }
      : null;

  const banks: VendorBank[] =
    bank
      ? [bank]
      : Array.isArray(vendorRecord["banks"])
        ? (vendorRecord["banks"] as VendorBank[])
        : [];

  const documents: VendorDocument[] =
    Array.isArray(vendorRecord["documents"])
      ? (vendorRecord["documents"] as VendorDocument[])
      : [];

  const taxRecord = getRecord(vendorRecord["tax"]);
  const purchaseRecord = getRecord(vendorRecord["purchase"]);

  return {
    id: getString(vendorRecord["id"]),
    vendorCode: getString(vendorRecord["vendorCode"]),
    businessId: getString(vendorRecord["businessId"]),
    vendorType: normalizeVendorType(getString(vendorRecord["vendorType"])),
    vendorName: getString(vendorRecord["vendorName"]),
    gstin: getString(taxRecord?.["gstin"] ?? vendorRecord["gstin"]),
    pan: getString(taxRecord?.["pan"] ?? vendorRecord["pan"]),
    email: getString(contactRecord?.["email"] ?? vendorRecord["vendorEmail"] ?? vendorRecord["email"]),
    phone: getString(contactRecord?.["mobile"] ?? vendorRecord["vendorPhone"] ?? vendorRecord["phone"]),
    websiteLink: getString(contactRecord?.["website"] ?? vendorRecord["websiteLink"]),
    currencyId: getString(vendorRecord["currencyId"] ?? purchaseRecord?.["currencyId"]),
    currency: getString(purchaseRecord?.["currency"] ?? vendorRecord["currency"]),
    paymentTerm: getString(purchaseRecord?.["paymentTerms"] ?? vendorRecord["paymentTerm"] ?? vendorRecord["paymentTerms"]),
    paymentTerms: getString(purchaseRecord?.["paymentTerms"] ?? vendorRecord["paymentTerms"] ?? vendorRecord["paymentTerm"]),
    paymentMode: getString(purchaseRecord?.["paymentMode"] ?? vendorRecord["paymentMode"]),
    creditLimit: toNumber(purchaseRecord?.["creditLimit"] ?? vendorRecord["creditLimit"]),
    openingBalance: toNumber(purchaseRecord?.["openingBalance"] ?? vendorRecord["openingBalance"]),
    totalPurchase: toNumber(vendorRecord["totalPurchase"]),
    totalOrders: toNumber(vendorRecord["totalOrders"]),
    outstanding: toNumber(vendorRecord["outstanding"]),
    status: normalizeVendorStatus(getString(vendorRecord["status"])),
    logo: typeof vendorRecord["logo"] === "string" || vendorRecord["logo"] === null ? vendorRecord["logo"] : null,
    logoUrl: typeof vendorRecord["logoUrl"] === "string" ? vendorRecord["logoUrl"] : null,

    addresses,
    contacts,
    banks,
    documents,

    /* Compatibility fields */
    vendorId: getString(vendorRecord["vendorId"] ?? vendorRecord["id"]),

    name: getString(contact?.name),

    designation: getString(contact?.designation),

    mobile: getString(contact?.mobile),

    addressLine1:
      addresses[0]?.addressLine1 ??
      "",

    addressLine2:
      addresses[0]?.addressLine2 ??
      "",

    countryId:
      addresses[0]?.countryId ??
      "",

    stateId:
      addresses[0]?.stateId ??
      "",

    cityId:
      addresses[0]?.cityId ??
      "",

    pincode:
      addresses[0]?.pincode ??
      "",

    isBilling:
      addresses[0]?.isBilling ??
      false,

    isShipping:
      addresses[0]?.isShipping ??
      false,

    accountHolder:
      banks[0]?.accountHolder ??
      "",

    bankName:
      banks[0]?.bankName ??
      "",

    accountNumber:
      banks[0]?.accountNumber ??
      "",

    ifscCode:
      banks[0]?.ifscCode ??
      "",

    branch:
      banks[0]?.branch ??
      "",

    upiId:
      banks[0]?.upiId ??
      "",

    isPrimary:
      banks[0]?.isPrimary ??
      false,

    lastPurchaseDate:
      getString(purchaseRecord?.["lastPurchaseDate"] ?? vendorRecord["lastPurchaseDate"]),

    createdAt: getString(vendorRecord["createdAt"]),

    updatedAt: getString(vendorRecord["updatedAt"]),
  };
};
export default function VendorList({
  vendors: initialVendors,
}: VendorListProps) {
  const router = useRouter();

  const business =
    useAppSelector(
      selectBusinessRecords
    )[0];
  const user = useAppSelector((state) => state.auth.user);
const [search, setSearch] =
    useState("");
const [status, setStatus] =
    useState("all");
const [type, setType] =
    useState("all");
const [state, setState] =
    useState("all");
const [serverVendors, setServerVendors] =
    useState<Vendor[]>([]);
const [loading, setLoading] =
    useState(false);
const [error, setError] =
    useState<string | null>(null);
const [page, setPage] =
    useState(1);
const pageSize = 6;
const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );
const {
    exportVendors,
    downloadVendorTemplate,
    importVendors,
  } = useVendorImportExport();
  const loadVendors = useCallback(async (keyword = "") => {
    try {
      setLoading(true);
      setError(null);

      const response = await vendorApi.getAll({
        page: 1,
        limit: 50,
        search: keyword,
        role: user?.role,
        tenantId: business?.tenantId,
      });

      const items =
        response?.data?.data ?? [];

      const normalized: Vendor[] =
        Array.isArray(items)
          ? items.map((item) => normalizeVendorData(item as Record<string, unknown>))
          : [];

      setServerVendors(normalized);
    } catch (err: unknown) {
      console.error(
        "Failed to fetch vendors",
        err
      );

      const errorMessage =
        err && typeof err === "object" && "response" in err &&
          err.response && typeof err.response === "object" &&
          "data" in err.response &&
          err.response.data && typeof err.response.data === "object" &&
          "message" in err.response.data &&
          typeof err.response.data.message === "string"
          ? err.response.data.message
          : "Failed to load vendors";

      setError(errorMessage);
      setServerVendors([]);
    } finally {
      setLoading(false);
    }
  }, [business, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVendors(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [loadVendors, search]);
 const handleDeleteVendor = async (
    vendorId: string
  ) => {
    try {
      setLoading(true);

      await vendorApi.delete(
        vendorId
      );

      notify.success(
        "Vendor deleted successfully"
      );

      await loadVendors(
        search.trim()
      );
    } catch (err: unknown) {
      console.error(
        "Vendor delete failed",
        err
      );

      const errorMessage =
        err && typeof err === "object" && "response" in err &&
          err.response && typeof err.response === "object" &&
          "data" in err.response &&
          err.response.data && typeof err.response.data === "object" &&
          "message" in err.response.data &&
          typeof err.response.data.message === "string"
          ? err.response.data.message
          : "Failed to delete vendor";

      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
const handleToggleVendorStatus = async (
    vendor: Vendor
  ) => {
    const currentStatus =
      String(vendor.status ?? "")
        .trim()
        .toUpperCase();

    const nextStatus =
      currentStatus === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const previousVendors =
      serverVendors;

    setServerVendors(
      (prev) =>
        prev.map((item) =>
          item.id === vendor.id
            ? {
                ...item,
                status:
                  normalizeVendorStatus(
                    nextStatus
                  ),
              }
            : item
        )
    );

    try {
      setLoading(true);

      await vendorApi.changeStatus(
        vendor.id,
        nextStatus
      );

      notify.success(
        `Vendor status updated to ${
          nextStatus === "ACTIVE"
            ? "Active"
            : "Inactive"
        }`
      );
    } catch (err: unknown) {
      console.error(
        "Vendor status update failed",
        err
      );

      setServerVendors(
        previousVendors
      );

      const errorMessage =
        err && typeof err === "object" && "response" in err &&
          err.response && typeof err.response === "object" &&
          "data" in err.response &&
          err.response.data && typeof err.response.data === "object" &&
          "message" in err.response.data &&
          typeof err.response.data.message === "string"
          ? err.response.data.message
          : "Failed to update vendor status";

      notify.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
const downloadBlob = (
    blob: Blob,
    fallbackName: string
  ) => {
    const url =
      window.URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      fallbackName;

    document.body.appendChild(
      anchor
    );

    anchor.click();

    document.body.removeChild(
      anchor
    );

    window.URL.revokeObjectURL(
      url
    );
  };
 const handleExportVendors =
    async () => {
      const tenantId =
        business?.tenantId
          ? String(
              business.tenantId
            )
          : "";

      if (!tenantId) {
        notify.error(
          "Complete business onboarding before exporting vendors"
        );
        return;
      }

      try {
        const response =
          await exportVendors({
            page: 1,
            limit: 1000,
            tenantId,
          });

        const contentType =
          response?.headers?.[
            "content-type"
          ];

        const resolvedContentType =
          Array.isArray(
            contentType
          )
            ? contentType[0]
            : typeof contentType ===
                "string"
              ? contentType
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        const blob =
          response?.data instanceof
          Blob
            ? response.data
            : new Blob(
                [
                  response?.data ??
                    "",
                ],
                {
                  type:
                    resolvedContentType,
                }
              );

        downloadBlob(
          blob,
          "vendors-export.xlsx"
        );

        notify.success(
          "Vendor export downloaded"
        );
      } catch {
        notify.error(
          "Failed to export vendors"
        );
      }
    };
const handleDownloadTemplate =
    async () => {
      try {
        const response =
          await downloadVendorTemplate();

        const contentType =
          response?.headers?.[
            "content-type"
          ];

        const resolvedContentType =
          Array.isArray(
            contentType
          )
            ? contentType[0]
            : typeof contentType ===
                "string"
              ? contentType
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        const blob =
          response?.data instanceof
          Blob
            ? response.data
            : new Blob(
                [
                  response?.data ??
                    "",
                ],
                {
                  type:
                    resolvedContentType,
                }
              );

        downloadBlob(
          blob,
          "vendors-template.xlsx"
        );

        notify.success(
          "Vendor import template downloaded"
        );
      } catch {
        notify.error(
          "Failed to download vendor template"
        );
      }
    };
const handleImportSelected =
    async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      const tenantId =
        business?.tenantId
          ? String(
              business.tenantId
            )
          : "";

      if (!tenantId) {
        notify.error(
          "Complete business onboarding before importing vendors"
        );

        event.target.value = "";

        return;
      }

      try {
        await importVendors(
          file,
          {
            tenantId,
          }
        );

        notify.success(
          "Vendor import completed"
        );

        await loadVendors(
          search.trim()
        );
      } catch {
        notify.error(
          "Failed to import vendors"
        );
      } finally {
        event.target.value = "";
      }
    };
const vendorSource =
    useMemo(() => {
      if (
        Array.isArray(
          initialVendors
        ) &&
        initialVendors.length > 0
      ) {
        return initialVendors.map(
          normalizeVendorData
        );
      }

      return serverVendors;
    }, [
      initialVendors,
      serverVendors,
    ]);

  const filteredVendors =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return vendorSource.filter(
        (vendor) => {
          const firstContact =
            vendor.contacts?.[0];

          const firstAddress =
            vendor.addresses?.[0];

          const matchesSearch =
            !searchValue ||
            [
              vendor.vendorName,
              vendor.vendorCode,
              firstContact?.name,
              firstContact?.mobile,
              vendor.phone,
              vendor.email,
              firstAddress?.cityId,
              firstAddress?.stateId,
              vendor.gstin,
              vendor.pan,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(
                searchValue
              );

       const matchesStatus =
            status === "all" ||
            vendor.status ===
              status;

          const matchesType =
            type === "all" ||
            vendor.vendorType ===
              type;

          const matchesState =
            state === "all" ||
            firstAddress?.stateId ===
              state;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType &&
            matchesState
          );
        }
      );
    }, [
      vendorSource,
      search,
      status,
      type,
      state,
    ]);

  /* ---------------------------------------------------------------------- */
  /* Pagination                                                              */
  /* ---------------------------------------------------------------------- */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredVendors.length /
          pageSize
      )
    );

  const safePage =
    Math.min(page, totalPages);

  const pagedVendors =
    useMemo(() => {
      const start =
        (safePage - 1) *
        pageSize;

      return filteredVendors.slice(
        start,
        start + pageSize
      );
    }, [
      filteredVendors,
      safePage,
    ]);

  /* ---------------------------------------------------------------------- */
  /* Statistics                                                              */
  /* ---------------------------------------------------------------------- */

  const totalOutstanding =
    filteredVendors.reduce(
      (sum, vendor) =>
        sum +
        toNumber(
          vendor.outstanding
        ),
      0
    );

  const totalPurchase =
    filteredVendors.reduce(
      (sum, vendor) =>
        sum +
        toNumber(
          vendor.totalPurchase
        ),
      0
    );

  const activeVendors =
    filteredVendors.filter(
      (vendor) =>
        String(
          vendor.status
        ).toUpperCase() ===
        "ACTIVE"
    ).length;

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="rounded-xl border-b border-slate-200/70 bg-white px-5 py-6 sm:px-7 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/50">
              <Building2
                size={26}
                className="text-primary"
              />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
                Vendor Management
              </h1>

              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Manage suppliers,
                distributors,
                manufacturers,
                and service
                providers in one
                workspace.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 bg-white px-4 py-2 text-slate-600 hover:bg-slate-50"
              onClick={
                handleExportVendors
              }
            >
              <Download
                size={16}
                className="mr-2"
              />
              Export
            </Button>

            <Button
              variant="outline"
              className="rounded-xl border-slate-200 bg-white px-4 py-2 text-slate-600 hover:bg-slate-50"
              onClick={
                handleDownloadTemplate
              }
            >
              <Download
                size={16}
                className="mr-2"
              />
              Download Template
            </Button>

            <Button
              variant="outline"
              className="rounded-xl border-slate-200 bg-white px-4 py-2 text-slate-600 hover:bg-slate-50"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <Upload
                size={16}
                className="mr-2"
              />
              Import
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={
                handleImportSelected
              }
            />

            <Button
              className="gap-2 rounded-xl px-4 py-2 text-white shadow-sm"
              onClick={() =>
                router.push(
                  "/vendors/create"
                )
              }
            >
              <Plus size={17} />
              Add Vendor
            </Button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="py-6">
        {/* Stats */}
        <VendorStats
          totalVendors={
            filteredVendors.length
          }
          activeVendors={
            activeVendors
          }
          totalPurchase={
            totalPurchase
          }
          outstanding={
            totalOutstanding
          }
        />

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <VendorFilters
            search={search}
            onSearchChange={
              setSearch
            }
            status={status}
            onStatusChange={
              setStatus
            }
            type={type}
            onTypeChange={
              setType
            }
            state={state}
            onStateChange={
              setState
            }
            clearFilters={() => {
              setSearch("");
              setStatus("all");
              setType("all");
              setState("all");
            }}
          />
        </div>

        {/* Section Header */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Vendors
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {filteredVendors.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {vendorSource.length}
              </span>{" "}
              vendors
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-xl border-slate-200 bg-white px-4 py-2 text-slate-600 hover:bg-slate-50"
            onClick={() =>
              loadVendors(
                search.trim()
              )
            }
          >
            Refresh
          </Button>
        </div>

        {/* Cards */}
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {loading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center xl:col-span-2">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

              <p className="text-sm text-slate-500">
                Loading vendors...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center xl:col-span-2">
              <p className="text-sm text-slate-600">
                {error}
              </p>

              <Button
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={() =>
                  loadVendors(
                    search.trim()
                  )
                }
              >
                Try Again
              </Button>
            </div>
          ) : filteredVendors.length ===
            0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center xl:col-span-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/50">
                <Building2
                  size={30}
                  className="text-primary"
                />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-slate-800">
                No Vendors Found
              </h3>

              <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                No vendors match your
                current filters. Try
                adjusting the filters
                or create a new vendor.
              </p>

              <Button
                className="mt-5 gap-2 rounded-xl px-4 py-2 text-white"
                onClick={() =>
                  router.push(
                    "/vendors/create"
                  )
                }
              >
                <Plus size={17} />
                Add Vendor
              </Button>
            </div>
          ) : (
            pagedVendors.map(
              (vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onView={() =>
                    router.push(
                      `/vendors/${vendor.id}`
                    )
                  }
                  onEdit={() =>
                    router.push(
                      `/vendors/${vendor.id}/edit`
                    )
                  }
                  onToggleStatus={() =>
                    handleToggleVendorStatus(
                      vendor
                    )
                  }
                  onPurchase={() =>
                    router.push(
                      `/purchase/new?vendor=${vendor.id}`
                    )
                  }
                  onPayment={() =>
                    router.push(
                      `/payments/new?vendor=${vendor.id}`
                    )
                  }
                  onDelete={() =>
                    handleDeleteVendor(
                      vendor.id
                    )
                  }
                />
              )
            )
          )}
        </div>

        {/* Pagination */}
        {filteredVendors.length >
          0 &&
          totalPages > 1 && (
            <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm">
              <Pagination
                page={safePage}
                totalPages={
                  totalPages
                }
                totalRecords={
                  filteredVendors.length
                }
                pageSize={
                  pageSize
                }
                onPageChange={
                  setPage
                }
              />
            </div>
          )}
      </div>
    </div>
  );
}







