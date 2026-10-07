"use client";

import { useCallback, useState } from "react";
import type { WarehouseRecord } from "../types";
import { useWarehouseRecords } from "./useWarehouseRecords";

export function usePaginatedWarehouseRecords<T extends WarehouseRecord>(
  userId: string,
  resource: "racks" | "shelves",
  pageSize = 10,
) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const handlePageResolved = useCallback((resolvedPage: number) => {
    setPage(resolvedPage);
  }, []);
  const {
    records,
    loading,
    refetch,
    page: currentPage,
    totalPages,
    totalRecords,
  } = useWarehouseRecords<T>(userId, resource, page, pageSize, search, handlePageResolved);

  const handleSearch = useCallback((nextSearch: string) => {
    setSearch(nextSearch);
    setPage(1);
  }, []);

  return {
    records,
    loading,
    page: currentPage,
    pageSize,
    totalPages,
    totalRecords,
    search,
    setPage,
    setSearch: handleSearch,
    refetch,
  };
}
