"use client";

import { useAppSelector } from "@/store/hooks";
import { usePaginatedWarehouseRecords } from "./usePaginatedWarehouseRecords";
import type { RackRecord } from "../types";

const PAGE_SIZE = 10;

export function useRacks(pageSize = PAGE_SIZE) {
  const userId = useAppSelector((state) => state.auth.user?.id ?? "");
  const { records, ...state } = usePaginatedWarehouseRecords<RackRecord>(
    userId,
    "racks",
    pageSize,
  );
  return { racks: records, ...state };
}