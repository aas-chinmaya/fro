"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CategoryMasterRow } from "@/modules/items/types";
import { categoryservice } from "@/modules/items/services/category.service";

const PAGE_SIZE = 10;

const PAGE_STORAGE_KEY = "category-master-page";
const SEARCH_STORAGE_KEY = "category-master-search";
const STATUS_STORAGE_KEY = "category-master-status";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryMasterRow[]>([]);
  const [loading, setLoading] = useState(false);

  /*
   * Restore the last page from sessionStorage.
   */
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }

    const savedPage = sessionStorage.getItem(
      PAGE_STORAGE_KEY
    );

    const parsedPage = Number(savedPage);

    return Number.isFinite(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;
  });

  /*
   * Restore search.
   */
  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      sessionStorage.getItem(SEARCH_STORAGE_KEY) || ""
    );
  });

  /*
   * Restore status.
   */
  const [status, setStatus] = useState(() => {
    if (typeof window === "undefined") {
      return "all";
    }

    return (
      sessionStorage.getItem(STATUS_STORAGE_KEY) ||
      "all"
    );
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const requestIdRef = useRef(0);

  /*
   * Save page.
   */
  useEffect(() => {
    sessionStorage.setItem(
      PAGE_STORAGE_KEY,
      String(page)
    );
  }, [page]);

  /*
   * Save search.
   */
  useEffect(() => {
    sessionStorage.setItem(
      SEARCH_STORAGE_KEY,
      search
    );
  }, [search]);

  /*
   * Save status.
   */
  useEffect(() => {
    sessionStorage.setItem(
      STATUS_STORAGE_KEY,
      status
    );
  }, [status]);

  /*
   * Fetch categories.
   */
  const fetchCategories = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const response =
        await categoryservice.getCategories({
          page,
          limit: PAGE_SIZE,
          search,
          status,
        });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const responseData = response?.data;
      const payload = responseData?.data;

      let list: CategoryMasterRow[] = [];

      if (Array.isArray(payload?.data)) {
        list = payload.data;
      } else if (Array.isArray(payload?.items)) {
        list = payload.items;
      } else if (Array.isArray(payload)) {
        list = payload;
      }

      setCategories(list);

      const pages = Number(
        payload?.pagination?.totalPages ??
        payload?.totalPages ??
        1
      );

      const total = Number(
        payload?.pagination?.total ??
        payload?.total ??
        list.length
      );

      setTotalPages(pages);
      setTotalRecords(total);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error(
        "Failed to fetch categories:",
        error
      );

      setCategories([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, search, status]);

  /*
   * Fetch when page/search/status changes.
   */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /*
   * Search.
   *
   * Searching starts from page 1.
   */
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
    },
    []
  );

  /*
   * Status.
   *
   * Changing status starts from page 1.
   */
  const handleStatusChange = useCallback(
    (value: string) => {
      setStatus(value);
      setPage(1);
    },
    []
  );

  /*
   * Pagination.
   */
  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
    },
    []
  );

  return {
    categories,
    loading,

    page,
    totalPages,
    totalRecords,

    search,
    status,

    setPage: handlePageChange,
    setSearch: handleSearch,
    setStatus: handleStatusChange,

    refetch: fetchCategories,
  };
}
