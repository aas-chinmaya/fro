"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  extra?: ReactNode;
}

/** Standard sales list/header — reuse for quotation, invoice, receipts */
export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  extra,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {extra}
        {actionLabel && onAction ? (
          <Button className="w-full gap-2 sm:w-auto" onClick={onAction}>
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
