"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TaxMasterRow } from "../types";
import { taxMasterservice } from "../services/tax-master.service";

const PAGE_SIZE = 10;
const PAGE_STORAGE_KEY = "tax-master-page";
const SEARCH_STORAGE_KEY = "tax-master-search";
const STATUS_STORAGE_KEY = "tax-master-status";

export function useTaxMasters() {
  const [taxMasters, setTaxMasters] = useState<TaxMasterRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") return 1;
    const savedPage = Number(sessionStorage.getItem(PAGE_STORAGE_KEY));
    return Number.isFinite(savedPage) && savedPage > 0 ? savedPage : 1;
  });
  const [search, setSearch] = useState(() =>
    typeof window === "undefined" ? "" : sessionStorage.getItem(SEARCH_STORAGE_KEY) || ""
  );
  const [status, setStatus] = useState(() =>
    typeof window === "undefined" ? "all" : sessionStorage.getItem(STATUS_STORAGE_KEY) || "all"
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    sessionStorage.setItem(PAGE_STORAGE_KEY, String(page));
    sessionStorage.setItem(SEARCH_STORAGE_KEY, search);
    sessionStorage.setItem(STATUS_STORAGE_KEY, status);
  }, [page, search, status]);

  const fetchTaxMasters = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      const response = await taxMasterservice.getTaxMasters({ page, limit: PAGE_SIZE, search, status });

      if (requestId !== requestIdRef.current) return;

      const payload = response?.data?.data;

      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      setTaxMasters(list);
      setTotalPages(Number(payload?.pagination?.totalPages ?? payload?.totalPages ?? 1));
      setTotalRecords(Number(payload?.pagination?.total ?? payload?.total ?? list.length));
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error("Failed to fetch tax masters:", error);
      setTaxMasters([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTaxMasters();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchTaxMasters]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  return {
    taxMasters,
    loading,
    page,
    totalPages,
    totalRecords,
    search,
    status,
    refetch: fetchTaxMasters,
    setPage: handlePageChange,
    setSearch: handleSearch,
    setStatus: handleStatusChange,
  };
}
