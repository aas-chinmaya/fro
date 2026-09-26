"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetInvoicesQuery } from "@/modules/sales/invoices/api/invoice.api";

export interface SelectedInvoice {
  id: string;
  invoiceNumber?: string | null;
  buyerName?: string | null;
  grandTotal?: number | null;
}

interface InvoiceSearchSelectProps {
  value?: string | null;
  onSelect: (invoice: SelectedInvoice | null) => void;
  label?: string;
}

/**
 * Module-local invoice picker — uses RTK useGetInvoicesQuery only.
 * Reusable inside payment-receipts forms.
 */
export function InvoiceSearchSelect({
  value,
  onSelect,
  label = "Link invoice (optional)",
}: InvoiceSearchSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data, isLoading, isFetching } = useGetInvoicesQuery({
    page: 1,
    limit: 50,
    search: query.trim() || undefined,
  });
  const invoices = data?.data ?? [];

  const selected = useMemo(
    () => invoices.find((i) => i.id === value) ?? null,
    [invoices, value],
  );

  useEffect(() => {
    if (selected?.invoiceNumber) {
      setQuery(selected.invoiceNumber);
    }
  }, [selected?.id, selected?.invoiceNumber]);

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

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const num = String(inv.invoiceNumber || "").toLowerCase();
      const name = String(inv.buyerName || "").toLowerCase();
      const id = String(inv.id || "").toLowerCase();
      return num.includes(q) || name.includes(q) || id.includes(q);
    });
  }, [invoices, query]);

  const loading = isLoading || isFetching;

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <Label className="text-xs text-slate-600">{label}</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          className="h-9 pl-8 pr-8"
          placeholder="Search invoice by number or customer…"
          value={query}
          maxLength={64}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value.trim() && value) {
              onSelect(null);
            }
          }}
        />
        {query ? (
          <button
            type="button"
            className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            onClick={() => {
              setQuery("");
              onSelect(null);
              setOpen(false);
            }}
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </div>
          ) : list.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-slate-500">
              No invoices found
            </p>
          ) : (
            list.map((inv) => {
              const active = inv.id === value;
              return (
                <button
                  key={inv.id}
                  type="button"
                  className={`flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm transition hover:bg-slate-50 ${
                    active ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    onSelect({
                      id: inv.id,
                      invoiceNumber: inv.invoiceNumber,
                      buyerName: inv.buyerName,
                      grandTotal: inv.grandTotal,
                    });
                    setQuery(String(inv.invoiceNumber || inv.id));
                    setOpen(false);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {inv.invoiceNumber || inv.id}
                    </p>
                    {inv.buyerName ? (
                      <p className="truncate text-xs text-slate-500">
                        {inv.buyerName}
                      </p>
                    ) : null}
                  </div>
                  {active ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

export default InvoiceSearchSelect;
