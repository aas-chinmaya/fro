"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetInvoicesQuery } from "@/modules/sales/invoices/api/invoice.api";
import type { Invoice, InvoiceStatus } from "@/modules/sales/invoices/types/invoice.types";

/**
 * Purpose filters which invoice statuses are searchable.
 * credit-note → only non-draft, non-cancelled (backend rejects CANCELLED)
 * payment     → issued / partially paid / paid
 * all         → no status filter (still excludes cancelled client-side)
 */
export type InvoiceSearchPurpose = "credit-note" | "payment" | "all";

const PURPOSE_STATUSES: Record<InvoiceSearchPurpose, InvoiceStatus[] | null> = {
  "credit-note": ["ISSUED", "PARTIALLY_PAID", "PAID"],
  payment: ["ISSUED", "PARTIALLY_PAID", "PAID"],
  all: null,
};

export interface SelectedInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate?: string | null;
  invoiceStatus?: InvoiceStatus | string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerGSTIN?: string | null;
  grandTotal?: number | null;
  taxableAmount?: number | null;
  taxType?: string | null;
  placeOfSupply?: string | null;
  /** Raw invoice for optional item prefill */
  raw?: Invoice;
}

interface InvoiceSearchSelectProps {
  onSelect: (invoice: SelectedInvoice | null) => void;
  purpose?: InvoiceSearchPurpose;
  /** Limit results to this customer when set */
  customerId?: string | null;
  hideLabel?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

function statusOf(inv: Invoice): string {
  return String(
    (inv as { invoiceStatus?: string; status?: string }).invoiceStatus ||
      (inv as { status?: string }).status ||
      "",
  ).toUpperCase();
}

function numberOf(inv: Invoice): string {
  return String(
    inv.invoiceNumber ||
      (inv as { number?: string }).number ||
      inv.id ||
      "",
  );
}

function customerNameOf(inv: Invoice): string {
  const any = inv as Invoice & {
    buyerName?: string;
    customerName?: string;
    customer?: { name?: string };
  };
  return (
    any.buyerName ||
    any.customerName ||
    any.customer?.name ||
    ""
  );
}

function mapSelected(inv: Invoice): SelectedInvoice {
  const any = inv as Invoice & {
    buyerName?: string;
    customerName?: string;
    customerId?: string;
    buyerGSTIN?: string;
    customerGSTIN?: string;
    grandTotal?: number;
    totalAmount?: number;
    taxableAmount?: number;
    taxType?: string;
    placeOfSupply?: string;
  };
  return {
    id: String(inv.id),
    invoiceNumber: numberOf(inv),
    invoiceDate: inv.invoiceDate ?? null,
    invoiceStatus: statusOf(inv) as InvoiceStatus,
    customerId: any.customerId ?? null,
    customerName: customerNameOf(inv) || null,
    customerPhone:
      (any as { buyerPhone?: string }).buyerPhone ||
      (any as { customerPhone?: string }).customerPhone ||
      null,
    customerGSTIN: any.buyerGSTIN || any.customerGSTIN || null,
    grandTotal: Number(any.grandTotal ?? any.totalAmount ?? 0) || null,
    taxableAmount: Number(any.taxableAmount ?? 0) || null,
    taxType: any.taxType ?? null,
    placeOfSupply: any.placeOfSupply ?? null,
    raw: inv,
  };
}

export default function InvoiceSearchSelect({
  onSelect,
  purpose = "credit-note",
  customerId,
  hideLabel = false,
  required = false,
  disabled = false,
  placeholder = "Search invoice number or customer…",
}: InvoiceSearchSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedInvoice | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // Backend list accepts a single status; we fetch without status and filter client-side
  // when multiple statuses are allowed (optimistic, less round-trips).
  const { data, isLoading, isFetching } = useGetInvoicesQuery(
    {
      page: 1,
      limit: 30,
      search: debounced || undefined,
    },
    { skip: disabled },
  );

  const allowed = PURPOSE_STATUSES[purpose];

  const rows = useMemo(() => {
    const list = data?.data ?? [];
    return list.filter((inv) => {
      const st = statusOf(inv);
      if (st === "CANCELLED" || st === "DRAFT") return false;
      if (allowed && !allowed.includes(st as InvoiceStatus)) return false;
      if (customerId && String((inv as { customerId?: string }).customerId) !== customerId) {
        return false;
      }
      return true;
    });
  }, [data?.data, allowed, customerId]);

  const pick = (inv: Invoice) => {
    const mapped = mapSelected(inv);
    setSelected(mapped);
    setQuery(mapped.invoiceNumber);
    setOpen(false);
    onSelect(mapped);
  };

  const clear = () => {
    setSelected(null);
    setQuery("");
    setOpen(false);
    onSelect(null);
  };

  const loading = isLoading || isFetching;

  return (
    <div ref={containerRef} className="relative w-full">
      {!hideLabel ? (
        <Label className="mb-2 block text-xs font-medium text-slate-600">
          Sales invoice
          {required ? <span className="ml-0.5 text-red-500">*</span> : null}
        </Label>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          disabled={disabled}
          onFocus={() => !disabled && setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (selected) {
              setSelected(null);
              onSelect(null);
            }
          }}
          placeholder={placeholder}
          className="h-10 bg-white pl-9 pr-16"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading ? (
            <Loader2 className="size-4 animate-spin text-slate-400" />
          ) : null}
          {query ? (
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="grid size-7 cursor-pointer place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear invoice"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {open && !disabled ? (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {rows.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-500">
              {loading
                ? "Searching…"
                : purpose === "credit-note"
                  ? "No eligible invoices (issued / paid only)"
                  : "No invoices found"}
            </p>
          ) : (
            <ul className="py-1">
              {rows.map((inv) => {
                const num = numberOf(inv);
                const name = customerNameOf(inv);
                const st = statusOf(inv);
                const isActive = selected?.id === inv.id;
                return (
                  <li key={inv.id}>
                    <button
                      type="button"
                      onClick={() => pick(inv)}
                      className={`flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${
                        isActive ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {num}
                        </p>
                        <p className="truncate text-xs text-slate-600">
                          {[name, st].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      {isActive ? (
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
