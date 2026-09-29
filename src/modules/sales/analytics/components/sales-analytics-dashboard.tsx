// modules/sales/analytics/components/sales-analytics-dashboard.tsx

"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  Wallet,
  AlertCircle,
  FileText,
  CreditCard,
  ShoppingCart,
  Users,
  Receipt,
  IndianRupee,
  Filter,
  Clock,
  Truck,
  FileMinus,
  FilePlus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useGetSalesBillingAnalyticsQuery } from "../api/sales-billing-analytics";
import type { AnalyticsFilterParams } from "../types/sales-billing-analytics.types";

const FILTER_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last 30 Days", value: "last30" },
  { label: "This Quarter", value: "thisQuarter" },
  { label: "This Year", value: "thisYear" },
] as const;

const FIXED_PAYMENT_MODES = ["UPI", "CASH", "CARD", "BANK_TRANSFER", "CHEQUE"] as const;

const PAYMENT_COLORS: Record<string, string> = {
  UPI: "var(--info)",
  CASH: "var(--success)",
  CARD: "var(--primary)",
  BANK_TRANSFER: "var(--violet)",
  CHEQUE: "var(--neutral)",
};

const PAYMENT_LABELS: Record<string, string> = {
  UPI: "UPI",
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank",
  CHEQUE: "Cheque",
};

const PIPELINE_COLORS = [
  "var(--primary)",
  "var(--info)",
  "var(--success)",
  "var(--violet)",
];

const TONE_BG: Record<string, string> = {
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
};

