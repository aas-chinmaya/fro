"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Loader2,
  Search,
  X,
} from "lucide-react";

/** Inventory pick — all tax keys live here so row can apply without hardcoding */
export type SelectedItem = {
  id: string;
  name: string;
  description?: string | null;
  rate: number;
  unit: string;
  /** Full GST rate % (e.g. 18) */
  taxRate: number;
  hsnSac?: string | null;
  stock?: number | null;
  /** Optional pre-split rates (if API sends them) */
  cgstRate?: number | null;
  sgstRate?: number | null;
  igstRate?: number | null;
  cessRate?: number | null;
};

export type ItemSearchSelectProps = {
  onSelect: (item: SelectedItem | null) => void;
  onQueryChange?: (query: string) => void;
  onOpenChange?: (open: boolean) => void;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /**
   * Show stock in dropdown meta line.
   * - Quotation: false (item details only, no stock impact)
   * - Invoice: true (default) — stock-aware flows
   */
  showStock?: boolean;
};

function stripUnsafe(raw: string, max = 200): string {
  return String(raw || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/javascript\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const STATIC_INVENTORY: SelectedItem[] = [
  {
    id: "item-1",
    name: "Daikin 1.5 Ton Inverter Split Air Conditioner",
    description:
      "Energy-efficient 5-star inverter split AC with copper condenser.",
    rate: 42500,
    unit: "PCS",
    taxRate: 28,
    cgstRate: 14,
    sgstRate: 14,
    igstRate: 28,
    hsnSac: "84151010",
    stock: 12,
  },
  {
    id: "item-2",
    name: "AC Installation Service",
    description:
      "Installation of indoor and outdoor units, piping, wiring, testing.",
    rate: 2500,
    unit: "JOB",
    taxRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    hsnSac: "998719",
    stock: null,
  },
  {
    id: "item-3",
    name: "Website Development",
    description: "Custom responsive website",
    rate: 45000,
    unit: "NOS",
    taxRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    hsnSac: "998314",
    stock: null,
  },
  {
    id: "item-4",
    name: "UI/UX Design",
    description: "Figma design system + screens",
    rate: 28000,
    unit: "NOS",
    taxRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    hsnSac: "998314",
    stock: null,
  },
];

function useItemSearch(debounced: string) {
  const isLoading = false;
  const items = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return STATIC_INVENTORY;
    return STATIC_INVENTORY.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description || "").toLowerCase().includes(q) ||
        (i.hsnSac || "").toLowerCase().includes(q),
    );
  }, [debounced]);
  return { items, isLoading };
}

export default function ItemSearchSelect({
  onSelect,
  onQueryChange,
  onOpenChange,
  value = "",
  placeholder = "Enter product name",
  disabled = false,
  className = "",
  showStock = true,
}: ItemSearchSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [debounced, setDebounced] = useState("");
  const [prevValue, setPrevValue] = useState(value);

  // Sync from parent without useEffect setState (lint-safe)
  if (value !== prevValue) {
    setPrevValue(value);
    setQuery(value || "");
    if (!value) setSelectedId(null);
  }

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { items, isLoading } = useItemSearch(debounced);

  const setOpenSafe = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenSafe(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectItem = (item: SelectedItem) => {
    setSelectedId(item.id);
    setQuery(item.name);
    setOpenSafe(false);
    onSelect(item);
  };

  const clearItem = () => {
    setSelectedId(null);
    setQuery("");
    setOpenSafe(false);
    onSelect(null);
    onQueryChange?.("");
  };

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          maxLength={200}
          onFocus={() => setOpenSafe(true)}
          onChange={(e) => {
            const v = stripUnsafe(e.target.value, 200);
            setQuery(v);
            setOpenSafe(true);
            if (selectedId) {
              setSelectedId(null);
              onSelect(null);
            }
            onQueryChange?.(v);
          }}
          placeholder={placeholder}
          className="h-9 w-full min-w-0 rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-14 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/25"
        />
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {query ? (
            <button
              type="button"
              onClick={clearItem}
              className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear item"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin text-slate-400" />
          ) : (
            <ChevronDown className="size-3.5 text-slate-400" />
          )}
        </div>
      </div>

      {open ? (
        <div
          className="absolute left-0 right-0 top-full z-[400] mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl"
          role="listbox"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selectedId === item.id}
                onClick={() => selectItem(item)}
                className="flex w-full items-start gap-2 border-b border-slate-50 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ₹{item.rate.toLocaleString("en-IN")} · {item.unit}
                    {item.taxRate != null ? ` · GST ${item.taxRate}%` : ""}
                    {item.hsnSac ? ` · HSN ${item.hsnSac}` : ""}
                    {showStock && item.stock != null ? ` · Stock ${item.stock}` : ""}
                  </p>
                </div>
                {selectedId === item.id ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : null}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-slate-500">No items found</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
