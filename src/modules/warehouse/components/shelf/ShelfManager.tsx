"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShelves } from "../../hooks/useShelves";
import WarehouseRecordTable from "../WarehouseRecordTable";

export default function ShelfManager() {
  const router = useRouter();
  const { shelves, loading } = useShelves();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push("/warehouse/rack-manage/shelves/create")}>
          <Plus size={17} aria-hidden="true" /> Add Shelf
        </Button>
      </div>
      <WarehouseRecordTable
        name="Shelf"
        parentColumn="Rack"
        loading={loading}
        rows={shelves.map((shelf) => ({ id: shelf.id, number: shelf.shelfNo, parent: shelf.rack?.rackNo ?? shelf.rackId, status: shelf.status }))}
      />
    </div>
  );
}