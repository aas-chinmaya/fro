"use client";

import { useCallback, useEffect, useState } from "react";

import { businessService } from "../services/business.service";

export interface BranchByUserBusinessRecord {
  id?: string | number;
  tenantId?: string | number;
  displayName?: string | null;
  legalName?: string | null;
  tradeName?: string | null;
  logo?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: string | null;
  documents?: Array<Record<string, unknown>>;
}

export interface BranchByUserBranchRecord {
  id?: string | number;
  tenantId?: string | number;
  branchName?: string | null;
  branchCode?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  branchManager?: string | null;
  status?: string | null;
  isActive?: boolean | null;
  note?: string | null;
  documents?: Array<Record<string, unknown>>;
}

export interface BranchByUserResponseData {
  user?: Record<string, unknown> | null;
  business?: BranchByUserBusinessRecord | null;
  branch?: BranchByUserBranchRecord | null;
}

export interface BranchByUserDebug {
  method: "GET";
  endpoint: string;
  role: string | null;
  payload: null;
  response: BranchByUserResponseData | null;
  calledAt: string;
}

export interface UseBranchByUserReturn {
  data: BranchByUserResponseData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  debug: BranchByUserDebug;
}

const endpoint = "/business/business-branches/getBranchByUser";

export function useBranchByUser(): UseBranchByUserReturn {
  const [data, setData] = useState<BranchByUserResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [debug, setDebug] = useState<BranchByUserDebug>({
    method: "GET",
    endpoint,
    role: null,
    payload: null,
    response: null,
    calledAt: new Date().toISOString(),
  });

  const fetchBranchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await businessService.getBranchDetailsByUser();
      const nextData = (response ?? null) as BranchByUserResponseData | null;

      setData(nextData);
      setDebug({
        method: "GET",
        endpoint,
        role: null,
        payload: null,
        response: nextData,
        calledAt: new Date().toISOString(),
      });

      console.debug("[useBranchByUser] request", {
        method: "GET",
        endpoint,
        response: nextData,
      });
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to fetch branch details");

      setError(nextError);
      setData(null);
      setDebug({
        method: "GET",
        endpoint,
        role: null,
        payload: null,
        response: null,
        calledAt: new Date().toISOString(),
      });

      console.error("[useBranchByUser] error", nextError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBranchDetails();
  }, [fetchBranchDetails]);

  return {
    data,
    loading,
    error,
    refetch: async () => {
      await fetchBranchDetails();
    },
    debug,
  };
}
