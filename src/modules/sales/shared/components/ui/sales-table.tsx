

"use client";

import type { ReactNode } from "react";

export function SalesTable({
  children,
  minWidth = "900px",
}: {
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className="w-full border-collapse text-sm"
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}

export function SalesTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {children}
      </tr>
    </thead>
  );
}

export function SalesTh({
  children,
  className = "",
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const alignment = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <th
      className={`whitespace-nowrap px-2 py-2.5 sm:px-3 ${alignment} ${className}`}
    >
      {children}
    </th>
  );
}

export function SalesTableFoot({ children }: { children: ReactNode }) {
  return (
    <tfoot>
      <tr className="border-t border-slate-200 bg-amber-50 text-sm font-semibold text-slate-800">
        {children}
      </tr>
    </tfoot>
  );
}

export function SalesSectionCard({
  title,
  headerRight,
  children,
}: {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-visible rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <h3 className="text-sm font-semibold tracking-tight text-slate-800">
          {title}
        </h3>

        {headerRight && (
          <div className="flex min-w-0 items-center gap-2">
            {headerRight}
          </div>
        )}
      </div>

      <div className="min-w-0 overflow-visible p-3 sm:p-4 md:p-5">
        {children}
      </div>
    </section>
  );
}

export function SalesRowAddButton({
  onClick,
  label = "Add",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full bg-primary text-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function SalesRowRemoveButton({
  onClick,
  label = "Remove",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M5 12h14" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function SalesDiscountToggle({
  value,
  onChange,
}: {
  value: "PERCENTAGE" | "FIXED";
  onChange: (value: "PERCENTAGE" | "FIXED") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
      <span className="whitespace-nowrap font-medium">Discount:</span>

      <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
        <button
          type="button"
          onClick={() => onChange("FIXED")}
          className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
            value === "FIXED"
              ? "bg-primary text-white"
              : "text-slate-600 hover:bg-white hover:text-slate-800"
          }`}
        >
          Rs
        </button>

        <button
          type="button"
          onClick={() => onChange("PERCENTAGE")}
          className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
            value === "PERCENTAGE"
              ? "bg-primary text-white"
              : "text-slate-600 hover:bg-white hover:text-slate-800"
          }`}
        >
          %
        </button>
      </div>
    </div>
  );
}