"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/** Shared field chrome — same density as Product Items table labels */
export function FormField({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? "space-y-1"}>
      <Label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-[11px] text-red-500">{error}</p> : null}
    </div>
  );
}
