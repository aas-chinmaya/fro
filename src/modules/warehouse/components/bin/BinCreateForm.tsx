"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label } from "@/components/ui";
import { notify } from "@/lib/toast";
import { useShelves } from "../../hooks/useShelves";
import { binService } from "../../services/bin.service";
import { getWarehouseErrorMessage } from "../../utils/errors";
import type { WarehouseStatus } from "../../types";

export default function BinCreateForm() {
  const router = useRouter();
  const { shelves, loading } = useShelves();
  const [shelfId, setShelfId] = useState("");
  const [binNo, setBinNo] = useState("");
  const [status, setStatus] = useState<WarehouseStatus>("active");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await binService.createBin({ shelfId, binNo: binNo.trim(), status });
      notify.success("Bin created successfully.");
      router.push("/warehouse/rack-manage/bins");
    } catch (error) {
      notify.error(getWarehouseErrorMessage(error, "Unable to create bin. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <header><h1 className="text-2xl font-semibold text-slate-900">Create Bin</h1><p className="mt-1 text-sm text-slate-500">Choose a shelf and add a bin.</p></header>
      <Card className="p-6">
        {loading ? <p className="text-sm text-slate-500">Loading shelves...</p> : (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
            <div className="space-y-2"><Label htmlFor="bin-shelf">Shelf *</Label><select id="bin-shelf" required value={shelfId} onChange={(event) => setShelfId(event.target.value)} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Select shelf</option>{shelves.map((shelf) => <option key={shelf.id} value={shelf.id}>{shelf.shelfNo}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="bin-number">Bin No *</Label><Input id="bin-number" required maxLength={80} value={binNo} onChange={(event) => setBinNo(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="bin-status">Status</Label><select id="bin-status" value={status} onChange={(event) => setStatus(event.target.value as WarehouseStatus)} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push("/warehouse/rack-manage/bins")}>Cancel</Button><Button type="submit" disabled={saving || shelves.length === 0}>{saving ? "Saving..." : "Create Bin"}</Button></div>
          </form>
        )}
      </Card>
    </section>
  );
}