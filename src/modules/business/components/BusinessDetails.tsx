"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  Landmark,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Store,
  User,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge, Button, Card, Separator } from "@/components/ui";
import { cn } from "@/components/ui/utils";
import { buildDashboardStats } from "@/config/dashboard";
import { businessApi } from "@/modules/business/api/business.api";
import { useMasterData } from "@/modules/business/setup/hooks/useMasterData";
import {
  businessTypes as masterBusinessTypes,
  countries as masterCountries,
  states as masterStates,
  cities as masterCities,
} from "@/modules/business/setup/data/masterData";

function getBusinessPayload(response: any) {
  if (!response || typeof response !== "object") return null;

  if ("data" in response && response.data && typeof response.data === "object") {
    return response.data;
  }

  return response;
}

const nameOf = (list: { id: string; name: string }[], id?: string) =>
  (id && list.find((item) => item.id === id)?.name) || id || "-";

const displayValue = (value?: string | null) =>
  value && value.trim() ? value : "-";

const locationLabel = (address?: { country?: string; state?: string; city?: string }) => {
  if (!address) return "-";

  const country = nameOf(masterCountries, address.country);
  const state = nameOf(masterStates, address.state);
  const city = nameOf(masterCities, address.city);

  return [city, state, country].filter((value) => value && value !== "-").join(", ") || "-";
};

const isActive = (status?: string) =>
  String(status ?? "").toUpperCase() === "ACTIVE";

