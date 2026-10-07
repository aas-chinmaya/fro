"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
  Banknote,
  AlertCircle,
  FileText,
  Package,
  CheckCircle2,
  CreditCard,
  ShoppingCart,
  Users,
  Receipt,
  IndianRupee,
  ChevronRight,
  Filter,
  Clock,
  CircleDollarSign,
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

// ─── Dummy data (mapped to your API shape) ───────────────────────────────────

const SALES_TREND = [
  { d: "01", sales: 4.9, prev: 4.2 },
  { d: "03", sales: 4.1, prev: 3.8 },
  { d: "05", sales: 5.6, prev: 4.9 },
  { d: "07", sales: 2.0, prev: 2.4 },
  { d: "09", sales: 8.1, prev: 6.8 },
  { d: "11", sales: 9.2, prev: 7.5 },
  { d: "13", sales: 3.5, prev: 3.1 },
  { d: "15", sales: 7.7, prev: 6.2 },
  { d: "17", sales: 5.1, prev: 4.8 },
  { d: "19", sales: 9.4, prev: 7.9 },
  { d: "21", sales: 2.8, prev: 3.0 },
  { d: "23", sales: 8.3, prev: 7.1 },
  { d: "25", sales: 4.8, prev: 4.5 },
  { d: "27", sales: 3.9, prev: 3.6 },
  { d: "29", sales: 5.2, prev: 4.7 },
];

const PAYMENT_METHODS = [
  { name: "UPI", value: 6.12, color: "var(--info)" },
  { name: "Cash", value: 3.29, color: "var(--success)" },
  { name: "Card", value: 2.88, color: "var(--primary)" },
  { name: "Bank", value: 1.56, color: "var(--violet)" },
  { name: "Cheque", value: 0.39, color: "var(--neutral)" },
];

const PIPELINE = [
  { label: "Quotations", count: 64, value: 8.9, href: "/sales/quotations" },
  { label: "Accepted", count: 28, value: 4.1, href: "/sales/quotations" },
  { label: "Invoiced", count: 186, value: 18.5, href: "/sales/invoices" },
  { label: "Collected", count: 214, value: 14.2, href: "/sales/payments" },
];

const AGEING = [
  { label: "0–30 days", value: "₹2.0L", pct: 47, tone: "success" },
  { label: "31–60 days", value: "₹0.9L", pct: 21, tone: "warning" },
  { label: "61–90 days", value: "₹0.6L", pct: 15, tone: "warning" },
  { label: "90+ days", value: "₹0.8L", pct: 17, tone: "danger" },
];

const KPIS = [
  {
    label: "Total Sales",
    value: "₹18.5L",
    delta: "+13.8%",
    up: true,
    icon: TrendingUp,
  },
  {
    label: "Collected",
    value: "₹14.2L",
    delta: "+19.9%",
    up: true,
    icon: Wallet,
  },
  {
    label: "Outstanding",
    value: "₹4.2L",
    delta: "44% overdue",
    up: false,
    icon: AlertCircle,
  },
  {
    label: "Invoices",
    value: "186",
    delta: "+10.7%",
    up: true,
    icon: FileText,
  },
];

const QUICK_STATS = [
  { icon: IndianRupee, label: "Avg. Invoice", value: "₹9,933" },
  { icon: ShoppingCart, label: "Qty Sold", value: "2,848" },
  { icon: Users, label: "Customers", value: "94" },
  { icon: Receipt, label: "Collection Rate", value: "77%" },
];

const TOP_PRODUCTS = [
  { name: "Premium Cotton Shirt", revenue: "₹1.86L", qty: 124 },
  { name: "Slim Fit Jeans", revenue: "₹1.54L", qty: 98 },
  { name: "Casual Sneakers", revenue: "₹1.29L", qty: 86 },
  { name: "Formal Blazer", revenue: "₹1.13L", qty: 45 },
  { name: "Graphic Tee", revenue: "₹0.99L", qty: 142 },
];

const TOP_CUSTOMERS = [
  { name: "Rahul Mehta", revenue: "₹1.88L", inv: 12, due: "₹24.5K" },
  { name: "Priya Sharma", revenue: "₹1.56L", inv: 9, due: null },
  { name: "Amit Patel", revenue: "₹1.35L", inv: 11, due: "₹18.7K" },
  { name: "Sneha Reddy", revenue: "₹1.12L", inv: 8, due: "₹32.0K" },
  { name: "Vikram Singh", revenue: "₹0.99L", inv: 7, due: null },
];

const FILTER_OPTIONS = [
  "Today",
  "Yesterday",
  "This Week",
  "Last 7 Days",
  "This Month",
  "Last 30 Days",
  "This Quarter",
  "This Year",
  "FY 2025-26",
  "FY 2024-25",
];

