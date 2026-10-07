"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label } from "@/components/ui";
import { notify } from "@/lib/toast";
import { useRacks } from "../../hooks/useRacks";
import { shelfService } from "../../services/shelf.service";
import { getWarehouseErrorMessage } from "../../utils/errors";
import type { WarehouseStatus } from "../../types";

export default function ShelfCreateForm() {
  const router = useRouter();
  const { racks, loading } = useRacks();
  const [rackId, setRackId] = useState("");
  const [shelfNo, setShelfNo] = useState("");
  const [status, setStatus] = useState<WarehouseStatus>("active");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await shelfService.createShelf({ rackId, shelfNo: shelfNo.trim(), status });
      notify.success("Shelf created successfully.");
      router.push("/warehouse/rack-manage/shelves");
    } catch (error) {
      notify.error(getWarehouseErrorMessage(error, "Unable to create shelf. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <header><h1 className="text-2xl font-semibold text-slate-900">Create Shelf</h1><p className="mt-1 text-sm text-slate-500">Choose a rack and add a shelf.</p></header>
      <Card className="p-6">
        {loading ? <p className="text-sm text-slate-500">Loading racks...</p> : (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
            <div className="space-y-2"><Label htmlFor="shelf-rack">Rack *</Label><select id="shelf-rack" required value={rackId} onChange={(event) => setRackId(event.target.value)} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Select rack</option>{racks.map((rack) => <option key={rack.id} value={rack.id}>{rack.rackNo}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="shelf-number">Shelf No *</Label><Input id="shelf-number" required maxLength={80} value={shelfNo} onChange={(event) => setShelfNo(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="shelf-status">Status</Label><select id="shelf-status" value={status} onChange={(event) => setStatus(event.target.value as WarehouseStatus)} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push("/warehouse/rack-manage/shelves")}>Cancel</Button><Button type="submit" disabled={saving || racks.length === 0}>{saving ? "Saving..." : "Create Shelf"}</Button></div>
          </form>
        )}
      </Card>
    </section>
  );
}