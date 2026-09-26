"use client";

import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-rose-100 text-rose-700",
  FINALIZED: "bg-indigo-100 text-indigo-700",
  PAID: "bg-emerald-100 text-emerald-700",
  UNPAID: "bg-amber-100 text-amber-800",
  PARTIAL: "bg-sky-100 text-sky-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
};

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = (status || "DRAFT").toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STYLES[key] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status || "—"}
    </span>
  );
}
