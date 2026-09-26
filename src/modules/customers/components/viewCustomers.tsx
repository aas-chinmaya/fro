"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Mail,
  Pencil,
  Phone,
  User,
  FileText,
} from "lucide-react";

import { customersService } from "../services/customers.service";
import { CustomerDashboardResponse } from "../types";
import PurchaseAnalytics from "@/modules/customers/components/PurchaseAnalytics";
import AgingBreakdown from "@/modules/customers/components/AgingBreakdown";

export default function CustomerDashboard() {
  const router = useRouter();
  const params = useParams();

  const customerId = params?.id as string;

  const [data, setData] =
    useState<CustomerDashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     FETCH CUSTOMER DASHBOARD
  ========================================================= */

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!customerId) return;

      try {
        setLoading(true);

        const response =
          await customersService.getCustomerDashboard(customerId);

        setData(response?.data || response || null);
      } catch (error) {
        console.error(
          "Failed to fetch customer dashboard",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [customerId]);

  /* =========================================================
     CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-secondary border-t-primary" />

          <p className="mt-4 text-sm font-medium text-muted">
            Loading customer dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-3xl border border-[#eee] bg-surface p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <User size={21} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-text">
            Customer dashboard not found
          </h2>

          <p className="mt-1 text-sm text-muted">
            We couldn't find the requested customer
            information.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     DATA
  ========================================================= */

  const {
    customer,
    summary,
    analytics,
    recentPurchases,
    recentTransactions,
  } = data;

  const aging = analytics.aging;

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatCurrency = (
    value: number | string | null | undefined
  ) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatDate = (value?: string | null) => {
    if (!value) return "N/A";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * Supports customerNumber / customerNo if present.
   * Falls back to customer.id.
   */
  const customerNumber =
    (
      customer as typeof customer & {
        customerNumber?: string;
        customerNo?: string;
      }
    ).customerNumber ||
    (
      customer as typeof customer & {
        customerNumber?: string;
        customerNo?: string;
      }
    ).customerNo ||
    customer.id;

  /* =========================================================
     CHART DATA
  ========================================================= */

  const maxMonthlyAmount = Math.max(
    ...(analytics.monthlyPurchases || [
      {
        amount: 0,
      },
    ]).map(
      (item) => Number(item.amount) || 0
    ),
    1
  );

  /* =========================================================
     CREDIT
  ========================================================= */

  const creditUtilization = Math.min(
    Math.max(
      Number(
        analytics.credit.creditUtilization
      ) || 0,
      0
    ),
    100
  );

  /* =========================================================
     AGING
  ========================================================= */

  const totalAging =
    (aging.current || 0) +
    (aging.days1To30 || 0) +
    (aging.days31To60 || 0) +
    (aging.days61To90 || 0) +
    (aging.days90Plus || 0);

  const agingItems = [
    {
      label: "Current",
      value: aging.current || 0,
      opacity: "bg-primary",
    },
    {
      label: "1–30 Days",
      value: aging.days1To30 || 0,
      opacity: "bg-primary/80",
    },
    {
      label: "31–60 Days",
      value: aging.days31To60 || 0,
      opacity: "bg-primary/65",
    },
    {
      label: "61–90 Days",
      value: aging.days61To90 || 0,
      opacity: "bg-primary/50",
    },
    {
      label: "90+ Days",
      value: aging.days90Plus || 0,
      opacity: "bg-primary/35",
    },
  ];

  /* =========================================================
     KPI DATA
  ========================================================= */

  const statItems = [
    {
      label: "Total Invoices",
      value: summary.totalInvoices.toString(),
      description: "Invoices generated",
    },
    {
      label: "Total Paid",
      value: formatCurrency(
        summary.totalPaidAmount
      ),
      description: "Successfully collected",
    },
    {
      label: "Outstanding",
      value: formatCurrency(
        summary.totalOutstanding
      ),
      description: "Pending collection",
    },
    {
      label: "Average Invoice",
      value: formatCurrency(
        summary.averageInvoiceValue
      ),
      description: "Average transaction",
    },
  ];

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="min-h-screen bg-background p-3 md:p-5 lg:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5">

        {/* =====================================================
            CUSTOMER HEADER
        ===================================================== */}

        <section className="relative overflow-visible rounded-[28px] border border-[#eee] bg-surface shadow-sm">

          {/* Primary accent */}
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-[28px]" />

          <div className="relative overflow-visible px-5 py-6 md:px-7 md:py-7">

            <div className="flex items-start justify-between gap-4">

              {/* CUSTOMER IDENTITY */}
              <div className="flex min-w-0 items-center gap-4">

                {/* Avatar */}
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xl font-bold text-primary md:h-16 md:w-16">

                  {customer.name
                    ?.charAt(0)
                    ?.toUpperCase() || "C"}

                  {/* Status */}
                  <span
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 translate-x-0.5 translate-y-0.5 rounded-full border-[3px] border-surface ${
                      customer.isActive
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                </div>

                {/* Customer name */}
                <div className="min-w-0">

                  <div className="mb-1.5 flex items-center gap-2">

                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      Customer Overview
                    </span>

                    <span className="h-1 w-1 rounded-full bg-[#D1D5DB]" />

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        customer.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                    <span
                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          customer.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>

                  </div>

                  <h1 className="truncate text-2xl font-bold leading-tight tracking-tight text-text md:text-[28px]">
                    {customer.name}
                  </h1>

                  <p className="mt-1 text-xs font-medium text-muted">
                    Phone No.{" "}
                    <span className="font-semibold text-text/70">
                      {customer.mobile}
                    </span>
                  </p>

                </div>
              </div>

              {/* =================================================
                  PROFILE BUTTON
              ================================================= */}

              <div
                ref={profileRef}
                className="relative flex shrink-0 items-center gap-2"
              >
                 {/* =================================================
                          STATEMENT BUTTON
                      ================================================= */}
              <button
                type="button"
                onClick={() => {
                  router.push(`/customers/${customer.id}/statement`);
                }}
                className="flex h-10 items-center gap-2 rounded-lg border border-[#eee] bg-primary px-3 text-xs font-semibold text-text transition-all duration-200 hover:border-primary/25 hover:bg-secondary"
              >
                <FileText
                  size={15}
                  className="text-surface"
                />

                <span className="text-surface">Statement</span>
              </button>

                <button
                  type="button"
                  aria-expanded={profileOpen}
                  onClick={() =>
                    setProfileOpen(
                      (previous) => !previous
                    )
                  }
                  // className={`group flex h-10 items-center gap-2 rounded-xl border px-2 transition-all duration-200 ${
                  //   profileOpen
                  //     ? "border-primary/30 bg-secondary"
                  //     : "border-[#eee] bg-surface hover:border-primary/25 hover:bg-secondary/50"
                  // }`}
                >

                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      profileOpen
                        ? "bg-primary text-white"
                        : "bg-secondary text-primary"
                    }`}
                  >
                    <User size={16} />
                  </span>

                  {/* <ChevronDown
                    size={14}
                    className={`mr-1 text-muted transition-transform duration-200 ${
                      profileOpen
                        ? "rotate-180 text-primary"
                        : ""
                    }`}
                  /> */}

                </button>

                {/* =================================================
                    PROFILE DROPDOWN
                ================================================= */}

                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[300px] overflow-hidden rounded-2xl border border-[#eee] bg-surface shadow-[0_12px_40px_rgba(17,24,39,0.12)]">

                    {/* Identity */}
                    <div className="border-b border-[#eee] bg-background px-4 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-base font-bold text-primary">
                          {customer.name
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-text">
                            {customer.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-muted">
                            Customer No.{" "}
                            {customerNumber}
                          </p>

                          <div className="mt-1.5 flex items-center gap-1.5">

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                customer.isActive
                                  ? "bg-primary"
                                  : "bg-muted"
                              }`}
                            />

                            <span className="text-[10px] font-medium text-muted">
                              {customer.isActive
                                ? "Active customer"
                                : "Inactive customer"}
                            </span>

                          </div>

                        </div>
                      </div>

                    </div>

                    {/* Details */}
                    <div className="p-2.5">

                      <ProfileItem
                        icon={<Phone size={14} />}
                        label="Mobile"
                        value={
                          customer.mobile ||
                          "N/A"
                        }
                      />

                      <ProfileItem
                        icon={<Mail size={14} />}
                        label="Email"
                        value={
                          customer.email ||
                          "N/A"
                        }
                      />

                      <ProfileItem
                        icon={
                          <Building2 size={14} />
                        }
                        label="Business ID"
                        value={
                          customer.businessId ||
                          "N/A"
                        }
                      />

                      <ProfileItem
                        icon={
                          <Building2 size={14} />
                        }
                        label="Branch ID"
                        value={
                          customer.branchId ||
                          "N/A"
                        }
                      />

                      <ProfileItem
                        icon={
                          <CreditCard size={14} />
                        }
                        label="Credit Limit"
                        value={formatCurrency(
                          customer.creditLimit
                        )}
                      />

                    </div>

                    {/* Edit */}
                    <div className="border-t border-[#eee] p-3">

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);

                          router.push(
                            `/customers/${customer.id}/edit`
                          );
                        }}
                        className="flex h-10 w-full items-center justify-between rounded-xl bg-text px-3.5 text-xs font-semibold text-white transition hover:opacity-90"
                      >

                        <span className="flex items-center gap-2">
                          <Pencil size={14} />
                          Edit Customer
                        </span>

                        <ArrowUpRight size={14} />

                      </button>

                    </div>

                  </div>
                )}

              </div>
            </div>

            {/* =================================================
                HEADER METRICS
            ================================================= */}

            <div className="mt-6 grid grid-cols-2 gap-y-4 border-t border-[#eee] pt-5 md:grid-cols-4 md:gap-y-0">

              <HeaderMetric
                label="Customer Type"
                value={
                  customer.customerType ||
                  "N/A"
                }
              />

              <HeaderMetric
                label="First Purchase"
                value={formatDate(
                  summary.firstPurchaseDate
                )}
                icon={
                  <CalendarDays size={12} />
                }
              />

              <HeaderMetric
                label="Last Purchase"
                value={formatDate(
                  summary.lastPurchaseDate
                )}
                icon={
                  <CalendarDays size={12} />
                }
              />

              <HeaderMetric
                label="Total Quantity"
                value={summary.totalQuantityPurchased.toString()}
              />

            </div>

          </div>
        </section>

        {/* =====================================================
            MAIN ANALYTICS
        ===================================================== */}

       <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">

        {/* Purchase Analytics */}
        <PurchaseAnalytics
          monthlyPurchases={analytics.monthlyPurchases ?? []}
          totalPurchaseAmount={summary.totalPurchaseAmount}
          purchaseFrequency={analytics.purchaseFrequency}
          averageDaysBetweenPurchases={
            analytics.averageDaysBetweenPurchases
          }
        />

  {/* Credit */}
  <div className="rounded-[26px] border border-[#eee] bg-white p-6 text-white shadow-sm">

    <div className="flex items-start justify-between">

      <div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Credit Health
        </p>

        <h2 className="mt-1 text-xl font-bold text-black">
          Credit utilization
        </h2>

      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-primary">
        <CreditCard size={18} />
      </div>

    </div>

    {/* Gauge */}
    <div className="relative mx-auto mt-8 flex h-44 w-44 items-center justify-center">

      <div className="absolute inset-0 rounded-full border-[12px] border-white/10" />

      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--primary) ${creditUtilization}%, transparent ${creditUtilization}% 100%)`,
          mask:
            "radial-gradient(farthest-side, transparent calc(100% - 12px), #000 0)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 12px), #000 0)",
        }}
      />

      <div className="relative text-center">

        <p className="text-4xl font-bold text-black">
          {creditUtilization}%
        </p>

        <p className="mt-1 text-xs text-black/50">
          utilized
        </p>

      </div>

    </div>

    {/* Credit Metrics */}
    <div className="mt-7 space-y-3">

      <DarkMetric
        label="Credit Limit"
        value={formatCurrency(
          analytics.credit.creditLimit
        )}
      />

      <DarkMetric
        label="Available Credit"
        value={formatCurrency(
          analytics.credit.availableCredit
        )}
      />

      <DarkMetric
        label="Overdue Invoices"
        value={String(
          analytics.aging.overdueInvoiceCount
        )}
      />

    </div>

  </div>

</section>

        {/* =====================================================
            KPI STRIP
        ===================================================== */}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {statItems.map((item, index) => (

            <div
              key={item.label}
              className="group relative overflow-hidden rounded-[22px] border border-[#eee] bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
            >

              <div className="relative">

                <div className="flex items-center justify-between">

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-primary">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <ArrowUpRight
                    size={15}
                    className="text-muted transition group-hover:text-primary"
                  />

                </div>

                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {item.label}
                </p>

                <p className="mt-1 truncate text-xl font-bold text-text">
                  {item.value}
                </p>

                <p className="mt-1 text-xs text-muted">
                  {item.description}
                </p>

              </div>

            </div>

          ))}

        </section>

        {/* =====================================================
            AGING + PRODUCTS
        ===================================================== */}

      <section className="grid gap-5 xl:grid-cols-[1fr_1.25fr]">

        {/* Aging Breakdown */}
        <AgingBreakdown
          agingItems={agingItems.map((item) => ({
            label: item.label,
            value: Number(item.value) || 0,
          }))}
          totalAging={totalAging}
        />

        {/* Products */}
        <div className="rounded-[26px] border border-[#eee] bg-surface p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Product Insights
              </p>

              <h2 className="mt-1 text-xl font-bold text-text">
                Top purchased products
              </h2>

            </div>

            <span className="rounded-full bg-secondary px-3 py-1.5 text-[10px] font-semibold text-primary">
              Top 5
            </span>

          </div>

          <div className="mt-6 space-y-2">

            {analytics.topProducts?.length ? (

              (() => {
                const topFiveProducts =
                  analytics.topProducts.slice(0, 5);

                const maxProductAmount = Math.max(
                  ...topFiveProducts.map(
                    (product) =>
                      Number(product.amount) || 0
                  ),
                  1
                );

                return topFiveProducts.map(
                  (product, index) => {

                    const amount =
                      Number(product.amount) || 0;

                    const width =
                      (amount / maxProductAmount) * 100;

                    return (
                      <div
                        key={product.productId}
                        className="group relative overflow-hidden rounded-2xl p-3 transition bg-background "
                      >

                        <div
                          className="absolute inset-y-0 left-0 rounded-2xl bg-secondary transition-all"
                          style={{
                            width: `${Math.min(
                              width,
                              100
                            )}%`,
                          }}
                        />

                        <div className="relative flex items-center gap-4">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-text text-xs font-bold text-white">
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-text">
                              {product.itemName}
                            </p>

                            <p className="mt-1 text-xs text-muted">
                              {product.quantity} units purchased
                            </p>

                          </div>

                          <p className="shrink-0 text-sm font-bold text-text">
                            {formatCurrency(amount)}
                          </p>

                        </div>

                      </div>
                    );
                  }
                );
              })()

            ) : (

              <EmptyState text="No purchased products available." />

            )}

          </div>

        </div>

      </section>

        {/* =====================================================
            RECENT PURCHASES
        ===================================================== */}

      <section className="rounded-[26px] border border-[#eee] bg-surface p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Purchase History</p>
            <h2 className="mt-1 text-xl font-bold text-text">Recent purchases</h2>
            <p className="mt-1 text-sm text-muted">Latest invoices and outstanding amounts</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-primary">
              {recentPurchases?.length || 0} records
            </div>
            <button
              type="button"
              onClick={() => router.push(`/customers/${customer.id}/purchases`)}
              className="inline-flex items-center gap-1.5 rounded-full bg-text px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            >
              View more
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {recentPurchases?.length ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.35fr]">

            {/* Featured Purchase */}
            {(() => {
              const purchase = recentPurchases[0];
              const total = Number(purchase.grandTotal) || 0;
              const pending = Number(purchase.pendingAmount) || 0;
              const paid = Math.max(total - pending, 0);
              const progress = total ? Math.min((paid / total) * 100, 100) : 0;

              return (
                <div className="relative overflow-hidden rounded-2xl bg-background p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">
                        Latest Purchase
                      </p>
                      <p className="mt-2 text-lg font-bold text-text">
                        {purchase.invoiceNumber || "Draft invoice"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(purchase.invoiceDate)}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-[10px] font-bold text-primary">
                      INV
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Invoice Total
                    </p>
                    <p className="mt-1 text-3xl font-bold tracking-tight text-text">
                      {formatCurrency(total)}
                    </p>
                  </div>

                  <div className="mt-7">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-muted">Paid</p>
                        <p className="mt-1 text-sm font-bold text-text">
                          {formatCurrency(paid)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider text-muted">Outstanding</p>
                        <p className="mt-1 text-sm font-bold text-primary">
                          {formatCurrency(pending)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between text-[10px] text-muted">
                      <span>Payment progress</span>
                      <span className="font-semibold text-text">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Purchase History */}
            <div className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Previous purchases
                </p>
                <span className="text-[10px] text-muted">
                  {Math.max(recentPurchases.length - 1, 0)} records
                </span>
              </div>

              <div className="divide-y divide-[#eee]">
                {recentPurchases.slice(1).map((purchase) => {
                  const pending = Number(purchase.pendingAmount) || 0;

                  return (
                    <div
                      key={purchase.id}
                      className="group grid grid-cols-[1fr_auto] items-center gap-4 py-4 first:pt-2"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-[9px] font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                          INV
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text group-hover:text-primary">
                            {purchase.invoiceNumber || "Draft invoice"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted">
                            {formatDate(purchase.invoiceDate)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-text">
                          {formatCurrency(purchase.grandTotal)}
                        </p>
                        <p className={`mt-0.5 text-[10px] font-medium ${pending > 0 ? "text-primary" : "text-green-600"}`}>
                          {pending > 0 ? `${formatCurrency(pending)} outstanding` : "Fully paid"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="mt-6">
            <EmptyState text="No recent purchases." />
          </div>
        )}
      </section>

        {/* =====================================================
            RECENT LEDGER
        ===================================================== */}

        {/* <section className="overflow-hidden rounded-[26px] border border-[#eee] bg-surface shadow-sm">

          <div className="border-b border-[#eee] px-6 py-5">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Account Activity
                </p>

                <h2 className="mt-1 text-xl font-bold text-text">
                  Recent ledger
                </h2>

              </div>

              <span className="rounded-full bg-secondary px-3 py-1.5 text-xs text-muted">
                Latest transactions
              </span>

            </div>

          </div>

          {recentTransactions?.length ? (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left text-sm">

                <thead className="border-b border-[#eee] bg-background text-[10px] uppercase tracking-[0.14em] text-muted">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Document</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 text-right font-semibold">Debit</th>
                    <th className="px-4 py-3 text-right font-semibold">Credit</th>
                    <th className="px-4 py-3 text-right font-semibold">Balance</th>
                  
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#eee]">
                  {recentTransactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="transition hover:bg-background"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-text">
                        {formatDate(txn.transactionDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-text">
                        {txn.documentNumber || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-muted">
                        {txn.documentType}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-red-600">
                        {formatCurrency(txn.debit)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-green-600">
                        {formatCurrency(txn.credit)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-text">
                        {formatCurrency(txn.balance)}
                      </td>
                     
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

          ) : (
            <div className="p-8">
              <EmptyState text="No recent transactions." />
            </div>
          )}

        </section> */}
       <section className="overflow-hidden rounded-[26px] border border-[#eee] bg-surface shadow-sm">
        <div className="border-b border-[#eee] px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Account Activity</p></div>
              <div className="mt-1 flex items-center gap-3"><h2 className="text-xl font-bold text-text">Recent ledger</h2>{recentTransactions?.length > 0 && <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted">{recentTransactions.length} {recentTransactions.length === 1 ? "transaction" : "transactions"}</span>}</div>
              <p className="mt-1 text-xs text-muted">A summary of the latest account transactions</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#eee] bg-background px-3 py-1.5 text-xs font-medium text-muted"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Latest transactions</span>
              <button
                type="button"
                onClick={() => router.push(`/customers/${customer.id}/ledger`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-text px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              >
                View more
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {recentTransactions?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-[#eee] bg-background"><tr className="text-[10px] uppercase tracking-[0.14em] text-muted"><th className="px-6 py-4 font-semibold">Date</th><th className="px-4 py-4 font-semibold">Document</th><th className="px-4 py-4 font-semibold">Type</th><th className="px-4 py-4 text-right font-semibold">Debit</th><th className="px-4 py-4 text-right font-semibold">Credit</th><th className="px-6 py-4 text-right font-semibold">Balance</th></tr></thead>
              <tbody className="divide-y divide-[#eee]">
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="group transition-colors duration-200 hover:bg-background">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-text">{formatDate(txn.transactionDate)}</p>
                            <p className="mt-0.5 text-[11px] text-muted">Transaction date</p>
                          </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-2.5 font-semibold">{txn.documentNumber || "N/A"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-muted">{txn.documentType}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      {txn.debit ? 
                      <div>
                        <p className="font-bold text-red-600">{formatCurrency(txn.debit)}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">Outflow</p>
                      </div> : 
                        <span className="text-sm text-muted">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      {txn.credit ? 
                        <div>
                          <p className="font-bold text-green-600">{formatCurrency(txn.credit)}</p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">Inflow</p>
                        </div> : 
                            <span className="text-sm text-muted">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className="rounded-xl bg-secondary px-3 py-2 font-bold text-text">{formatCurrency(txn.balance)}</span>
                        <span className="mt-1 text-[10px] uppercase tracking-wide text-muted">Closing balance</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#ddd] bg-background px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
                  <path d="M14 2v6h6M8 13h8M8 17h5" />
                </svg>
              </div>
                  <h3 className="mt-4 text-sm font-semibold text-text">No recent transactions</h3>
                  <p className="mt-1 max-w-sm text-xs text-muted">Transactions will appear here once activity is recorded on this customer account.</p>
              </div>
            </div>
        )}
      </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="flex flex-col justify-between gap-2 px-2 pb-3 text-xs text-muted sm:flex-row">

          <p>
            Customer since{" "}
            <span className="font-medium text-text">
              {formatDate(
                summary.firstPurchaseDate
              )}
            </span>
          </p>

          <p>
            Total quantity purchased{" "}
            <span className="font-semibold text-text">
              {summary.totalQuantityPurchased}
            </span>
          </p>

        </div>

      </div>
    </div>
  );
}

/* =============================================================
   HEADER METRIC
============================================================= */

function HeaderMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 border-r border-[#eee] px-4 first:pl-0 last:border-r-0">

      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        {icon || (
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-semibold text-text">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =============================================================
   PROFILE ITEM
============================================================= */

function ProfileItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-background">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-medium text-text">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =============================================================
   MINI STAT
============================================================= */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-text">
        {value}
      </p>

    </div>
  );
}

/* =============================================================
   DARK METRIC
============================================================= */

function DarkMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">

      <span className="text-sm text-black">
        {label}
      </span>

      <span className="text-sm font-semibold text-black">
        {value}
      </span>

    </div>
  );
}

/* =============================================================
   EMPTY STATE
============================================================= */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-background px-5 py-10 text-center">

      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
        —
      </div>

      <p className="mt-3 text-sm text-muted">
        {text}
      </p>

    </div>
  );
}