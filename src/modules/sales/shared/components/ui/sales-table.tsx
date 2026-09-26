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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ minWidth }}>
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
  const a =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";
  return <th className={`px-1 py-2.5 ${a} ${className}`}>{children}</th>;
}

export function SalesTableFoot({ children }: { children: ReactNode }) {
  return (
    <tfoot>
      <tr className="bg-amber-50 text-sm font-semibold text-slate-800">
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-3 sm:px-4">
        <h3 className="text-sm font-semibold tracking-tight text-slate-800">
          {title}
        </h3>
        {headerRight}
      </div>
      <div className="min-w-0 overflow-visible p-3 sm:p-4 md:p-5">
        {children}
      </div>
    </section>
  );
}

/** Primary + / red − row actions */
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
      className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      aria-label={label}
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
      className="grid size-6 shrink-0 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600"
      aria-label={label}
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

/** Rs / % discount toggle — primary active state */
export function SalesDiscountToggle({
  value,
  onChange,
}: {
  value: "PERCENTAGE" | "FIXED";
  onChange: (v: "PERCENTAGE" | "FIXED") => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <span>Discount :</span>
      <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5">
        <button
          type="button"
          onClick={() => onChange("FIXED")}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            value === "FIXED"
              ? "bg-primary text-primary-foreground"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Rs
        </button>
        <button
          type="button"
          onClick={() => onChange("PERCENTAGE")}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            value === "PERCENTAGE"
              ? "bg-primary text-primary-foreground"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          %
        </button>
      </div>
    </div>
  );
}
