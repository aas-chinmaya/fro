"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGlobalDocumentTypes } from "../store/globalDocumentTypeSlice";

export function useGlobalDocumentTypes() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.vendorDocumentTypes);

  useEffect(() => {
    void dispatch(fetchGlobalDocumentTypes({ page: 1, limit: 1000 }));
  }, [dispatch]);

  return {
    ...state,
    refresh: (page = state.pagination.page, limit = state.pagination.limit) =>
      dispatch(fetchGlobalDocumentTypes({ page, limit })),
  };
}