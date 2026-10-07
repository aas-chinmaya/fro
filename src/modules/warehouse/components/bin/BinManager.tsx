"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBins } from "../../hooks/useBins";
import WarehouseRecordTable from "../WarehouseRecordTable";

export default function BinManager() {
  const router = useRouter();
  const { bins, loading } = useBins();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push("/warehouse/rack-manage/bins/create")}>
          <Plus size={17} aria-hidden="true" /> Add Bin
        </Button>
      </div>
      <WarehouseRecordTable
        name="Bin"
        parentColumn="Shelf"
        loading={loading}
        rows={bins.map((bin) => ({ id: bin.id, number: bin.binNo, parent: bin.shelf?.shelfNo ?? bin.shelfId, status: bin.status }))}
      />
    </div>
  );
}