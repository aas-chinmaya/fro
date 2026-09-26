"use client";

/**
 * Sales wrapper around your customers module hook.
 * Matches: customers, selectedCustomer, loading, error, fetchCustomers, selectCustomer
 */
import { useCustomers } from "@/modules/customers/hooks/use-customers";
import type { Customer } from "@/modules/customers/types";

export type { Customer };

export function useCustomer(autoFetch = true) {
  const {
    customers,
    selectedCustomer,
    loading,
    error,
    fetchCustomers,
    selectCustomer,
  } = useCustomers(autoFetch);

  return {
    customers: customers ?? [],
    selectedCustomer: selectedCustomer ?? null,
    loading: !!loading,
    error: error ?? null,
    fetchCustomers,
    selectCustomer,
  };
}
