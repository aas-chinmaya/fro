"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AgingItem {
  label: string;
  value: number;
}

interface AgingBreakdownProps {
  agingItems: AgingItem[];
  totalAging: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AgingBreakdown({
  agingItems,
  totalAging,
}: AgingBreakdownProps) {
  const chartData = agingItems.map((item) => ({
    label: item.label,
    amount: Number(item.value) || 0,
  }));

  return (
    <div className="rounded-[26px] border border-[#eee] bg-surface p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Receivables
          </p>

          <h2 className="mt-1 text-xl font-bold text-text">
            Aging breakdown
          </h2>

          <p className="mt-1 text-sm text-muted">
            Outstanding receivables by aging period
          </p>
        </div>

        <div className="rounded-xl bg-secondary px-3 py-2 text-right">

          <p className="text-[9px] uppercase tracking-wider text-muted">
            Total
          </p>

          <p className="text-sm font-bold text-primary">
            {formatCurrency(totalAging)}
          </p>

        </div>

      </div>

      {/* Line Chart */}
      <div className="mt-8 h-[260px] w-full">

        {chartData.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eeeeee"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#888888",
                }}
                tickMargin={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#888888",
                }}
                tickFormatter={(value) => {
                  if (value >= 100000) {
                    return `₹${(
                      value / 100000
                    ).toFixed(1)}L`;
                  }

                  if (value >= 1000) {
                    return `₹${(
                      value / 1000
                    ).toFixed(0)}K`;
                  }

                  return `₹${value}`;
                }}
              />

              <Tooltip
                cursor={{
                  stroke: "#dddddd",
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #eeeeee",
                  backgroundColor: "#ffffff",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelStyle={{
                  fontWeight: 600,
                  marginBottom: 4,
                }}
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Receivable",
                ]}
              />

              <Line
                type="monotone"
                dataKey="amount"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "var(--primary)",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                }}
              />

            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted">
              No aging data available.
            </p>
          </div>
        )}

      </div>

      {/* Aging Details */}
      {/* <div className="mt-6 space-y-4 border-t border-[#eee] pt-5">

        {agingItems.map((item) => {

          const value =
            Number(item.value) || 0;

          const percentage =
            totalAging > 0
              ? (value / totalAging) * 100
              : 0;

          return (
            <div key={item.label}>

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm text-muted">
                  {item.label}
                </span>

                <div className="flex items-center gap-3">

                  <span className="text-xs text-muted">
                    {percentage.toFixed(1)}%
                  </span>

                  <span className="text-sm font-semibold text-text">
                    {formatCurrency(value)}
                  </span>

                </div>

              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">

                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      percentage,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>
          );
        })}

      </div> */}

    </div>
  );
}