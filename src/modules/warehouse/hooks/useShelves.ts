"use client";

import { useAppSelector } from "@/store/hooks";
import { usePaginatedWarehouseRecords } from "./usePaginatedWarehouseRecords";
import type { ShelfRecord } from "../types";

const PAGE_SIZE = 10;

export function useShelves(pageSize = PAGE_SIZE) {
  const userId = useAppSelector((state) => state.auth.user?.id ?? "");
  const { records, ...state } = usePaginatedWarehouseRecords<ShelfRecord>(
    userId,
    "shelves",
    pageSize,
  );
  return { shelves: records, ...state };
}