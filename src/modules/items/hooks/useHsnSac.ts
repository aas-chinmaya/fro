"use client";

import { useCallback, useEffect, useState } from "react";
import { hsnSacService } from "../services/hsn-sac.service";
import type { HsnSac, HsnSacType } from "../types/hsn-sac";

export function useHsnSac(initialType: HsnSacType = "HSN") {
  const [records, setRecords] = useState<HsnSac[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [type, setType] = useState<HsnSacType>(initialType);
  const [search, setSearch] = useState("");

  const fetchRecords = useCallback(async (nextPage = 1, nextType = type, nextSearch = search) => {
    try {
      setLoading(true);
      const response = await hsnSacService.getHsnSacRecords(nextPage, 10, nextType, nextSearch);
      const payload = response?.data?.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
      setRecords(list);
      setType(nextType);
      setPage(Number(payload?.page || nextPage));
      setTotalPages(Number(payload?.totalPages || 1));
      setTotalRecords(Number(payload?.total || list.length));
    } finally {
      setLoading(false);
    }
  }, [search, type]);

  useEffect(() => {
    void fetchRecords(1, initialType, search);
  }, [fetchRecords, initialType, search]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    void fetchRecords(nextPage, type, search);
  }, [fetchRecords, search, type]);

  return {
    records,
    loading,
    page,
    totalPages,
    totalRecords,
    search,
    refetch: fetchRecords,
    setPage,
    changePage: handlePageChange,
    setSearch: handleSearch,
  };
}
