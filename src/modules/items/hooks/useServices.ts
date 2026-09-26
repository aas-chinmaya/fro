"use client";

import { useCallback, useEffect, useState } from "react";
import { ServiceRow } from "../types";
import { serviceservice } from "../services/service.service";

const PAGE_STORAGE_KEY = "services-page";
const SEARCH_STORAGE_KEY = "services-search";

export function useServices() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") return 1;
    const savedPage = Number(sessionStorage.getItem(PAGE_STORAGE_KEY));
    return Number.isFinite(savedPage) && savedPage > 0 ? savedPage : 1;
  });
  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(SEARCH_STORAGE_KEY) || "";
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    sessionStorage.setItem(PAGE_STORAGE_KEY, String(page));
  }, [page]);

  useEffect(() => {
    sessionStorage.setItem(SEARCH_STORAGE_KEY, search);
  }, [search]);

  const fetchServices = useCallback(async (nextPage = page, nextSearch = search) => {
    try {
      setLoading(true);
      const response = await serviceservice.getServices(nextPage, 10, nextSearch);
      const payload = response?.data?.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      const normalizedList = list.map((service: any) => ({
        ...service,
        id: String(service?.id ?? service?._id ?? service?.serviceId ?? ""),
      }));

      setServices(normalizedList);
      setPage(Number(payload?.page || nextPage));
      setTotalPages(Number(payload?.totalPages || 1));
      setTotalRecords(Number(payload?.total || normalizedList.length));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  async function changeServiceStatus(id: string, status: boolean) {
    try {
      await serviceservice.updateServiceStatus(id, status);
      await fetchServices(page, search);
    } catch (error: any) {
      throw error;
    }
  }

  useEffect(() => {
    fetchServices(page, search);
  }, [fetchServices, page, search]);

  function handleSearch(nextSearch: string) {
    setSearch(nextSearch);
    setPage(1);
  }

  return {
    services,
    loading,
    page,
    totalPages,
    totalRecords,
    search,
    refetch: fetchServices,
    setPage,
    setSearch: handleSearch,
    changeServiceStatus,
  };
}
