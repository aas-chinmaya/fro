"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label } from "@/components/ui";
import { notify } from "@/lib/toast";
import { rackService } from "../../services/rack.service";
import { getWarehouseErrorMessage } from "../../utils/errors";
import type { WarehouseStatus } from "../../types";

export default function RackCreateForm() {
  const router = useRouter();
  const [rackNo, setRackNo] = useState("");
  const [status, setStatus] = useState<WarehouseStatus>("active");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await rackService.createRack({ rackNo: rackNo.trim(), status });
      notify.success("Rack created successfully.");
      router.push("/warehouse/rack-manage/racks");
    } catch (error) {
      notify.error(getWarehouseErrorMessage(error, "Unable to create rack. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <header><h1 className="text-2xl font-semibold text-slate-900">Create Rack</h1><p className="mt-1 text-sm text-slate-500">Add a rack to the warehouse.</p></header>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          <div className="space-y-2"><Label htmlFor="rack-number">Rack No *</Label><Input id="rack-number" required maxLength={80} value={rackNo} onChange={(event) => setRackNo(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="rack-status">Status</Label><select id="rack-status" value={status} onChange={(event) => setStatus(event.target.value as WarehouseStatus)} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push("/warehouse/rack-manage/racks")}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Rack"}</Button></div>
        </form>
      </Card>
    </section>
  );
}