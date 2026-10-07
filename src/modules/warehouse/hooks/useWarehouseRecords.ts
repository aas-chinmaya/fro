"use client";

import { useCallback, useEffect, useId, useMemo } from "react";
import { notify } from "@/lib/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearWarehouseQuery,
  fetchWarehouseRecords,
} from "../store/warehouseSlice";
import type { WarehouseRecord, WarehouseResource } from "../types";

export function useWarehouseRecords<T extends WarehouseRecord>(
  userId: string,
  resource: WarehouseResource,
  page = 1,
  pageSize = 10,
  search = "",
  onPageResolved?: (page: number) => void,
) {
  const dispatch = useAppDispatch();
  const queryId = useId();
  const query = useAppSelector((state) => state.warehouse.queries[queryId]);
  const args = useMemo(
    () => ({ queryId, resource, userId, page, pageSize, search }),
    [page, pageSize, queryId, resource, search, userId],
  );

  useEffect(() => {
    let current = true;

    if (!userId) {
      dispatch(clearWarehouseQuery(queryId));
      notify.error("Unable to identify the signed-in user.");
      return () => {
        current = false;
      };
    }

    const request = dispatch(fetchWarehouseRecords(args));
    void request
      .unwrap()
      .then((result) => {
        if (current) onPageResolved?.(result.page);
      })
      .catch(() => {
        if (current) notify.error(`Unable to load ${resource}. Please try again.`);
      });

    return () => {
      current = false;
      request.abort();
    };
  }, [args, dispatch, onPageResolved, queryId, resource, userId]);

  useEffect(
    () => () => {
      dispatch(clearWarehouseQuery(queryId));
    },
    [dispatch, queryId],
  );

  const refetch = useCallback(() => {
    if (!userId) {
      notify.error("Unable to identify the signed-in user.");
      return;
    }

    void dispatch(fetchWarehouseRecords(args))
      .unwrap()
      .then((result) => onPageResolved?.(result.page))
      .catch(() => {
        notify.error(`Unable to load ${resource}. Please try again.`);
      });
  }, [args, dispatch, onPageResolved, resource, userId]);

  return {
    records: (query?.records ?? []) as T[],
    loading: userId ? !query || query.status === "idle" || query.status === "loading" : false,
    refetch,
    page: query?.page ?? page,
    totalPages: query?.totalPages ?? 1,
    totalRecords: query?.totalRecords ?? 0,
    status: query?.status ?? "idle",
  };
}
