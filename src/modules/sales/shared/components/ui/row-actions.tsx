"use client";

import type { ReactNode } from "react";

/** Consistent right-aligned action button group for list tables */
export function RowActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-1">{children}</div>
  );
}
