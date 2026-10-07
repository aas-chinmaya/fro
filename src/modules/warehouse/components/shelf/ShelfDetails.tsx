"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Boxes, MapPin, Package, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/toast";
import { shelfService } from "../../services/shelf.service";
import type { BinRecord, RackRecord, ShelfRecord } from "../../types";

function getRackRecord(response: unknown): RackRecord | null {
  const responseData = (response as { data?: { data?: unknown } })?.data;
  const payload = (responseData as { data?: unknown } | undefined)?.data ?? responseData ?? response;
  const record = Array.isArray(payload) ? payload[0] : payload;
  return record && typeof record === "object" ? record as RackRecord : null;
}

function display(value: unknown) {
  return value === null || value === undefined || value === "" ? "-" : String(value);
}

function availability(value?: string | null) {
  if (!value) return "-";

  if (value.toUpperCase() === "FREE") return "Available";

  if (value.toUpperCase() === "OCCUPIED") return "Occupied";

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function date(value?: string) {
  if (!value) return "-";
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleString();
}

function Detail({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-900">{display(value)}</dd>
    </div>
  );
}

function BinDetails({ bin, shelfNo }: { bin: BinRecord; shelfNo: string }) {
  return (
    <article className="py-4 first:pt-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Bin in Shelf {shelfNo}</p>
          <h4 className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
            <Package size={16} aria-hidden="true" /> Bin {display(bin.binNo)}
          </h4>
        </div>
        <span className="text-sm text-slate-600">{availability(bin.occupancyStatus)}</span>
      </div>
      <dl className="mt-2 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Bin Code" value={bin.binCode} />
        <Detail label="Location" value={bin.binLocationId} />
        <Detail label="Status" value={bin.isActive ? "Active" : "Inactive"} />
        <Detail label="Created" value={date(bin.createdAt)} />
        <Detail label="Updated" value={date(bin.updatedAt)} />
      </dl>
    </article>
  );
}

function ShelfRecordDetails({ shelf, rackNo }: { shelf: ShelfRecord; rackNo: string }) {
  const bins = shelf.bins ?? [];

  return (
    <section className="border-t border-slate-200 py-5 first:border-t-0">
      <div className="border-l-2 border-slate-300 pl-4 sm:pl-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Shelf in Rack {rackNo}</p>
            <h3 className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-900">
              <Boxes size={17} aria-hidden="true" /> Shelf {display(shelf.shelfNo)}
            </h3>
          </div>
          <span className="text-sm font-medium text-slate-600">{bins.length} {bins.length === 1 ? "bin" : "bins"}</span>
        </div>
        <dl className="mt-2 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Shelf Code" value={shelf.shelfCode} />
          <Detail label="Rack" value={`Rack ${rackNo}`} />
          <Detail label="Location" value={shelf.binLocationId} />
          <Detail label="Availability" value={availability(shelf.occupancyStatus)} />
          <Detail label="Status" value={shelf.isActive ? "Active" : "Inactive"} />
          <Detail label="Created" value={date(shelf.createdAt)} />
          <Detail label="Updated" value={date(shelf.updatedAt)} />
        </dl>
        <div className="ml-1 mt-4 border-l border-slate-200 pl-4 sm:ml-2 sm:pl-5">
          <h4 className="mb-1 text-sm font-semibold text-slate-700">Bins in Shelf {display(shelf.shelfNo)}</h4>
          {bins.length ? bins.map((bin) => <BinDetails key={bin.id} bin={bin} shelfNo={display(shelf.shelfNo)} />) : <p className="py-3 text-sm text-slate-500">No bins assigned to this shelf.</p>}
        </div>
      </div>
    </section>
  );
}

export default function ShelfDetails({ shelfId }: { shelfId: string }) {
  const router = useRouter();
  const [rack, setRack] = useState<RackRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   let current = true;

  //   async function loadShelf() {
  //     try {
  //       const response = await shelfService.getShelfById(shelfId);
  //       const record = getRackRecord(response);
  //       if (current) {
  //         setRack(record);
  //         if (!record) notify.error("Shelf details were not found.");
  //       }
  //     } catch (error) {
  //       if (current) {
  //         const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  //         notify.error(message || "Unable to load shelf details.");
  //       }
  //     } finally {
  //       if (current) setLoading(false);
  //     }
  //   }

  //   void loadShelf();
  //   return () => {
  //     current = false;
  //   };
  // }, [shelfId]);

  if (loading) return <p className="py-12 text-center text-sm text-slate-500">Loading shelf details...</p>;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Rack {display(rack?.rackNo)} Shelves</h1>
          <p className="mt-1 text-sm text-slate-500">Shelf details and storage availability.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => router.push("/warehouse/rack-manage/shelf")}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to shelves
        </Button>
      </div>

      {!rack ? (
        <div className="border-y border-slate-200 py-12 text-center text-sm text-slate-500">Shelf details are unavailable.</div>
      ) : (
        <>
          <section className="border-y border-slate-200 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Warehouse size={19} aria-hidden="true" /> Rack information</h2>
            <dl className="mt-2 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Rack Code" value={rack.rackCode} />
              <Detail label="Rack No" value={rack.rackNo} />
              <Detail label="Location" value={rack.binLocationId} />
              <Detail label="Availability" value={availability(rack.occupancyStatus)} />
              <Detail label="Status" value={rack.isActive ? "Active" : "Inactive"} />
              <Detail label="Created" value={date(rack.createdAt)} />
              <Detail label="Updated" value={date(rack.updatedAt)} />
            </dl>
          </section>

          <section className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Shelf contents</h2>
            <p className="mt-1 text-sm text-slate-500">Rack {display(rack.rackNo)} contains {rack.shelves?.length ?? 0} {rack.shelves?.length === 1 ? "shelf" : "shelves"}. Each shelf lists the bins stored inside it.</p>
            {rack.shelves?.length ? rack.shelves.map((shelf) => <ShelfRecordDetails key={shelf.id} shelf={shelf} rackNo={display(rack.rackNo)} />) : <div className="flex items-center gap-2 py-4 text-sm text-slate-500"><MapPin size={16} aria-hidden="true" /> No shelves assigned to this rack.</div>}
          </section>
        </>
      )}
    </section>
  );
}
