"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchVendorCategories } from "../store/vendorCategorySlice";

export function useVendorCategories() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.vendorCategories);

  useEffect(() => {
    void dispatch(fetchVendorCategories({ page: 1, limit: 10 }));
  }, [dispatch]);

  return {
    ...state,
    refresh: (page = state.pagination.page, limit = state.pagination.limit) =>
      dispatch(fetchVendorCategories({ page, limit })),
  };
}