"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { brandservice } from "../services/brand.service";
import type { BrandMasterRow } from "../types";

const PAGE_SIZE = 10;
const PAGE_STORAGE_KEY = "brand-master-page";
const SEARCH_STORAGE_KEY = "brand-master-search";
const STATUS_STORAGE_KEY = "brand-master-status";

export function useBrands() {
  const [brands, setBrands] = useState<BrandMasterRow[]>([]);
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

  const fetchBrands = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const response = await brandservice.getBrands({
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

      setBrands(list);

      const pages = Number(payload?.pagination?.totalPages ?? payload?.totalPages ?? 1);
      const total = Number(payload?.pagination?.total ?? payload?.total ?? list.length);

      setTotalPages(pages);
      setTotalRecords(total);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error("Failed to fetch brands:", error);
      setBrands([]);
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
      void fetchBrands();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchBrands]);

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
    brands,
    loading,
    page,
    totalPages,
    totalRecords,
    search,
    status,
    refetch: fetchBrands,
    setPage: handlePageChange,
    setSearch: handleSearch,
    setStatus: handleStatusChange,
  };
}
