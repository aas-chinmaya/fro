"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { unitservice } from "../services/unit.service";
import type { UnitMasterRow } from "../types";

const PAGE_SIZE = 10;
const PAGE_STORAGE_KEY = "unit-master-page";
const SEARCH_STORAGE_KEY = "unit-master-search";
const STATUS_STORAGE_KEY = "unit-master-status";

export function useUnits() {
  const [units, setUnits] = useState<UnitMasterRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }

    const savedPage = sessionStorage.getItem(PAGE_STORAGE_KEY);
    const parsedPage = Number(savedPage);

    return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  });

  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return sessionStorage.getItem(SEARCH_STORAGE_KEY) || "";
  });

  const [status, setStatus] = useState(() => {
    if (typeof window === "undefined") {
      return "all";
    }

    return sessionStorage.getItem(STATUS_STORAGE_KEY) || "all";
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const requestIdRef = useRef(0);

  useEffect(() => {
    sessionStorage.setItem(PAGE_STORAGE_KEY, String(page));
  }, [page]);

  useEffect(() => {
    sessionStorage.setItem(SEARCH_STORAGE_KEY, search);
  }, [search]);

  useEffect(() => {
    sessionStorage.setItem(STATUS_STORAGE_KEY, status);
  }, [status]);

  const fetchUnits = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const response = await unitservice.getUnits({
        page,
        limit: PAGE_SIZE,
        search,
        status,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const payload = response?.data?.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

      setUnits(list);

      const pages = Number(payload?.pagination?.totalPages ?? payload?.totalPages ?? 1);
      const total = Number(payload?.pagination?.total ?? payload?.total ?? list.length);

      setTotalPages(pages);
      setTotalRecords(total);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error("Failed to fetch units:", error);
      setUnits([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchUnits();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchUnits]);

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
    units,
    loading,
    page,
    totalPages,
    totalRecords,
    search,
    status,
    refetch: fetchUnits,
    setPage: handlePageChange,
    setSearch: handleSearch,
    setStatus: handleStatusChange,
  };
}