const TONE_BG: Record<string, string> = {
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
};

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function SalesBillingAnalyticsDashboard() {
  const [period, setPeriod] = useState("Last 30 Days");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

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
                <SelectItem key={option} value={option} className="text-xs">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-md px-3 text-xs"
            onClick={refresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
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
          : KPIS.map((k) => (
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
              {QUICK_STATS.map((s) => (
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

      {/* Sales Trend + Payment Methods */}
      <div className="mb-4 grid gap-3 lg:grid-cols-12">
        <Card className="border-border/50 shadow-none lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Sales Trend</CardTitle>
            </div>
            <div className="flex gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Sales
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-[var(--neutral)]" />
                Previous
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <Skeleton className="h-[220px] w-full rounded-md" />
            ) : (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={SALES_TREND}
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
                      formatter={(v, n) => [
                        `₹${Number(v ?? 0)}L`,
                        n === "sales" ? "Sales" : "Previous",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="prev"
                      stroke="var(--neutral)"
                      strokeWidth={1.5}
                      fill="none"
                      dot={false}
                      strokeDasharray="3 3"
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
              Total <span className="font-semibold text-primary">₹14.2L</span>
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <Skeleton className="mx-auto h-[130px] w-[130px] rounded-full" />
            ) : (
              <>
                <div className="mx-auto h-[130px] w-[130px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={PAYMENT_METHODS}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={56}
                        strokeWidth={0}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {PAYMENT_METHODS.map((e) => (
                          <Cell key={e.name} fill={e.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid hsl(var(--border))",
                          fontSize: 12,
                          background: "hsl(var(--card))",
                        }}
                        formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN")}L`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5">
                  {PAYMENT_METHODS.map((t) => (
                    <div
                      key={t.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: t.color }}
                        />
                        {t.name}
                      </span>
                      <span className="font-semibold">₹{Number(t.value ?? 0).toLocaleString("en-IN")}L</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {/* Pipeline */}
        <Card className="border-border/50 shadow-none">
          <CardHeader className="px-4 py-3.5">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" />
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-4">
            {loading ? (
              <Skeleton className="h-[210px] w-full rounded-md" />
            ) : (
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={PIPELINE}
                    layout="vertical"
                    margin={{ top: 4, right: 10, left: 0, bottom: 4 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={78}
                      tick={{ fontSize: 11, fill: "var(--neutral)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        fontSize: 12,
                        background: "hsl(var(--card))",
                      }}
                      formatter={(v, _, props) => [ `₹${Number(v ?? 0).toLocaleString("en-IN")}L · ${props.payload.count} docs`, "Value", ]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                      {PIPELINE.map((_, i) => (
                        <Cell
                          key={i}
                          fill="var(--primary)"
                          fillOpacity={1 - i * 0.15}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {!loading && (
              <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 border-t border-border/40 pt-2.5">
                {PIPELINE.map((p) => (
                  <Link
                    key={p.label}
                    href={p.href}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-primary"
                  >
                    <FileText className="h-3 w-3" />
                    {p.label}
                    <ChevronRight className="h-3 w-3" />
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
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              ₹4.2L
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
                    <p className="mt-1 font-heading text-base font-semibold">₹2.4L</p>
                  </div>
                  <div className="rounded-md bg-[var(--danger)]/10 px-3.5 py-3">
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <AlertCircle className="h-3.5 w-3.5 text-[var(--danger)]" />
                      Overdue
                    </p>
                    <p className="mt-1 font-heading text-base font-semibold text-[var(--danger)]">
                      ₹1.9L
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {AGEING.map((a) => (
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

        {/* Top Products + Customers */}
        <Card className="border-border/50 shadow-none md:col-span-2 lg:col-span-1">
          <CardHeader className="px-4 py-3.5">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Package className="h-4 w-4 text-primary" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {loading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {TOP_PRODUCTS.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between gap-2 rounded-md bg-secondary/40 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Qty {p.qty}
                      </p>
                    </div>
                    <p className="shrink-0 font-heading text-sm font-semibold text-primary">
                      {p.revenue}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Customers (full width row) */}
      <Card className="mt-3 border-border/50 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3.5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-primary" />
            Top Customers
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            94 buyers · 31 new · 63 repeat
          </span>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {loading ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {TOP_CUSTOMERS.map((c) => (
                <div
                  key={c.name}
                  className="rounded-md bg-secondary/40 px-3.5 py-3"
                >
                  <p className="truncate text-xs font-medium">{c.name}</p>
                  <p className="mt-1 font-heading text-sm font-semibold text-primary">
                    {c.revenue}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {c.inv} inv
                    {c.due && (
                      <span className="ml-1 text-[var(--danger)]">· {c.due} due</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}