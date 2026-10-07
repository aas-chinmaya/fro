"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Search from "@/components/data-table/Search";
import { Eye } from "lucide-react";
import AddLoyalty from "./addLoyalty";
import UpdateLoyalty from "./UpdateLoyalty";
import DeleteLoyalty from "./deleteLoyalty";
import { CustomerRewardConfig } from "../../types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setRewardConfigs,
  setRewardConfigLoading,
  setRewardConfigError,
  addRewardConfig,
  updateRewardConfig,
  removeRewardConfig,
} from "../../store/customers.slice";
import { customersService } from "../../services/customers.service";
import { notify } from "@/lib/toast";
import { selectBusinessRecords } from "@/modules/business/store/businessSlice";

export default function AllLoyalty() {
  const dispatch = useAppDispatch();
  const rewardConfigs = useAppSelector((state) => state.customers.rewardConfigs);
  const rewardLoading = useAppSelector((state) => state.customers.rewardLoading);
  const rewardError = useAppSelector((state) => state.customers.rewardError);
  const businesses = useAppSelector(selectBusinessRecords);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const business = businesses?.[0];
    const businessId = String(business?.id ?? "");
    const branch = Array.isArray(business?.branches) ? business.branches[0] : undefined;
    const branchId = String(branch?.id ?? "");

    if (!businessId) {
      dispatch(setRewardConfigError("No business id found in the loaded business records.")); 
      return;
    }

    if (!branchId) {
      dispatch(setRewardConfigError("No branch id found in the loaded business records."));
      return;
    }

    void fetchRewardConfigs(businessId, branchId);
  }, [businesses, dispatch]);

  async function fetchRewardConfigs(businessId: string, branchId: string) {
    try {
      dispatch(setRewardConfigLoading(true));
      dispatch(setRewardConfigError(null));

      const response = await customersService.getRewardConfig(businessId, branchId);
      const data = response?.data || response;
      const config = data ? [data] : [];

      dispatch(setRewardConfigs(config));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch loyalty configs";
      dispatch(setRewardConfigError(message));
      notify.error(message);
    } finally {
      dispatch(setRewardConfigLoading(false));
    }
  }

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return rewardConfigs;

    return rewardConfigs.filter((item) => {
      return [
        item.businessId,
        item.branchId || "",
        item.createdBy,
        String(item.pointValue),
        String(item.pointsPerCurrency),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [rewardConfigs, searchTerm]);

  async function handleCreate(payload: CustomerRewardConfig) {
    try {
      dispatch(setRewardConfigLoading(true));
      dispatch(setRewardConfigError(null));

      const response = await customersService.createRewardConfig(payload);
      const created = response?.data || response || payload;

      dispatch(addRewardConfig(created));
      notify.success("Loyalty config created");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create config";
      dispatch(setRewardConfigError(message));
      notify.error(message);
    } finally {
      dispatch(setRewardConfigLoading(false));
    }
  }

  async function handleUpdate(payload: CustomerRewardConfig) {
    try {
      dispatch(setRewardConfigLoading(true));
      dispatch(setRewardConfigError(null));

      const branchId = payload.branchId || "all";
      const response = await customersService.updateRewardConfig(payload.businessId, payload, branchId);
      const updated = response?.data || response || payload;

      dispatch(updateRewardConfig(updated));
      notify.success("Loyalty config updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update config";
      dispatch(setRewardConfigError(message));
      notify.error(message);
    } finally {
      dispatch(setRewardConfigLoading(false));
    }
  }

  async function handleDelete(payload: CustomerRewardConfig) {
    try {
      dispatch(setRewardConfigLoading(true));
      dispatch(setRewardConfigError(null));

      const branchId = payload.branchId || "all";
      await customersService.deleteRewardConfig(payload.businessId, branchId);
      dispatch(removeRewardConfig({ businessId: payload.businessId, branchId }));
      notify.success("Loyalty config deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete config";
      dispatch(setRewardConfigError(message));
      notify.error(message);
    } finally {
      dispatch(setRewardConfigLoading(false));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-md">
          <Search
            placeholder="Search by business, branch, created by..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <AddLoyalty onCreate={handleCreate} />
      </div>

      {rewardError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {rewardError}
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Business</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Enabled</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Points / Currency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Currency / Point</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Redeem</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Created By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={9}>
                    {rewardLoading ? "Loading..." : "No loyalty config found."}
                  </td>
                </tr>
              )}

              {filtered.map((config) => (
                <tr key={`${config.businessId}-${config.branchId || "all"}`} className="border-t">
                  <td className="px-4 py-3 font-semibold text-gray-800">{config.businessId}</td>
                  <td className="px-4 py-3 text-gray-700">{config.branchId || "All Branches"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={config.isEnabled ? "success" : "danger"}>
                      {config.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{config.pointsPerCurrency}</td>
                  <td className="px-4 py-3 text-gray-700">{config.currencyPerPoint}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">
                        {config.redemptionEnabled ? "Yes" : "No"}
                      </span>
                      <span className="text-xs text-gray-500">
                        Min {config.minimumRedeemPoints} / Max {config.maximumRedeemPoints ?? "∞"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">
                        {config.expiryEnabled ? "Enabled" : "Disabled"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {config.expiryDays ?? "N/A"} days
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{config.createdBy}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="icon" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <UpdateLoyalty value={config} onUpdate={handleUpdate} />
                      <DeleteLoyalty value={config} onDelete={handleDelete} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
