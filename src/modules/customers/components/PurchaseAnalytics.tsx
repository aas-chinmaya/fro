"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyPurchase {
  month: string;
  amount: number;
}

interface PurchaseAnalyticsProps {
  monthlyPurchases: MonthlyPurchase[];
  totalPurchaseAmount: number;
  purchaseFrequency: number | string;
  averageDaysBetweenPurchases: number | string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function PurchaseAnalytics({
  monthlyPurchases,
  totalPurchaseAmount,
  purchaseFrequency,
  averageDaysBetweenPurchases,
}: PurchaseAnalyticsProps) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#eee] bg-surface shadow-sm">

      {/* Header */}
      <div className="border-b border-[#eee] px-6 py-5">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Financial Overview
            </p>

            <h2 className="mt-1 text-xl font-bold text-text">
              Purchase performance
            </h2>

            <p className="mt-1 text-sm text-muted">
              Customer purchase activity over time
            </p>
          </div>

          <div className="rounded-xl bg-secondary px-4 py-3">

            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted">
              Total Purchased
            </p>

            <p className="mt-1 text-lg font-bold text-primary">
              {formatCurrency(totalPurchaseAmount)}
            </p>

          </div>

        </div>
      </div>

      {/* Content */}
      <div className="p-6">

        {/* Summary */}
        <div className="flex items-end justify-between gap-4">

          <div>
            <p className="text-xs text-muted">
              Purchase value
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-text">
              {formatCurrency(totalPurchaseAmount)}
            </p>
          </div>

          <div className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-primary">
            {purchaseFrequency}
          </div>

        </div>

        {/* Bar Chart */}
        <div className="mt-8 h-[300px] w-full">

          {monthlyPurchases?.length ? (
            <ResponsiveContainer width="100%" height="100%">

              <BarChart
                data={monthlyPurchases.map((item) => ({
                  month: item.month,
                  amount: Number(item.amount) || 0,
                }))}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eeeeee"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#888888",
                  }}
                  tickMargin={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#888888",
                  }}
                  tickFormatter={(value) => {
                    if (value >= 100000) {
                      return `₹${(value / 100000).toFixed(1)}L`;
                    }

                    if (value >= 1000) {
                      return `₹${(value / 1000).toFixed(0)}K`;
                    }

                    return `₹${value}`;
                  }}
                />

               <Tooltip
                  cursor={false}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #eeeeee",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Purchase",
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill="var(--primary)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />

              </BarChart>

            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted">
                No monthly purchase data.
              </p>
            </div>
          )}

        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#eee] pt-5">

          <div>
            <p className="text-xs text-muted">
              Purchase Frequency
            </p>

            <p className="mt-1 text-sm font-semibold text-text">
              {purchaseFrequency}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">
              Average Days Between
            </p>

            <p className="mt-1 text-sm font-semibold text-text">
              {averageDaysBetweenPurchases} days
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}