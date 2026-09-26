"use client";

import { useCallback, useEffect, useState } from "react";

import { businessService } from "../services/business.service";

const getEndpointForRole = (role?: string | null) =>
  role?.trim().toUpperCase() === "SUPER ADMIN"
    ? "/business/getAllBusinesses"
    : "/business/getBusinessesByUser";

export interface BusinessHookDebug {
  method: "GET";
  endpoint: string;
  role: string | null;
  payload: null;
  response: unknown[];
  calledAt: string;
}

export interface UseBusinessesByUserReturn {
  businesses: any[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  debug: BusinessHookDebug;
}

/**
 * Custom hook to fetch businesses for the current user.
 * It logs the exact endpoint + response shape so it is easy to inspect.
 */
export function useBusinessesByUser(userRole?: string | null): UseBusinessesByUserReturn {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [debug, setDebug] = useState<BusinessHookDebug>({
    method: "GET",
    endpoint: getEndpointForRole(userRole),
    role: userRole ?? null,
    payload: null,
    response: [],
    calledAt: new Date().toISOString(),
  });

  const fetchBusinesses = useCallback(async () => {
    const endpoint = getEndpointForRole(userRole);

    try {
      setLoading(true);
      setError(null);

      const data = await businessService.getBusinesses(userRole);
      const nextDebug: BusinessHookDebug = {
        method: "GET",
        endpoint,
        role: userRole ?? null,
        payload: null,
        response: Array.isArray(data) ? data : [],
        calledAt: new Date().toISOString(),
      };

      setBusinesses(Array.isArray(data) ? data : []);
      setDebug(nextDebug);
      console.debug("[useBusinessesByUser] request", nextDebug);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error("Failed to fetch businesses");
      const nextDebug: BusinessHookDebug = {
        method: "GET",
        endpoint,
        role: userRole ?? null,
        payload: null,
        response: [],
        calledAt: new Date().toISOString(),
      };

      setError(errorMessage);
      setBusinesses([]);
      setDebug(nextDebug);
      console.error("[useBusinessesByUser] error", { ...nextDebug, error: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    void fetchBusinesses();
  }, [fetchBusinesses]);

  return {
    businesses,
    loading,
    error,
    refetch: async () => {
      await fetchBusinesses();
    },
    debug,
  };
}
