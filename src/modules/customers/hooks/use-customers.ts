"use client";

import { useCallback, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { customersService } from "@/modules/customers/services/customers.service";
import {
  setCustomers,
  setError,
  setLoading,
  setSelectedCustomer,
} from "@/modules/customers/store/customers.slice";
import type { Customer } from "@/modules/customers/types";

export const useCustomers = (autoFetch = true) => {
  const dispatch = useAppDispatch();

  const { customers, selectedCustomer, loading, error } = useAppSelector(
    (state) => state.customers,
  );

  const fetchCustomers = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await customersService.getCustomers();
      const list: Customer[] = Array.isArray(response)
        ? response
        : (response?.data ?? response?.customers ?? []);

      dispatch(setCustomers(list));
      return list;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch customers";
      dispatch(setError(message));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const selectCustomer = useCallback(
    (customer: Customer | null) => {
      dispatch(setSelectedCustomer(customer));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!autoFetch) return;
    fetchCustomers();
  }, [autoFetch, fetchCustomers]);

  return {
    customers,
    selectedCustomer,
    loading,
    error,
    fetchCustomers,
    selectCustomer,
  };
};