const AGEING_DEFAULT = [
  { label: "0–30", value: "₹0", pct: 0, tone: "success" },
  { label: "31–60", value: "₹0", pct: 0, tone: "warning" },
  { label: "61–90", value: "₹0", pct: 0, tone: "warning" },
  { label: "90+", value: "₹0", pct: 0, tone: "danger" },
];

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function formatCurrency(value: number, compact = false) {
  const n = Number.isFinite(value) ? value : 0;
  if (compact && Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (compact && Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number) {
  const n = Number.isFinite(value) ? value : 0;
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function getDateRange(period: string): AnalyticsFilterParams {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case "today":
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case "last7":
      start.setDate(start.getDate() - 6);
      break;
    case "thisMonth":
      start.setDate(1);
      break;
    case "last30":
      start.setDate(start.getDate() - 29);
      break;
    case "thisQuarter": {
      const q = Math.floor(now.getMonth() / 3) * 3;
      start.setMonth(q, 1);
      break;
    }
    case "thisYear":
      start.setMonth(0, 1);
      break;
    default:
      start.setDate(start.getDate() - 29);
  }

  return {
    fromDate: start.toISOString().slice(0, 10),
    toDate: end.toISOString().slice(0, 10),
    topLimit: 10,
  };
}

function currencyLFormatter(value: unknown): [string, string] {
  const n = typeof value === "number" ? value : Number(value) || 0;
  return [`₹${n}L`, "Sales"];
}

export default function SalesAnalyticsDashboard() {
  const [period, setPeriod] = useState("last30");
  const params = useMemo(() => getDateRange(period), [period]);

  const { data, isLoading, isFetching, refetch } =
    useGetSalesBillingAnalyticsQuery(params);

  const loading = isLoading || (!data && isFetching);

  const kpis = useMemo(() => {
    const o = data?.overview;
    const c = data?.comparisons;
    const r = data?.receivables;

    return [
      {
        label: "Total Sales",
        value: formatCurrency(o?.totalSales ?? 0, true),
        delta: formatPercent(c?.sales?.percentageChange ?? 0),
        up: (c?.sales?.percentageChange ?? 0) >= 0,
        icon: TrendingUp,
      },
      {
        label: "Collected",
        value: formatCurrency(o?.totalCollected ?? 0, true),
        delta: formatPercent(c?.collections?.percentageChange ?? 0),
        up: (c?.collections?.percentageChange ?? 0) >= 0,
        icon: Wallet,
      },
      {
        label: "Outstanding",
        value: formatCurrency(o?.totalOutstanding ?? 0, true),
        delta: `${r?.summary?.overduePercentage ?? 0}% overdue`,
        up: (o?.totalOutstanding ?? 0) === 0,
        icon: AlertCircle,
      },
      {
        label: "Invoices",
        value: formatNumber(o?.numberOfSalesInvoices ?? 0),
        delta: formatPercent(c?.invoiceCount?.percentageChange ?? 0),
        up: (c?.invoiceCount?.percentageChange ?? 0) >= 0,
        icon: FileText,
      },
    ];
  }, [data]);

  const quickStats = useMemo(() => {
    const o = data?.overview;
    const cust = data?.customers;
    const col = data?.collections;

    return [
      {
        icon: IndianRupee,
        label: "Avg. Invoice",
        value: formatCurrency(o?.averageInvoiceValue ?? 0),
      },
      {
        icon: ShoppingCart,
        label: "Qty Sold",
        value: formatNumber(o?.totalQuantitySold ?? 0, 0),
      },
      {
        icon: Users,
        label: "Customers",
        value: formatNumber(cust?.summary?.customersWhoPurchased ?? 0),
      },
      {
        icon: Receipt,
        label: "Collection Rate",
        value: `${col?.summary?.collectionRate ?? 0}%`,
      },
    ];
  }, [data]);

  const salesTrend = useMemo(() => {
    const days = data?.sales?.trends?.day ?? [];
    if (days.length > 0) {
      return days.map((p) => ({
        d: p.period?.slice(8) ?? p.period ?? "",
        sales: +((p.sales ?? 0) / 100000).toFixed(2),
      }));
    }
    return Array.from({ length: 7 }).map((_, i) => ({
      d: String(i + 1).padStart(2, "0"),
      sales: 0,
    }));
  }, [data]);

  const paymentMethods = useMemo(() => {
    const modes = data?.collections?.paymentModes ?? [];
    const map = new Map(
      modes.map((m) => [String(m.paymentMode).toUpperCase(), m.amount ?? 0])
    );

    return FIXED_PAYMENT_MODES.map((key) => {
      const amount = map.get(key) ?? 0;
      return {
        name: PAYMENT_LABELS[key] ?? key,
        key,
        value: +(amount / 100000).toFixed(2),
        pieValue: amount > 0 ? +(amount / 100000).toFixed(2) : 0.001,
        color: PAYMENT_COLORS[key] ?? "var(--neutral)",
      };
    });
  }, [data]);

  /** Pipeline stages — same list style as payment methods */
  const pipeline = useMemo(() => {
    const q = data?.quotations;
    const o = data?.overview;
    const col = data?.collections;

    const rows = [
      {
        key: "quotations",
        label: "Quotations",
        count: q?.summary?.totalQuotations ?? 0,
        amount: q?.summary?.totalQuotationValue ?? 0,
        href: "/sales/quotations",
      },
      {
        key: "accepted",
        label: "Accepted",
        count: q?.conversion?.acceptedQuotations ?? 0,
        amount: q?.summary?.acceptedValue ?? 0,
        href: "/sales/quotations",
      },
      {
        key: "invoiced",
        label: "Invoiced",
        count: o?.numberOfSalesInvoices ?? 0,
        amount: o?.totalSales ?? 0,
        href: "/sales/invoices",
      },
      {
        key: "collected",
        label: "Collected",
        count: col?.summary?.paymentCount ?? 0,
        amount: col?.summary?.totalCollected ?? 0,
        href: "/sales/payments",
      },
    ];

    const maxAmount = Math.max(...rows.map((r) => r.amount), 1);

    return rows.map((r, i) => ({
      ...r,
      valueL: +(r.amount / 100000).toFixed(1),
      pct: Math.round((r.amount / maxAmount) * 100),
      color: PIPELINE_COLORS[i % PIPELINE_COLORS.length],
    }));
  }, [data]);

  const ageing = useMemo(() => {
    const buckets = data?.receivables?.ageing ?? [];
    if (!buckets.length) return AGEING_DEFAULT;

    const total = data?.receivables?.summary?.totalReceivable || 1;
    const tones = ["success", "warning", "warning", "danger"];

    return buckets.map((b, i) => ({
      label: b.bucket,
      value: formatCurrency(b.amount ?? 0, true),
      pct: Math.min(100, Math.round(((b.amount ?? 0) / total) * 100)),
      tone: tones[i] ?? "warning",
    }));
  }, [data]);

  /**
   * Sales documents — Quotation, Invoice, Delivery Challan, Credit Note, Debit Note
   * Always shown; zero when module not live / no data
   */
  const salesDocuments = useMemo(() => {
    const q = data?.quotations;
    const o = data?.overview;
    const future = data?.future;

    return [
      {
        key: "quotation",
        label: "Quotations",
        icon: FileText,
        count: q?.summary?.totalQuotations ?? 0,
        value: q?.summary?.totalQuotationValue ?? 0,
        sub: `${q?.conversion?.acceptedQuotations ?? 0} accepted`,
        href: "/sales/quotations",
        live: true,
      },
      {
        key: "invoice",
        label: "Invoices",
        icon: Receipt,
        count: o?.numberOfSalesInvoices ?? 0,
        value: o?.totalSales ?? 0,
        sub: `${formatCurrency(o?.totalCollected ?? 0, true)} collected`,
        href: "/sales/invoices",
        live: true,
      },
      {
        key: "delivery",
        label: "Delivery Challans",
        icon: Truck,
        count: 0,
        value: 0,
        sub: future?.deliveryChallans?.implemented
          ? "Active"
          : "Coming soon",
        href: "/sales/delivery-challans",
        live: !!future?.deliveryChallans?.implemented,
      },
      {
        key: "credit",
        label: "Credit Notes",
        icon: FileMinus,
        count: 0,
        value: 0,
        sub: future?.creditNotes?.implemented ? "Active" : "Coming soon",
        href: "/sales/credit-notes",
        live: !!future?.creditNotes?.implemented,
      },
      {
        key: "debit",
        label: "Debit Notes",
        icon: FilePlus,
        count: 0,
        value: 0,
        sub: future?.debitNotes?.implemented ? "Active" : "Coming soon",
        href: "/sales/debit-notes",
        live: !!future?.debitNotes?.implemented,
      },
    ];
  }, [data]);

  return (
    <div className="">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Sales & Billing Analytics
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Sales, collections, receivables & pipeline
            {data?.generatedAt && (
              <span className="ml-1 text-muted-foreground/70">
                · Updated {new Date(data.generatedAt).toLocaleString("en-IN")}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-[160px] rounded-md border-border/60 bg-white text-xs font-medium shadow-none">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-md px-3 text-xs"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/50 shadow-none">
                <CardContent className="space-y-2.5 p-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3.5 w-20" />
                </CardContent>
              </Card>
            ))
          : kpis.map((k) => (
              <Card
                key={k.label}
                className="border-border/50 shadow-none transition-shadow hover:shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                      <k.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                        k.up
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--danger)]/10 text-[var(--danger)]"
                      )}
                    >
                      {k.up ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {k.delta}
                    </span>
                  </div>
                  <p className="mt-3 font-heading text-xl font-semibold tracking-tight leading-none sm:text-2xl">
                    {k.value}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                    {k.label}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Stats */}
      <Card className="mb-4 border-border/50 shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-11 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 divide-x divide-y divide-border/50 sm:grid-cols-4 sm:divide-y-0">
              {quickStats.map((s) => (
                <div key={s.label} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    <p className="font-heading text-base font-semibold leading-tight">
                      {s.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend + Payment Methods */}
      <div className="mb-4 grid gap-3 lg:grid-cols-12">
        <Card className="border-border/50 shadow-none lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Sales Trend</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <Skeleton className="h-[220px] w-full rounded-md" />
            ) : (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesTrend}
                    margin={{ top: 8, right: 4, left: -16, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.16} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="d"
                      tick={{ fontSize: 11, fill: "var(--neutral)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--neutral)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}L`}
                      width={36}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        fontSize: 12,
                        background: "hsl(var(--card))",
                      }}
                      formatter={currencyLFormatter}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--primary)"
                      strokeWidth={2.25}
                      fill="url(#gSales)"
                      dot={false}
                      activeDot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-none lg:col-span-4">
          <CardHeader className="px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Methods
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Total{" "}
              <span className="font-semibold text-primary">
                {formatCurrency(data?.collections?.summary?.totalCollected ?? 0, true)}
              </span>
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <Skeleton className="mx-auto h-[140px] w-[140px] rounded-full" />
            ) : (
              <>
                <div className="mx-auto h-[140px] w-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        dataKey="pieValue"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={62}
                        strokeWidth={0}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={2}
                        cornerRadius={4}
                      >
                        {paymentMethods.map((e) => (
                          <Cell key={e.key} fill={e.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid hsl(var(--border))",
                          fontSize: 12,
                          background: "hsl(var(--card))",
                        }}
                        formatter={(_v, _n, item) => {
                          const payload = item?.payload as {
                            value?: number;
                            name?: string;
                          };
                          return [`₹${payload?.value ?? 0}L`, payload?.name ?? ""];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5">
                  {paymentMethods.map((t) => (
                    <div
                      key={t.key}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: t.color }}
                        />
                        {t.name}
                      </span>
                      <span className="font-semibold">₹{t.value}L</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline (payment-style) + Receivables + Sales Documents */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {/* Sales Pipeline — same flow format as Payment Methods */}
        <Card className="border-border/50 shadow-none">
          <CardHeader className="px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" />
              Sales Pipeline
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Quote → Accept → Invoice → Collect
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pipeline.map((p) => (
                  <Link
                    key={p.key}
                    href={p.href}
                    className="block rounded-md transition-colors hover:bg-secondary/40"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: p.color }}
                        />
                        {p.label}
                      </span>
                      <span className="font-semibold text-primary">
                        ₹{p.valueL}L
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${p.pct}%`,
                          background: p.color,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatNumber(p.count)} docs
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receivables */}
        <Card className="border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3.5">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Wallet className="h-4 w-4 text-primary" />
              Receivables
            </CardTitle>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(data?.receivables?.summary?.totalReceivable ?? 0, true)}
            </span>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-4">
            {loading ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <Skeleton className="h-14 rounded-md" />
                  <Skeleton className="h-14 rounded-md" />
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-md bg-secondary/70 px-3.5 py-3">
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Current
                    </p>
                    <p className="mt-1 font-heading text-base font-semibold">
                      {formatCurrency(
                        data?.receivables?.summary?.currentOutstanding ?? 0,
                        true
                      )}
                    </p>
                  </div>
                  <div className="rounded-md bg-[var(--danger)]/10 px-3.5 py-3">
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <AlertCircle className="h-3.5 w-3.5 text-[var(--danger)]" />
                      Overdue
                    </p>
                    <p className="mt-1 font-heading text-base font-semibold text-[var(--danger)]">
                      {formatCurrency(
                        data?.receivables?.summary?.overdueOutstanding ?? 0,
                        true
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {ageing.map((a) => (
                    <div key={a.label} className="flex items-center gap-2.5">
                      <span className="w-[70px] shrink-0 text-[11px] text-muted-foreground">
                        {a.label}
                      </span>
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn("h-full rounded-full", TONE_BG[a.tone])}
                          style={{ width: `${a.pct}%` }}
                        />
                      </div>
                      <span className="w-11 shrink-0 text-right text-[11px] font-medium">
                        {a.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sales Documents — Quotation, Invoice, DC, Credit, Debit */}
        <Card className="border-border/50 shadow-none md:col-span-2 lg:col-span-1">
          <CardHeader className="px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Receipt className="h-4 w-4 text-primary" />
              Sales Documents
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Quotation · Invoice · DC · Notes
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {salesDocuments.map((doc) => (
                  <Link
                    key={doc.key}
                    href={doc.href}
                    className="flex items-center justify-between gap-2 rounded-md bg-secondary/40 px-3 py-2.5 transition-colors hover:bg-secondary/70"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                        <doc.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{doc.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatNumber(doc.count)} · {doc.sub}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 font-heading text-sm font-semibold text-primary">
                      {formatCurrency(doc.value, true)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}