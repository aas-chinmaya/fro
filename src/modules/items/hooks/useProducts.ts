"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductRow } from "../types";
import { productservice } from "../services/product.service";

const PAGE_STORAGE_KEY = "products-page";
const SEARCH_STORAGE_KEY = "products-search";

export function useProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
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

  const fetchProducts = useCallback(async (nextPage = page, nextSearch = search) => {
    try {
      setLoading(true);
      const response = await productservice.getProducts(nextPage, 10, nextSearch);
      const payload = response?.data?.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      const normalizedList = list.map((product: any) => ({
        ...product,
        id: String(product?.id ?? product?._id ?? product?.productId ?? product?.itemId ?? ""),
      }));

      setProducts(normalizedList);
      setPage(Number(payload?.page || nextPage));
      setTotalPages(Number(payload?.totalPages || 1));
      setTotalRecords(Number(payload?.total || normalizedList.length));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  async function changeProductStatus(id: string, status: boolean) {
    try {
      await productservice.updateProductStatus(id, status);
      await fetchProducts(page, search);
    } catch (error: any) {
      throw error;
    }
  }

  useEffect(() => {
    fetchProducts(page, search);
  }, [fetchProducts, page, search]);

  function handleSearch(nextSearch: string) {
    setSearch(nextSearch);
    setPage(1);
  }

  return {
    products,
    loading,
    page,
    totalPages,
    totalRecords,
    search,
    refetch: fetchProducts,
    setPage,
    setSearch: handleSearch,
    changeProductStatus,
  };
}
