"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRacks } from "../../hooks/useRacks";
import WarehouseRecordTable from "../WarehouseRecordTable";

export default function RackManager() {
  const router = useRouter();
  const { racks, loading } = useRacks();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push("/warehouse/rack-manage/racks/create")}>
          <Plus size={17} aria-hidden="true" /> Add Rack
        </Button>
      </div>
      <WarehouseRecordTable name="Rack" loading={loading} rows={racks.map((rack) => ({ id: rack.id, number: rack.rackNo, status: rack.status }))} />
    </div>
  );
}