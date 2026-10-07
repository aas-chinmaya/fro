"use client";

import { usePathname, useRouter } from "next/navigation";
import RackManager from "./rack/RackManager";
import ShelfManager from "./shelf/ShelfManager";
import BinManager from "./bin/BinManager";
import WarehouseMap from "./WarehouseMap";

const tabs = [
  { id: "racks", label: "Rack" },
  { id: "shelves", label: "Shelf" },
  { id: "bins", label: "Bin" },
] as const;

export default function RackManage({ initialTab }: { initialTab?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  if (!initialTab) return <WarehouseMap />;

  const pathTab = pathname.split("/").at(-1);
  const requestedTab = pathTab === "shelves" || pathTab === "bins" || pathTab === "racks"
    ? pathTab
    : initialTab === "shelf"
      ? "shelves"
      : initialTab === "bin"
        ? "bins"
        : "racks";

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Rack Manage</h1>
        <p className="mt-1 text-sm text-slate-500">Manage warehouse racks, shelves, and bins.</p>
      </header>
      <div className="border-b border-slate-200">
        <div role="tablist" aria-label="Warehouse locations" className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={requestedTab === tab.id}
              onClick={() => router.push(`/warehouse/rack-manage/${tab.id}`)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${requestedTab === tab.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {requestedTab === "racks" && <RackManager />}
      {requestedTab === "shelves" && <ShelfManager />}
      {requestedTab === "bins" && <BinManager />}
    </section>
  );
}