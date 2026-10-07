"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent } from "react";
import {
  Boxes,
  Check,
  ChevronRight,
  Layers3,
  MapPin,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  Warehouse,
  X,
} from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { notify } from "@/lib/toast";
import { useAppSelector } from "@/store/hooks";
import { useRacks } from "../hooks/useRacks";
import { binService } from "../services/bin.service";
import { rackService } from "../services/rack.service";
import { shelfService } from "../services/shelf.service";
import { getWarehouseErrorMessage } from "../utils/errors";
import type { BinInput, BinRecord, RackInput, RackRecord, ShelfInput, ShelfRecord, ShelfUpdateInput, WarehouseStatus } from "../types";

type Selection = { kind: "rack" | "shelf" | "bin"; id: string };
type Editor = { mode: "create" | "edit"; kind: Selection["kind"] };
type BinState = "empty" | "occupied" | "partial" | "full" | "inactive" | "untracked";
type EnrichedRecord = {
  occupancyStatus?: unknown;
  isActive?: unknown;
  quantity?: unknown;
  stockQuantity?: unknown;
  capacity?: unknown;
  productName?: unknown;
  itemName?: unknown;
  productCode?: unknown;
  itemCode?: unknown;
  product?: unknown;
  products?: unknown;
};

interface ShelfNode {
  record: ShelfRecord;
  bins: BinRecord[];
}

interface RackNode {
  record: RackRecord;
  shelves: ShelfNode[];
}

const stateStyles: Record<BinState, string> = {
  empty: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  occupied: "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100",
  partial: "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100",
  full: "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100",
  inactive: "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200",
  untracked: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
};

const stateLabels: Record<BinState, string> = {
  empty: "Empty",
  occupied: "Occupied",
  partial: "Partially occupied",
  full: "Full",
  inactive: "Inactive",
  untracked: "Not tracked",
};

function apiRecord(record: unknown) {
  return (record ?? {}) as EnrichedRecord;
}

function recordId(record: { id?: unknown; _id?: unknown }) {
  return String(record.id ?? record._id ?? "");
}

function isActive(record: unknown) {
  const value = apiRecord(record);
  const rawStatus = (record as { status?: unknown } | null)?.status;
  if (value.isActive === false || rawStatus === false) return false;
  const status = String(rawStatus ?? "").toLowerCase();
  return status !== "inactive" && status !== "false";
}

function getBinState(record: BinRecord): BinState {
  const value = apiRecord(record);
  if (!isActive(record)) return "inactive";

  const occupancy = String(value.occupancyStatus ?? "").toLowerCase().replaceAll("_", " ");
  if (occupancy.includes("full")) return "full";
  if (occupancy.includes("partial")) return "partial";
  if (occupancy.includes("occupied")) return "occupied";
  if (occupancy === "free" || occupancy.includes("empty") || occupancy.includes("available")) return "empty";

  const quantity = Number(value.quantity ?? value.stockQuantity);
  const capacity = Number(value.capacity);
  if (Number.isFinite(quantity)) {
    if (quantity <= 0) return "empty";
    if (Number.isFinite(capacity) && capacity > 0) return quantity >= capacity ? "full" : "partial";
    return "occupied";
  }
  if (value.productName || value.itemName || value.productCode || value.itemCode || value.product || value.products) return "occupied";
  return "untracked";
}

function getProductDetails(record: BinRecord) {
  const value = apiRecord(record);
  const product = value.product && typeof value.product === "object" ? value.product as Record<string, unknown> : {};
  const firstProduct = Array.isArray(value.products) && value.products[0] && typeof value.products[0] === "object"
    ? value.products[0] as Record<string, unknown>
    : {};
  const name = value.productName ?? value.itemName ?? product.name ?? product.productName ?? firstProduct.name ?? firstProduct.productName;
  const code = value.productCode ?? value.itemCode ?? product.code ?? product.productCode ?? firstProduct.code ?? firstProduct.productCode;
  const quantity = value.quantity ?? value.stockQuantity ?? product.quantity ?? firstProduct.quantity;
  return { name, code, quantity };
}

function getBinStockKnowledge(record: BinRecord) {
  const value = apiRecord(record);
  const occupancy = String(value.occupancyStatus ?? "").toLowerCase().replaceAll("_", " ");
  const quantityValue = value.quantity ?? value.stockQuantity;
  const quantity = Number(quantityValue);
  const hasProduct = Boolean(value.productName || value.itemName || value.productCode || value.itemCode || value.product || value.products);
  if (occupancy.includes("occupied") || occupancy.includes("partial") || occupancy.includes("full")) return "occupied";
  if (Number.isFinite(quantity)) return quantity > 0 ? "occupied" : "empty";
  if (hasProduct) return "occupied";
  if (occupancy === "free" || occupancy.includes("empty") || occupancy.includes("available")) return "empty";
  return "unknown";
}

