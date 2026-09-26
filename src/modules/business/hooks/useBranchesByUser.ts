"use client";

import { useCallback, useEffect, useState } from "react";

import { businessService } from "../services/business.service";
import type { BusinessApiRecord } from "../types";

const getEndpointForRole = (role?: string | null) =>
  role?.trim().toUpperCase() === "SUPER ADMIN"
    ? "/business/getAllBusinesses"
    : "/business/getBusinessesByUser";

export interface BranchUserRecord {
  id?: string | number;
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
  contact?: string | null;
  roleId?: string | number | null;
  tenantId?: string | number | null;
  branchId?: string | number | null;
  role?: {
    id?: string | number;
    name?: string | null;
  } | null;
}

export interface BranchDetailRecord {
  id?: string | number;
  businessId?: string | number;
  tenantId?: string | number;
  businessName?: string | null;
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
  user?: BranchUserRecord | null;
  users: BranchUserRecord[];
}

export interface BranchesByUserDebug {
  method: "GET";
  endpoint: string;
  role: string | null;
  payload: null;
  businessesCount: number;
  branchesCount: number;
  response: BusinessApiRecord[];
  calledAt: string;
}

export interface UseBranchesByUserReturn {
  branches: BranchDetailRecord[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  debug: BranchesByUserDebug;
}

const normalizeBranchUsers = (
  branch: Record<string, unknown>
): BranchUserRecord[] => {
  const rawUsers = Array.isArray(branch.users)
    ? branch.users
    : Array.isArray(branch.user)
      ? branch.user
      : branch.user
        ? [branch.user]
        : [];

  return rawUsers.filter(Boolean) as BranchUserRecord[];
};

const normalizeBranch = (
  business: BusinessApiRecord,
  branch: Record<string, unknown>
): BranchDetailRecord => {
  const users = normalizeBranchUsers(branch);
  const primaryUser = users[0] ?? null;

  return {
    id: branch.id as string | number | undefined,
    businessId: business.id,
    tenantId: business.tenantId,
    businessName:
      business.displayName ||
      business.legalName ||
      business.tradeName ||
      "Business",
    branchName: (branch.branchName as string | null | undefined) ?? null,
    branchCode: (branch.branchCode as string | null | undefined) ?? null,
    addressLine1: (branch.addressLine1 as string | null | undefined) ?? null,
    city: (branch.city as string | null | undefined) ?? null,
    state: (branch.state as string | null | undefined) ?? null,
    country: (branch.country as string | null | undefined) ?? null,
    phone: (branch.phone as string | null | undefined) ?? null,
    email: (branch.email as string | null | undefined) ?? null,
    branchManager:
      (branch.branchManager as string | null | undefined) ??
      primaryUser?.fullName ??
      primaryUser?.name ??
      null,
    status: (branch.status as string | null | undefined) ?? null,
    isActive: (branch.isActive as boolean | null | undefined) ?? null,
    user: primaryUser,
    users,
  };
};

export function useBranchesByUser(
  userRole?: string | null
): UseBranchesByUserReturn {
  const [branches, setBranches] = useState<BranchDetailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [debug, setDebug] = useState<BranchesByUserDebug>({
    method: "GET",
    endpoint: getEndpointForRole(userRole),
    role: userRole ?? null,
    payload: null,
    businessesCount: 0,
    branchesCount: 0,
    response: [],
    calledAt: new Date().toISOString(),
  });

  const fetchBranches = useCallback(async () => {
    const endpoint = getEndpointForRole(userRole);

    try {
      setLoading(true);
      setError(null);

      const data = (await businessService.getBusinesses(userRole)) as BusinessApiRecord[];
      const normalized = (data ?? []).flatMap((business) =>
        (business.branches ?? []).map((branch) => normalizeBranch(business, branch as Record<string, unknown>))
      );

      const nextDebug: BranchesByUserDebug = {
        method: "GET",
        endpoint,
        role: userRole ?? null,
        payload: null,
        businessesCount: Array.isArray(data) ? data.length : 0,
        branchesCount: normalized.length,
        response: Array.isArray(data) ? data : [],
        calledAt: new Date().toISOString(),
      };

      setBranches(normalized);
      setDebug(nextDebug);
      console.debug("[useBranchesByUser] request", nextDebug);
    } catch (err) {
      const nextError =
        err instanceof Error ? err : new Error("Failed to fetch user branches");

      setError(nextError);
      setBranches([]);
      setDebug({
        method: "GET",
        endpoint,
        role: userRole ?? null,
        payload: null,
        businessesCount: 0,
        branchesCount: 0,
        response: [],
        calledAt: new Date().toISOString(),
      });
      console.error("[useBranchesByUser] error", nextError);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  return {
    branches,
    loading,
    error,
    refetch: async () => {
      await fetchBranches();
    },
    debug,
  };
}