function StatusBadge({ status }: { status?: string }) {
  return (
    <Badge
      variant="secondary"
      className="gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {isActive(status) ? "Active" : displayValue(status)}
    </Badge>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-border bg-white shadow-sm", className)}>
      <div className="border-b border-border bg-primary/[0.035] px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-text sm:text-base">{title}</h2>
              {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
            </div>
          </div>
          {action}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  href,
  mono = false,
  className,
}: {
  icon?: React.ElementType;
  label: string;
  value?: string | null;
  href?: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-xl border border-border bg-white px-3.5 py-3", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-muted">{label}</p>
          {href && value ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className={cn("mt-1 block truncate text-sm font-medium text-text transition hover:text-primary", mono && "font-mono")}
            >
              {value}
            </a>
          ) : (
            <p className={cn("mt-1 break-words text-sm font-medium text-text", mono && "font-mono", !value && "text-muted")}>
              {displayValue(value)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-10 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>
    </div>
  );
}

interface BusinessDetailsProps {
  businessId?: string | null;
  mode?: "dashboard" | "view";
}

export default function BusinessDetails({ businessId, mode = "dashboard" }: BusinessDetailsProps) {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(businessId));
  const [logoFailed, setLogoFailed] = useState(false);

  const { businessCategories, businessSubCategories, industries, currencies, registrationTypes, licenseTypes } = useMasterData();

  useEffect(() => {
    if (!businessId) {
      setBusiness(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    businessApi
      .getBusinessById(businessId)
      .then((res) => {
        const payload = getBusinessPayload(res.data);
        if (mounted) {
          setBusiness(payload);
          setLogoFailed(false);
        }
      })
      .catch(() => {
        if (mounted) setBusiness(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [businessId]);

  const primaryAddress = useMemo(() => {
    if (!business?.addresses?.length) return undefined;
    return business.addresses.find((address: any) => address.isPrimary) ?? business.addresses[0];
  }, [business]);

  const allAddresses = useMemo(() => {
    if (!business?.addresses?.length) return [];
    const others = business.addresses.filter((address: any) => address !== primaryAddress);
    return [primaryAddress, ...others].filter(Boolean);
  }, [business, primaryAddress]);

  const businessName = business?.displayName || business?.legalName || "Business";
  const businessType = nameOf(masterBusinessTypes, business?.businessType);
  const primaryLocation = locationLabel(primaryAddress);

  const summaryStats = useMemo(() => buildDashboardStats(business), [business]);
  const metricIcons = [Store, Wallet, FileText, Landmark];

  if (!businessId) {
    return (
      <div className="min-h-full bg-primary/[0.045] px-4 py-8">
        <div className="mx-auto">
          <EmptyState icon={Building2} title="Business ID is missing" description="Open this page with a valid business id in the URL." />
        </div>
      </div>
    );
  }

  if (loading) {
    return mode === "view" ? (
      <div className="min-h-full bg-primary/[0.045] px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-5">
          <div className="h-8 w-48 rounded-lg bg-muted/60" />
          <div className="h-56 rounded-2xl bg-muted/60" />
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="h-64 rounded-2xl bg-muted/60 xl:col-span-2" />
            <div className="h-64 rounded-2xl bg-muted/60" />
          </div>
          <div className="h-48 rounded-2xl bg-muted/60" />
          <div className="h-56 rounded-2xl bg-muted/60" />
        </div>
      </div>
    ) : (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!business) {
    return mode === "view" ? (
      <div className="min-h-full bg-primary/[0.045] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto space-y-5">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <EmptyState icon={Building2} title="Business not found" description="The business could not be loaded. Please go back and try again." />
        </div>
      </div>
    ) : (
      <Card className="p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Building2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">No business selected</h2>
        <p className="mt-2 text-sm text-slate-500">Open a business from the list and the dashboard will load that business information here.</p>
      </Card>
    );
  }

  if (mode === "view") {
    return (
      <div className="mx-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => router.back()} className="group inline-flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm font-medium text-muted transition hover:text-primary">
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Back to Businesses
          </button>

          <Button size="sm" className="gap-2 rounded-lg shadow-sm" onClick={() => router.push(`/business-setup/manage-business/edit?id=${business.id}`)}>
            <Pencil className="h-4 w-4" />
            Edit Business
          </Button>
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="h-1.5 bg-primary" />
          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-primary/[0.045] sm:h-24 sm:w-24">
                  {business.logo && !logoFailed ? (
                    <img src={business.logo} alt={`${businessName} logo`} className="h-full w-full object-cover" onError={() => setLogoFailed(true)} />
                  ) : (
                    <Building2 className="h-9 w-9 text-primary" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="max-w-3xl break-words text-2xl font-bold tracking-tight text-text sm:text-3xl">{businessName}</h1>
                    <StatusBadge status={business.status} />
                  </div>

                  <p className="mt-1.5 text-sm text-muted">
                    {displayValue(business.legalName)}
                    {business.tradeName ? ` · ${business.tradeName}` : ""}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {businessType !== "-" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-primary/[0.045] px-2.5 py-1 text-[11px] font-medium text-muted">
                        <Store className="h-3.5 w-3.5" />
                        {businessType}
                      </span>
                    )}

                    {business.tenantId && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-primary/[0.045] px-2.5 py-1 text-[11px] font-medium text-muted">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Tenant: {business.tenantId}
                      </span>
                    )}

                    {primaryLocation !== "-" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-primary/[0.045] px-2.5 py-1 text-[11px] font-medium text-muted">
                        <MapPin className="h-3.5 w-3.5" />
                        {primaryLocation}
                      </span>
                    )}
                  </div>

                  {business.description && <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">{business.description}</p>}
                </div>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto lg:grid-cols-2">
                {[
                  { label: "Branches", value: business.branches?.length ?? 0 },
                  { label: "Addresses", value: business.addresses?.length ?? 0 },
                  { label: "Banks", value: business.banks?.length ?? 0 },
                  { label: "Documents", value: business.documents?.length ?? 0 },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-primary/[0.045] px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{item.label}</p>
                    <p className="mt-1 text-lg font-bold text-text">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
          <SectionCard icon={Phone} title="Contact Information" description="Primary communication details" className="xl:col-span-2">
            <div className="grid grid-cols-1 gap-3">
              <DetailItem icon={Phone} label="Phone" value={business.phone} href={business.phone ? `tel:${business.phone}` : undefined} />
              <DetailItem icon={Mail} label="Email" value={business.email} href={business.email ? `mailto:${business.email}` : undefined} />
              <DetailItem icon={Globe} label="Website" value={business.websiteLink} href={business.websiteLink || undefined} />
            </div>
          </SectionCard>

          <SectionCard icon={ShieldCheck} title="Business Classification" description="Business identity and classification" className="xl:col-span-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem icon={Building2} label="Legal Name" value={business.legalName} />
              <DetailItem icon={Store} label="Trade Name" value={business.tradeName} />
              <DetailItem icon={Store} label="Display Name" value={business.displayName} />
              <DetailItem icon={Building2} label="Business Type" value={businessType} />
              <DetailItem icon={Building2} label="Industry" value={nameOf(industries, business.industryId)} />
              <DetailItem icon={Building2} label="Business Category" value={nameOf(businessCategories, business.businessCategoryId)} />
              <DetailItem icon={Building2} label="Business Sub Category" value={nameOf(businessSubCategories, business.businessSubCategoryId)} />
            </div>
          </SectionCard>
        </div>

        <SectionCard icon={CreditCard} title="Tax, Registration & Financial Setup" description="Government identifiers, registration and accounting preferences">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem icon={BadgeCheck} label="GSTIN" value={business.gstin} mono />
            <DetailItem icon={BadgeCheck} label="PAN" value={business.pan} mono />
            <DetailItem icon={BadgeCheck} label="TAN" value={business.tan} mono />
            <DetailItem icon={BadgeCheck} label="MSME" value={business.msme} />
            <DetailItem icon={FileText} label="Registration Number" value={business.registrationNumber} mono />
            <DetailItem icon={FileText} label="Registration Type" value={nameOf(registrationTypes, business.registrationTypeId)} />
            <DetailItem icon={Wallet} label="Currency" value={nameOf(currencies, business.currencyId)} />
            <DetailItem icon={Clock} label="Timezone" value={business.timezone} />
            <DetailItem icon={Calendar} label="Financial Year" value={business.financialYear} />
            <DetailItem icon={Building2} label="License Type" value={nameOf(licenseTypes, business.licenseTypeId)} />
          </div>
        </SectionCard>

        <SectionCard
          icon={MapPin}
          title="Addresses"
          description={business.addresses?.length ? `${business.addresses.length} address${business.addresses.length === 1 ? "" : "es"} on record` : "Registered business addresses"}
        >
          {!business.addresses?.length ? (
            <EmptyState icon={MapPin} title="No addresses added" description="There is no address information available for this business." />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {allAddresses.map((address: any, index: number) => (
                <article key={address.id ?? index} className={cn("rounded-xl border p-4 transition", address.isPrimary ? "border-primary/25" : "border-border bg-white hover:border-primary/25 hover:shadow-sm")}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-text">{address.isPrimary ? "Primary Address" : `Address ${index + 1}`}</p>
                        {address.isPrimary && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Primary</span>}
                      </div>
                      <p className="mt-2 break-words text-sm font-medium leading-6 text-text">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
                      <p className="mt-1 text-sm text-muted">{[address.city, address.state, address.country].filter(Boolean).join(", ") || "-"} {address.pincode ? `- ${address.pincode}` : ""}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard icon={Building2} title="Branches" description={business.branches?.length ? `${business.branches.length} branch${business.branches.length === 1 ? "" : "es"} configured` : "Business branch locations and managers"}>
          {!business.branches?.length ? (
            <EmptyState icon={Building2} title="No branches added" description="Branch information will appear here once branches are configured." />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {business.branches.map((branch: any, index: number) => {
                const branchUsers = Array.isArray(branch.users) ? branch.users : [];
                const managerName =
                  branch.branchManager ||
                  branch.user?.fullName ||
                  branch.user?.name ||
                  branchUsers[0]?.fullName ||
                  branchUsers[0]?.name ||
                  "Not assigned";
                const userSummary = branchUsers.length
                  ? branchUsers
                      .map((user: any) => user.fullName || user.name || user.email || "User")
                      .filter(Boolean)
                      .join(", ")
                  : managerName;

                return (
                  <article key={branch.id ?? index} className="group rounded-xl border border-border bg-white p-5 transition hover:border-primary/25 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Building2 className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-text">{branch.branchName || branch.name || "Branch"}</p>
                          {branch.branchCode && <p className="mt-1 text-xs text-muted">Code: {branch.branchCode}</p>}
                        </div>
                      </div>
                      <StatusBadge status={branch.status} />
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Location</p>
                          <p className="mt-1 text-sm text-text">{locationLabel(branch)}</p>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-start gap-2.5">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Users</p>
                          <p className="mt-1 text-sm text-text">{userSummary}</p>
                        </div>
                      </div>

                      {branch.phone && (
                        <div className="flex min-w-0 items-start gap-2.5">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Phone</p>
                            <p className="mt-1 text-sm text-text">{branch.phone}</p>
                          </div>
                        </div>
                      )}

                      {branch.email && (
                        <div className="flex min-w-0 items-start gap-2.5">
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Email</p>
                            <p className="mt-1 text-sm text-text">{branch.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard icon={Landmark} title="Bank Details" description={business.banks?.length ? `${business.banks.length} bank account${business.banks.length === 1 ? "" : "s"} linked` : "Business banking information"}>
          {!business.banks?.length ? (
            <EmptyState icon={Landmark} title="No bank details added" description="There are no bank accounts available for this business." />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {business.banks.map((bank: any, index: number) => (
                <article key={bank.id ?? index} className="rounded-xl border border-border p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Landmark className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-text">{bank.bankName || "Bank Account"}</p>
                      <p className="mt-1 text-xs text-muted">{bank.accountHolderName || "Account holder"}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <dl className="space-y-3">
                    <div className="flex items-start justify-between gap-5">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Account No.</dt>
                      <dd className="text-right text-sm font-medium text-text">{bank.accountNumber || "-"}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-5">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">IFSC</dt>
                      <dd className="text-right text-sm font-medium text-text">{bank.ifscCode || "-"}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-5">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Branch</dt>
                      <dd className="text-right text-sm font-medium text-text">{bank.branch || "-"}</dd>
                    </div>
                    {bank.upiId && (
                      <div className="flex items-start justify-between gap-5">
                        <dt className="text-xs font-semibold uppercase tracking-wider text-muted">UPI</dt>
                        <dd className="text-right text-sm font-medium text-text">{bank.upiId}</dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard icon={FileText} title="Documents" description={business.documents?.length ? `${business.documents.length} document${business.documents.length === 1 ? "" : "s"} uploaded` : "Business certificates and supporting documents"}>
          {!business.documents?.length ? (
            <EmptyState icon={FileText} title="No documents uploaded" description="Uploaded GST, PAN, MSME, license and other documents will appear here." />
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {business.documents.map((document: any, index: number) => (
                <article key={document.id ?? index} className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-border bg-white p-4 transition hover:border-primary/25 hover:shadow-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">{document.fileName || "Document"}</p>
                      <p className="mt-1 text-xs text-muted">{document.globalDocumentTypeId || "Uploaded document"}</p>
                    </div>
                  </div>

                  {document.fileUrl && (
                    <a href={document.fileUrl} target="_blank" rel="noreferrer" className="shrink-0">
                      <Button size="sm" variant="outline" className="gap-1.5 rounded-lg border-primary/20 text-primary hover:bg-primary/5">
                        View
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="flex justify-end pb-3">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary">
            Back to Businesses
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{businessId && business ? `${businessName} Dashboard` : "Dashboard"}</h1>
        <p className="mt-1 text-gray-500">{business ? "Business overview, operational summary, and profile details." : "Welcome to Biznex ERP. Select a business to view its dashboard."}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((item, index) => {
          const Icon = metricIcons[index] ?? Landmark;

          return (
            <Card key={item.title} className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{item.value}</h2>
              </div>

              <div className={`rounded-xl bg-gray-100 p-4 ${item.tone}`}>
                <Icon className="h-7 w-7" />
              </div>
            </Card>
          );
        })}
      </div>

      {!business ? (
        <Card className="p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">No business selected</h2>
          <p className="mt-2 text-sm text-slate-500">Open a business from the list and the dashboard will load that business information here.</p>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Business profile</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{businessName}</h2>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {business.status ? String(business.status).toUpperCase() : "ACTIVE"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Legal name</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{business.legalName || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Business type</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{business.businessType || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">GSTIN</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{business.gstin || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">PAN</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{business.pan || "-"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Quick details</h3>

            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <span>{primaryLocation}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                <span>{business.phone || "Phone not added"}</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <span>{business.email || "Email not added"}</span>
              </div>
              {business.websiteLink ? (
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{business.websiteLink}</span>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      )}

      {business ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Branches</h3>
            <div className="mt-4 space-y-3">
              {(business.branches?.length ? business.branches : [{ branchName: "No branches added" }]).map((branch: any, index: number) => (
                <div key={branch.id || index} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium text-slate-800">{branch.branchName || "No branches added"}</p>
                  <p className="mt-1 text-sm text-slate-500">{branch.branchManager || "Manager not assigned"} • {branch.status || "-"}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Documents</h3>
            <div className="mt-4 space-y-3">
              {(business.documents?.length ? business.documents : [{ fileName: "No documents uploaded" }]).map((doc: any, index: number) => (
                <div key={doc.id || index} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-sm font-medium text-slate-800">{doc.fileName || "No documents uploaded"}</span>
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