function formatName(value: unknown, fallback: string) {
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function countOccupied(bins: BinRecord[]) {
  return bins.filter((bin) => ["occupied", "partial", "full"].includes(getBinState(bin))).length;
}

function orderBinsByNumber(bins: BinRecord[]) {
  return [...bins].sort((left, right) => String(left.binNo).localeCompare(String(right.binNo), undefined, { numeric: true, sensitivity: "base" }));
}

function locationSearchText(record: unknown) {
  const value = apiRecord(record);
  const product = getProductDetails(record as BinRecord);
  return [
    (record as { rackNo?: unknown; shelfNo?: unknown; binNo?: unknown }).rackNo,
    (record as { rackNo?: unknown; shelfNo?: unknown; binNo?: unknown }).shelfNo,
    (record as { rackNo?: unknown; shelfNo?: unknown; binNo?: unknown }).binNo,
    value.productName,
    value.itemName,
    value.productCode,
    value.itemCode,
    product.name,
    product.code,
  ].filter(Boolean).join(" ").toLowerCase();
}

export default function WarehouseMap() {
  const userId = useAppSelector((state) => state.auth.user?.id ?? "");
  const { racks, loading: racksLoading, refetch: refreshRacks, setSearch: setRackSearch } = useRacks(1000);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [shelfBinCount, setShelfBinCount] = useState("");
  const [rackShelfEditorOpen, setRackShelfEditorOpen] = useState(false);
  const [rackShelfCount, setRackShelfCount] = useState("");
  const [rackShelfEditorMode, setRackShelfEditorMode] = useState<"add" | "edit">("add");
  const [deleteTarget, setDeleteTarget] = useState<Selection | null>(null);
  const [busy, setBusy] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const loading = racksLoading;

  useEffect(() => {
    const timeout = window.setTimeout(() => setRackSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search, setRackSearch]);

  const rackNodes: RackNode[] = useMemo(() => racks.map((rack) => ({
      record: rack,
      shelves: (rack.shelves ?? []).map((shelf) => {
        const shelfRecord: ShelfRecord = {
          ...shelf,
          id: recordId(shelf),
          rackId: String(shelf.rackId ?? shelf.rack?.id ?? rack.id),
        };
        return {
          record: shelfRecord,
          bins: (shelf.bins ?? []).map((bin) => ({
            ...bin,
            id: recordId(bin),
            shelfId: String(bin.shelfId ?? bin.shelf?.id ?? shelfRecord.id),
          })),
        };
      }),
    })), [racks]);
  const totalShelves = rackNodes.reduce((count, rack) => count + rack.shelves.length, 0);
  const allBins = rackNodes.flatMap((rack) => rack.shelves.flatMap((shelf) => shelf.bins));
  const occupiedBins = countOccupied(allBins);
  const emptyBins = allBins.filter((bin) => getBinState(bin) === "empty").length;
  const trackedBins = allBins.filter((bin) => !["inactive", "untracked"].includes(getBinState(bin))).length;
  const occupancy = trackedBins ? Math.round((occupiedBins / trackedBins) * 100) : 0;
  const query = search.trim().toLowerCase();

  const selectedRackNode = selection
    ? rackNodes.find((node) => node.record.id === selection.id || node.shelves.some((shelf) => shelf.record.id === selection.id || shelf.bins.some((bin) => bin.id === selection.id)))
    : undefined;
  const selectedShelfNode = selection?.kind === "shelf" || selection?.kind === "bin"
    ? selectedRackNode?.shelves.find((shelf) => shelf.record.id === selection.id || shelf.bins.some((bin) => bin.id === selection.id))
    : undefined;
  const selectedBin = selection?.kind === "bin"
    ? selectedShelfNode?.bins.find((bin) => bin.id === selection.id)
    : undefined;
  const selectedRecord = selection?.kind === "rack"
    ? selectedRackNode?.record
    : selection?.kind === "shelf"
      ? selectedShelfNode?.record
      : selectedBin;
  const selectedName = selection?.kind === "rack"
    ? `Rack ${selectedRackNode?.record.rackNo ?? ""}`
    : selection?.kind === "shelf"
      ? `Shelf ${selectedShelfNode?.record.shelfNo ?? ""}`
      : `Bin ${selectedBin?.binNo ?? ""}`;
  const editorRecord = editor?.mode === "edit" ? selectedRecord : undefined;
  const selectedProduct = selectedBin ? getProductDetails(selectedBin) : null;

  function refreshMap() {
    refreshRacks();
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    const nextQuery = value.trim().toLowerCase();
    if (!nextQuery) return;
    const match = rackNodes
      .flatMap((rack) => [
        { kind: "rack" as const, id: rack.record.id, record: rack.record },
        ...rack.shelves.flatMap((shelf) => [
          { kind: "shelf" as const, id: shelf.record.id, record: shelf.record },
          ...shelf.bins.map((bin) => ({ kind: "bin" as const, id: bin.id, record: bin })),
        ]),
      ])
      .find((item) => locationSearchText(item.record).includes(nextQuery));
    if (!match) return;
    setSelection({ kind: match.kind, id: match.id });
    document.getElementById(`warehouse-location-${match.id}`)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  }

  function isSearchMatch(record: unknown) {
    return !!query && locationSearchText(record).includes(query);
  }

  useEffect(() => {
    if (!query || racksLoading) return;
    const match = rackNodes
      .flatMap((rack) => [
        { kind: "rack" as const, id: rack.record.id, record: rack.record },
        ...rack.shelves.flatMap((shelf) => [
          { kind: "shelf" as const, id: shelf.record.id, record: shelf.record },
          ...shelf.bins.map((bin) => ({ kind: "bin" as const, id: bin.id, record: bin })),
        ]),
      ])
      .find((item) => locationSearchText(item.record).includes(query));
    if (!match) return;
    const timeout = window.setTimeout(() => {
      setSelection({ kind: match.kind, id: match.id });
      document.getElementById(`warehouse-location-${match.id}`)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [query, rackNodes, racksLoading]);

  function handlePanStart(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button, input, select")) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    dragRef.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function handlePanMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || !viewport) return;
    viewport.scrollLeft = drag.left - (event.clientX - drag.x);
    viewport.scrollTop = drag.top - (event.clientY - drag.y);
  }

  function handlePanEnd() {
    dragRef.current = null;
    setDragging(false);
  }

  function openCreate(kind: Selection["kind"]) {
    setEditor({ mode: "create", kind });
  }

  function openEdit() {
    if (!selection) return;
    if (selection.kind === "shelf") setShelfBinCount(String(selectedShelfNode?.bins.length ?? 0));
    setEditor({ mode: "edit", kind: selection.kind });
  }

  function openRackShelfEditor(mode: "add" | "edit") {
    if (!selectedRackNode) return;
    setRackShelfEditorMode(mode);
    setRackShelfCount(String(selectedRackNode.shelves.length));
    setRackShelfEditorOpen(true);
  }

  async function handleRackShelfSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRackNode) return;
    const requestedCount = Number(rackShelfCount);
    if (!Number.isSafeInteger(requestedCount) || requestedCount < 0) {
      notify.error("Enter a valid whole number of shelves.");
      return;
    }

    const currentShelves = selectedRackNode.shelves;
    const change = requestedCount - currentShelves.length;
    const shelvesToRemove = change < 0
      ? [...currentShelves]
        .sort((left, right) => String(right.record.shelfNo).localeCompare(String(left.record.shelfNo), undefined, { numeric: true, sensitivity: "base" }))
        .filter((shelf) => shelf.bins.length === 0)
        .slice(0, Math.abs(change))
      : [];
    if (change < 0 && shelvesToRemove.length !== Math.abs(change)) {
      notify.error("Only shelves without bins can be removed. Move or remove the bins first.");
      return;
    }

    setBusy(true);
    try {
      if (change > 0) {
        const usedShelfNumbers = new Set(currentShelves.map((shelf) => shelf.record.shelfNo.trim().toLowerCase()));
        const numericShelfNumbers = currentShelves
          .map((shelf) => Number(shelf.record.shelfNo))
          .filter((number) => Number.isSafeInteger(number) && number > 0);
        let nextShelfNumber = Math.max(currentShelves.length, ...numericShelfNumbers) + 1;
        for (let index = 0; index < change; index += 1) {
          while (usedShelfNumbers.has(String(nextShelfNumber).toLowerCase())) nextShelfNumber += 1;
          const shelfNo = String(nextShelfNumber);
          await shelfService.createShelf({
            rackId: selectedRackNode.record.id,
            shelfNo,
            status: "active",
          });
          usedShelfNumbers.add(shelfNo.toLowerCase());
          nextShelfNumber += 1;
        }
      } else if (change < 0) {
        for (const shelf of shelvesToRemove) {
          await shelfService.deleteShelf(shelf.record.id);
        }
      }
      notify.success("Rack shelf count updated.");
      setRackShelfEditorOpen(false);
      refreshMap();
    } catch (error) {
      refreshMap();
      notify.error(getWarehouseErrorMessage(error, "Unable to update the rack shelf count. Some changes may already have been saved."));
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const data = new FormData(event.currentTarget);
    const status = String(data.get("status") ?? "active") as WarehouseStatus;
    const binCountValue = data.get("binCount");
    const requestedBinCount = typeof binCountValue === "string" && binCountValue.trim() ? Number(binCountValue) : Number.NaN;
    if (editor.kind === "shelf" && editor.mode === "edit") {
      if (!Number.isSafeInteger(requestedBinCount) || requestedBinCount < 0) {
        notify.error("Enter a valid whole number of bins.");
        return;
      }
      const orderedBins = orderBinsByNumber(selectedShelfNode?.bins ?? []);
      const binsToRemove = orderedBins.slice(requestedBinCount);
      const blockedBin = binsToRemove.find((bin) => getBinStockKnowledge(bin) !== "empty");
      if (blockedBin) {
        notify.error(getBinStockKnowledge(blockedBin) === "occupied"
          ? `Cannot reduce bins from ${orderedBins.length} to ${requestedBinCount} because Bin ${blockedBin.binNo} contains stock. Move the stock before removing this bin.`
          : `Cannot reduce bins because Bin ${blockedBin.binNo} stock status is unavailable. Verify it is empty before removing this bin.`);
        return;
      }
    }
    setBusy(true);
    try {
      if (editor.kind === "rack") {
        const payload: RackInput = { rackNo: String(data.get("rackNo") ?? "").trim(), status };
        if (editor.mode === "create") await rackService.createRack(payload);
        else if (selection) await rackService.updateRack(selection.id, payload);
      } else if (editor.kind === "shelf") {
        const payload: ShelfInput = { rackId: String(data.get("rackId") ?? ""), shelfNo: String(data.get("shelfNo") ?? "").trim(), status };
        if (editor.mode === "create") {
          await shelfService.createShelf(payload);
        } else if (selection) {
          const shelf = selectedShelfNode?.record;
          if (!shelf) throw new Error("Selected shelf is unavailable.");
          const updatePayload: ShelfUpdateInput = {
            shelfId: shelf.id,
            rackId: shelf.rackId,
            shelfNo: shelf.shelfNo,
            status,
            binNo: requestedBinCount,
            isActive: status === "active",
          };
          await shelfService.updateShelf(selection.id, updatePayload);
        }
      } else {
        const payload: BinInput = { shelfId: String(data.get("shelfId") ?? ""), binNo: String(data.get("binNo") ?? "").trim(), status };
        if (editor.mode === "create") await binService.createBin(payload);
        else if (selection) await binService.updateBin(selection.id, payload);
      }
      notify.success(`${editor.kind[0].toUpperCase()}${editor.kind.slice(1)} ${editor.mode === "create" ? "created" : "updated"}.`);
      setEditor(null);
      refreshMap();
    } catch (error) {
      if (editor.kind === "shelf" && editor.mode === "edit") refreshMap();
      notify.error(getWarehouseErrorMessage(error, `Unable to ${editor.mode} ${editor.kind}. Please try again.`));
    } finally {
      setBusy(false);
    }
  }

  function requestDelete(target: Selection) {
    if (target.kind === "rack") {
      const rack = rackNodes.find((node) => node.record.id === target.id);
      if (rack?.shelves.length) {
        notify.error("This rack still contains shelves. Delete or move its shelves before deleting the rack.");
        return;
      }
    }
    if (target.kind === "bin") {
      const bin = rackNodes.flatMap((rack) => rack.shelves.flatMap((shelf) => shelf.bins)).find((item) => item.id === target.id);
      if (bin && getBinStockKnowledge(bin) !== "empty") {
        notify.error(getBinStockKnowledge(bin) === "occupied"
          ? "This bin has stock assigned. Move or remove the stock before deleting the bin."
          : "Stock status is unavailable for this bin. Verify it is empty before deleting it.");
        return;
      }
    }
    setDeleteTarget(target);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      if (deleteTarget.kind === "rack") await rackService.deleteRack(deleteTarget.id);
      else if (deleteTarget.kind === "shelf") await shelfService.deleteShelf(deleteTarget.id);
      else await binService.deleteBin(deleteTarget.id);
      notify.success("Location deleted.");
      setSelection(null);
      setDeleteTarget(null);
      refreshMap();
    } catch (error) {
      notify.error(getWarehouseErrorMessage(error, "Unable to delete this location. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  const editorParent = editor?.kind === "shelf"
    ? selectedRackNode?.record.id
    : editor?.kind === "bin"
      ? selectedShelfNode?.record.id
      : "";
  const deleteName = deleteTarget?.kind === "rack"
    ? `Rack ${rackNodes.find((rack) => rack.record.id === deleteTarget.id)?.record.rackNo ?? ""}`
    : deleteTarget?.kind === "shelf"
      ? `Shelf ${rackNodes.flatMap((rack) => rack.shelves).find((shelf) => shelf.record.id === deleteTarget.id)?.record.shelfNo ?? ""}`
      : `Bin ${allBins.find((bin) => bin.id === deleteTarget?.id)?.binNo ?? ""}`;

  const visibleRacks = rackNodes.filter((rack) => activityFilter === "all" || (activityFilter === "active" ? isActive(rack.record) : !isActive(rack.record)));

  return (
    <main className="space-y-6 pb-4">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full py-1 text-sm font-semibold uppercase tracking-[0.12em] text-primary">
            <Warehouse size={14} aria-hidden="true" /> Warehouse operations
          </div>
         
          <p className="mt-1 max-w-2xl text-sm text-slate-600">Explore your physical storage layout from rack to bin.</p>
        </div>
        <Button className="shadow-sm shadow-primary/20" type="button" onClick={() => openCreate("rack")}>
          <Plus size={16} aria-hidden="true" /> Add rack
        </Button>
      </header>

      <section aria-label="Warehouse summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Racks", value: racks.length, icon: Warehouse, color: "bg-secondary text-primary" },
          { label: "Shelves", value: totalShelves, icon: Layers3, color: "bg-indigo-50 text-indigo-600" },
          { label: "Bins", value: allBins.length, icon: Boxes, color: "bg-sky-50 text-sky-600" },
          { label: "Occupied", value: occupiedBins, icon: Package, color: "bg-amber-50 text-amber-600" },
          { label: "Empty", value: emptyBins, icon: Check, color: "bg-emerald-50 text-emerald-600" },
          { label: "Occupancy", value: trackedBins ? `${occupancy}%` : "—", icon: MapPin, color: "bg-violet-50 text-violet-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex min-h-24 items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm shadow-slate-200/50 transition-shadow hover:shadow-md sm:px-4">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${color}`}><Icon size={18} aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-0.5 truncate text-xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60" aria-label="Interactive warehouse floor map">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3.5 sm:px-5">
            <div className="relative min-w-[220px] flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
              <Input
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Find rack, shelf, bin, product or code"
                aria-label="Search warehouse locations and products"
                className="pl-9 pr-9"
              />
              {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"><X size={15} /></button>}
            </div>
            <div className="flex items-center gap-2">
              <select aria-label="Filter racks by status" value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)} className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-700">
                <option value="all">All racks</option><option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
              <div className="flex items-center border-l border-slate-200 pl-2">
                <button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(0.65, Number((value - 0.1).toFixed(2))))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-secondary hover:text-primary"><Minus size={16} /></button>
                <span className="w-12 text-center text-xs tabular-nums text-slate-500">{Math.round(zoom * 100)}%</span>
                <button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1.5, Number((value + 0.1).toFixed(2))))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-secondary hover:text-primary"><Plus size={16} /></button>
                <button type="button" title="Reset view" aria-label="Reset zoom and map position" onClick={() => { setZoom(1); if (viewportRef.current) { viewportRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" }); } }} className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-secondary hover:text-primary"><RotateCcw size={15} /></button>
              </div>
            </div>
          </div>

          <div
            ref={viewportRef}
            className={`max-h-[72vh] min-h-[420px] overflow-auto bg-slate-50 [background-size:18px_18px]`}
            onPointerDown={handlePanStart}
            onPointerMove={handlePanMove}
            onPointerUp={handlePanEnd}
            onPointerCancel={handlePanEnd}
          >
            {loading ? (
              <div className="grid min-h-[420px] place-items-center text-sm text-slate-500">Loading warehouse locations...</div>
            ) : visibleRacks.length === 0 ? (
              <div className="grid min-h-[420px] place-items-center px-6 text-center">
                <div><Warehouse className="mx-auto mb-3 text-slate-300" size={34} aria-hidden="true" /><p className="font-medium text-slate-700">{racks.length ? "No racks match this filter" : "Your warehouse is ready to map"}</p><p className="mt-1 text-sm text-slate-500">{racks.length ? "Choose another rack status filter." : "Create your first rack to start laying out storage."}</p>{!racks.length && <Button className="mt-4" type="button" onClick={() => openCreate("rack")}><Plus size={16} /> Add first rack</Button>}</div>
              </div>
            ) : (
              <div style={{ width: `${zoom * 100}%` }} className="min-h-full p-5 sm:p-7">
                <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%` }}>
                  <div className="grid min-w-[790px] grid-cols-[repeat(auto-fill,minmax(245px,1fr))] gap-5">
                    {visibleRacks.map((rack) => {
                      const rackSelected = selection?.kind === "rack" && selection.id === rack.record.id;
                      const rackSearchHit = isSearchMatch(rack.record) || rack.shelves.some((shelf) => isSearchMatch(shelf.record) || shelf.bins.some(isSearchMatch));
                      const rackBins = rack.shelves.flatMap((shelf) => shelf.bins);
                      const percentage = rackBins.length ? Math.round((countOccupied(rackBins) / rackBins.length) * 100) : 0;
                      return (
                        <article
                          key={rack.record.id}
                          id={`warehouse-location-${rack.record.id}`}
                          onClick={(event) => {
                            if ((event.target as HTMLElement).closest("button, input, select, a")) return;
                            setSelection({ kind: "rack", id: rack.record.id });
                          }}
                          className={`min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm shadow-slate-300/50 transition duration-200 ${rackSelected ? "border-primary ring-2 ring-primary/30 shadow-md shadow-primary/10" : rackSearchHit ? "border-amber-500 ring-2 ring-amber-300/50" : "border-slate-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"} ${query && !rackSearchHit ? "opacity-45" : ""}`}
                        >
                          <button type="button" onClick={() => setSelection({ kind: "rack", id: rack.record.id })} className="flex w-full items-center justify-between gap-3 border-b-4 border-primary bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3.5 text-left text-white transition hover:from-slate-800 hover:to-slate-700">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold tracking-wide">Rack {rack.record.rackNo}</span>
                              <span className="mt-1 block text-[11px] text-slate-300">{rack.shelves.length} shelves · {rackBins.length} bins</span>
                            </span>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${isActive(rack.record) ? "bg-emerald-400/15 text-emerald-200" : "bg-slate-600 text-slate-200"}`}>{isActive(rack.record) ? "Active" : "Inactive"}</span>
                          </button>
                          <div className="space-y-2 border-x-[7px] border-slate-300 bg-slate-100/90 p-2.5">
                            {rack.shelves.length ? rack.shelves.map((shelf) => {
                              const shelfSelected = selection?.kind === "shelf" && selection.id === shelf.record.id;
                              const shelfSearchHit = isSearchMatch(shelf.record) || shelf.bins.some(isSearchMatch);
                              return (
                                <div id={`warehouse-location-${shelf.record.id}`} key={shelf.record.id} className={`relative rounded-lg border bg-white p-2.5 shadow-sm transition ${shelfSelected ? "border-primary ring-2 ring-primary/25 shadow-md shadow-primary/10" : shelfSearchHit ? "border-amber-500 ring-2 ring-amber-300/50" : "border-slate-200 hover:border-slate-300"} ${query && !shelfSearchHit && !isSearchMatch(rack.record) ? "opacity-50" : ""}`}>
                                    <button type="button" aria-label={`Select Shelf ${shelf.record.shelfNo}`} aria-pressed={shelfSelected} onClick={() => setSelection({ kind: "shelf", id: shelf.record.id })} className="absolute inset-0 z-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
                                    <div className="relative z-10 pointer-events-none">
                                      <div className="mb-2 flex w-full items-center justify-between gap-2 text-left">
                                        <span className="truncate text-xs font-semibold text-slate-800">Shelf {shelf.record.shelfNo}</span>
                                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{shelf.bins.length} bins</span>
                                      </div>
                                      {shelf.bins.length ? (
                                        <div className="grid grid-cols-4 gap-1.5">
                                      {shelf.bins.map((bin) => {
                                        const binStatus = getBinState(bin);
                                        const binSelected = selection?.kind === "bin" && selection.id === bin.id;
                                        const binMatch = isSearchMatch(bin);
                                        return (
                                          <button
                                            id={`warehouse-location-${bin.id}`}
                                            key={bin.id}
                                            type="button"
                                            aria-label={`Bin ${bin.binNo}, ${stateLabels[binStatus]}`}
                                            title={`Bin ${bin.binNo} · ${stateLabels[binStatus]}`}
                                            onClick={() => setSelection({ kind: "bin", id: bin.id })}
                                            className={`pointer-events-auto min-w-0 truncate rounded-md border px-1 py-1.5 text-[10px] font-semibold shadow-sm transition hover:-translate-y-px hover:shadow ${stateStyles[binStatus]} ${binSelected ? "outline outline-2 outline-offset-1 outline-primary" : ""} ${binMatch ? "ring-2 ring-amber-500 ring-offset-1" : ""} ${query && !binMatch && !isSearchMatch(shelf.record) && !isSearchMatch(rack.record) ? "opacity-45" : ""}`}
                                          >{bin.binNo}</button>
                                        );
                                      })}
                                      </div>
                                    ) : <p className="py-1 text-center text-[10px] text-slate-400">No bins</p>}
                                  </div>
                                </div>
                              );
                            }) : <p className="py-5 text-center text-xs text-slate-500">No shelves on this rack</p>}
                            {rackSelected && <button type="button" onClick={() => openRackShelfEditor("add")} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white/80 py-2 text-[11px] font-medium text-slate-600 transition hover:border-primary hover:bg-secondary hover:text-primary"><Plus size={13} /> Add shelf</button>}
                          </div>
                          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-white px-3 py-2.5 text-[11px] text-slate-600">
                            <span>{countOccupied(rackBins)} / {rackBins.length} occupied</span>
                            <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-primary transition-[width]" style={{ width: `${percentage}%` }} /></span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  <button type="button" onClick={() => openCreate("rack")} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/80 text-sm font-medium text-slate-600 transition hover:border-primary hover:bg-secondary hover:text-primary"><Plus size={16} /> Add rack</button>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60 xl:sticky xl:top-4" aria-label="Selected warehouse location details">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 px-4 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Location details</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{selection ? selectedName : "Select a location"}</h2>
            </div>
            {selection && <button type="button" onClick={() => setSelection(null)} aria-label="Clear location selection" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={17} /></button>}
          </div>
          {selection && selectedRecord ? (
            <div className="px-4 py-4">
              <nav aria-label="Location breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-500">
                <span>Warehouse</span><ChevronRight size={13} />
                {selectedRackNode && <><span className={selection.kind === "rack" ? "font-semibold text-primary" : ""}>Rack {selectedRackNode.record.rackNo}</span>{selection.kind !== "rack" && <ChevronRight size={13} />}</>}
                {selectedShelfNode && <><span className={selection.kind === "shelf" ? "font-semibold text-primary" : ""}>Shelf {selectedShelfNode.record.shelfNo}</span>{selection.kind === "bin" && <ChevronRight size={13} />}</>}
                {selectedBin && <span className="font-semibold text-primary">Bin {selectedBin.binNo}</span>}
              </nav>

              <dl className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm">
                {selection.kind === "rack" && <>
                  <DetailRow label="Shelves" value={selectedRackNode?.shelves.length ?? 0} />
                  <DetailRow label="Bins" value={selectedRackNode?.shelves.reduce((count, shelf) => count + shelf.bins.length, 0) ?? 0} />
                  <DetailRow label="Occupancy" value={`${countOccupied(selectedRackNode?.shelves.flatMap((shelf) => shelf.bins) ?? [])} bins`} />
                </>}
                {selection.kind === "shelf" && <>
                  <DetailRow label="Rack" value={selectedRackNode?.record.rackNo ?? "—"} />
                  <DetailRow label="Bins" value={selectedShelfNode?.bins.length ?? 0} />
                  <DetailRow label="Occupancy" value={`${countOccupied(selectedShelfNode?.bins ?? [])} bins`} />
                </>}
                {selection.kind === "bin" && selectedBin && <>
                  <DetailRow label="Status" value={stateLabels[getBinState(selectedBin)]} />
                  <DetailRow label="Product" value={selectedProduct?.name ?? "No product linked"} />
                  <DetailRow label="Item code" value={selectedProduct?.code ?? "—"} />
                  <DetailRow label="Quantity" value={selectedProduct?.quantity ?? "—"} />
                </>}
                <DetailRow label="Record status" value={isActive(selectedRecord) ? "Active" : "Inactive"} />
              </dl>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                {selection.kind === "rack" && <button type="button" onClick={() => openRackShelfEditor("add")} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-white hover:opacity-90"><Plus size={14} /> Add shelf</button>}
                {selection.kind === "rack" && <button type="button" onClick={() => openRackShelfEditor("edit")} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">Edit</button>}
                {selection.kind === "shelf" && selectedShelfNode?.bins.length === 0 && <button type="button" onClick={() => openCreate("bin")} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-white hover:opacity-90"><Plus size={14} /> Add bin</button>}
                {selection.kind === "bin" && <button type="button" onClick={() => setStockDialogOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-white hover:opacity-90"><Package size={14} /> Stock details</button>}
                {selection.kind === "shelf" && <button type="button" onClick={openEdit} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><span aria-hidden="true">Edit</span></button>}
                <button type="button" onClick={() => requestDelete(selection)} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-rose-200 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50"><span aria-hidden="true">Delete</span></button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-8 text-sm leading-6 text-slate-500">
              <MapPin className="mb-3 text-primary" size={20} aria-hidden="true" />
              <p>Select a rack, shelf, or bin on the map to inspect its location, status, and available operations.</p>
            </div>
          )}
          <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500">{userId ? `${racks.length} racks loaded` : "Waiting for account"} · drag the map to navigate</div>
        </aside>
      </div>

      <Dialog open={!!editor} onOpenChange={(open) => !open && !busy && setEditor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editor?.kind === "shelf" && editor.mode === "edit" ? "Edit Shelf" : editor ? `${editor.mode === "create" ? "Add" : "Edit"} ${editor.kind}` : "Location"}</DialogTitle>
            <DialogDescription>{editor?.kind === "shelf" && editor.mode === "create" ? "Add a shelf directly to the selected rack." : editor?.kind === "bin" && editor.mode === "create" ? "Add a bin directly to the selected shelf." : "Update the warehouse location details."}</DialogDescription>
          </DialogHeader>
          {editor && <form key={`${editor.mode}-${editor.kind}-${selection?.id ?? "new"}`} onSubmit={handleSave} className="space-y-4">
            {editor.kind === "rack" && <div className="space-y-2"><Label htmlFor="warehouse-rack-no">Rack name/number</Label><Input id="warehouse-rack-no" name="rackNo" required maxLength={80} defaultValue={(editorRecord as RackRecord | undefined)?.rackNo ?? ""} /></div>}
            {editor.kind === "shelf" && (editor.mode === "edit" ? <>
              <div className="space-y-2"><Label htmlFor="warehouse-rack-no-readonly">Rack number</Label><Input id="warehouse-rack-no-readonly" value={selectedRackNode?.record.rackNo ?? ""} readOnly /></div>
              <div className="space-y-2"><Label htmlFor="warehouse-shelf-no-readonly">Shelf number</Label><Input id="warehouse-shelf-no-readonly" value={(editorRecord as ShelfRecord | undefined)?.shelfNo ?? ""} readOnly /></div>
              <div className="space-y-2"><Label htmlFor="warehouse-bin-count">Bin numbers</Label><Input id="warehouse-bin-count" name="binCount" type="number" min={0} step={1} required value={shelfBinCount} onChange={(event) => setShelfBinCount(event.target.value)} /></div>
            </> : <>
              <div className="space-y-2"><Label htmlFor="warehouse-rack-id">Rack</Label><select id="warehouse-rack-id" name="rackId" required defaultValue={editorParent} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Select rack</option>{racks.map((rack) => <option key={rack.id} value={rack.id}>Rack {rack.rackNo}</option>)}</select></div>
              <div className="space-y-2"><Label htmlFor="warehouse-shelf-no">Shelf name/number</Label><Input id="warehouse-shelf-no" name="shelfNo" required maxLength={80} /></div>
            </>)}
            {editor.kind === "bin" && <>
              <div className="space-y-2"><Label htmlFor="warehouse-shelf-id">Shelf</Label><select id="warehouse-shelf-id" name="shelfId" required defaultValue={(editorRecord as BinRecord | undefined)?.shelfId ?? editorParent} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Select shelf</option>{rackNodes.flatMap((rack) => rack.shelves.map((shelf) => <option key={shelf.record.id} value={shelf.record.id}>Rack {rack.record.rackNo} · Shelf {shelf.record.shelfNo}</option>))}</select></div>
              <div className="space-y-2"><Label htmlFor="warehouse-bin-no">Bin name/number</Label><Input id="warehouse-bin-no" name="binNo" required maxLength={80} defaultValue={(editorRecord as BinRecord | undefined)?.binNo ?? ""} /></div>
            </>}
            <div className="space-y-2"><Label htmlFor="warehouse-location-status">Status</Label><select id="warehouse-location-status" name="status" defaultValue={String((editorRecord as { status?: unknown } | undefined)?.status ?? "active").toLowerCase() === "inactive" ? "inactive" : "active"} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={busy} onClick={() => setEditor(null)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? "Saving..." : editor.mode === "create" ? "Create location" : "Save changes"}</Button>
            </DialogFooter>
          </form>}
        </DialogContent>
      </Dialog>

      <Dialog open={rackShelfEditorOpen} onOpenChange={(open) => !busy && setRackShelfEditorOpen(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{rackShelfEditorMode === "add" ? "Add shelf" : "Edit shelf count"}</DialogTitle>
            <DialogDescription>Set the number of shelves for Rack {selectedRackNode?.record.rackNo}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRackShelfSave} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="rack-shelf-count-rack">Rack number</Label><Input id="rack-shelf-count-rack" value={selectedRackNode?.record.rackNo ?? ""} readOnly /></div>
            <div className="space-y-2">
              <Label htmlFor="rack-shelf-count">Shelf count</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" aria-label="Decrease shelf count" disabled={busy || !Number.isSafeInteger(Number(rackShelfCount)) || Number(rackShelfCount) <= 0} onClick={() => setRackShelfCount((count) => String(Math.max(0, Number(count) - 1)))}><Minus size={16} /></Button>
                <Input id="rack-shelf-count" type="number" min={0} step={1} required value={rackShelfCount} onChange={(event) => setRackShelfCount(event.target.value)} />
                <Button type="button" variant="outline" aria-label="Increase shelf count" disabled={busy || !Number.isSafeInteger(Number(rackShelfCount))} onClick={() => setRackShelfCount((count) => String(Number(count) + 1))}><Plus size={16} /></Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={busy} onClick={() => setRackShelfEditorOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save shelf count"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteName}?`}
        description="This location will be permanently removed. This action cannot be undone."
        confirmLabel="Delete location"
        loading={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => !busy && setDeleteTarget(null)}
      />

      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bin stock details</DialogTitle><DialogDescription>{selectedBin ? `Warehouse → Rack ${selectedRackNode?.record.rackNo} → Shelf ${selectedShelfNode?.record.shelfNo} → Bin ${selectedBin.binNo}` : ""}</DialogDescription></DialogHeader>
          {selectedBin && <dl className="space-y-3 text-sm"><DetailRow label="Status" value={stateLabels[getBinState(selectedBin)]} /><DetailRow label="Product" value={selectedProduct?.name ?? "No product linked"} /><DetailRow label="Item code" value={selectedProduct?.code ?? "—"} /><DetailRow label="Quantity" value={selectedProduct?.quantity ?? "—"} />{getBinState(selectedBin) === "untracked" && <p className="border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">The current warehouse response does not include stock assignments for this bin.</p>}</dl>}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: unknown }) {
  return <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0"><dt className="text-slate-500">{label}</dt><dd className="max-w-[65%] break-words text-right font-medium text-slate-900">{formatName(value, "—")}</dd></div>;
}