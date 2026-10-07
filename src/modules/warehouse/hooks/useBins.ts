"use client";

import { useAppSelector } from "@/store/hooks";
import { useWarehouseRecords } from "./useWarehouseRecords";
import type { BinRecord } from "../types";

export function useBins() {
  const userId = useAppSelector((state) => state.auth.user?.id ?? "");
  const { records, ...state } = useWarehouseRecords<BinRecord>(userId, "bins");
  return { bins: records, ...state };
}