"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Phone, Mail, UserRound, BriefcaseBusiness, BadgeCheck } from "lucide-react";

import BusinessList from "@/modules/business/components/BusinessList";
import { useBranchByUser } from "@/modules/business/hooks";
import { Branch } from "@/modules/business/types";
import {
  deleteBranch,
  deleteBusiness,
  fetchBusinesses,
  selectBusinessRecords,
  selectBusinessStatus,
  selectBusinesses,
} from "@/modules/business/store/businessSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const textOrDash = (value?: string | null | unknown) => {
  const normalized = typeof value === "string" ? value : value == null ? "" : String(value);
  return normalized.trim() ? normalized : "—";
};

export default function BusinessPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const businesses = useAppSelector(selectBusinesses);
  const rawBusinesses = useAppSelector(selectBusinessRecords);
  const status = useAppSelector(selectBusinessStatus);
  const currentUser = useAppSelector((state) => state.auth.user);
  const isBranchManager = currentUser?.role?.trim().toUpperCase() === "BRANCH MANAGER";
  const { data: branchData, loading: branchLoading, error: branchError } = useBranchByUser();

  useEffect(() => {
    if (!isBranchManager) {
      void dispatch(fetchBusinesses());
    }
  }, [dispatch, isBranchManager]);

  const refresh = () => dispatch(fetchBusinesses());

  const handleDeleteBusiness = async (id: string) => {
    await dispatch(deleteBusiness(id)).unwrap();
  };

  const handleDeleteBranch = async (branch: Branch) => {
    await dispatch(deleteBranch(branch.id)).unwrap();
    await refresh();
  };

  if (isBranchManager) {
    const business = branchData?.business;
    const branch = branchData?.branch;
    const user = branchData?.user;

    return (
      <div className="space-y-6 px-1 py-2">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Branch Manager Portal</p>
                <h1 className="mt-1 text-3xl font-bold text-text">{textOrDash(business?.displayName ?? business?.legalName ?? business?.tradeName)}</h1>
              </div>
            </div>

            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              {branch?.status ? `Status: ${branch.status}` : "Status: Active"}
            </div>
          </div>
        </div>

        {branchLoading ? (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-muted">Loading branch details...</div>
        ) : branchError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Unable to load branch details. Please try again.</div>
        ) : !branch || !business ? (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-muted">No branch details found for this account.</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Business</p>
                    <h2 className="text-xl font-semibold text-text">{textOrDash(business.displayName ?? business.legalName ?? business.tradeName)}</h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Email</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-text"><Mail className="h-4 w-4 text-primary" /> {textOrDash(business.email)}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Phone</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-text"><Phone className="h-4 w-4 text-primary" /> {textOrDash(business.phone)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Branch</p>
                    <h2 className="text-xl font-semibold text-text">{textOrDash(branch.branchName)}</h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Branch Code</p>
                    <p className="mt-2 text-sm font-semibold text-text">{textOrDash(branch.branchCode)}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Manager</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-text"><UserRound className="h-4 w-4 text-primary" /> {textOrDash(String(branch.branchManager ?? (typeof user?.fullName === "string" ? user.fullName : user?.name ?? "")))}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Address</p>
                    <p className="mt-2 flex items-start gap-2 text-sm font-medium text-text"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {textOrDash([branch.addressLine1, branch.city, branch.state, branch.country].filter(Boolean).join(", "))}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Profile</p>
                    <h3 className="text-lg font-semibold text-text">Account Details</h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted">User</p>
                    <p className="mt-1 text-sm font-semibold text-text">{textOrDash(String(user?.fullName ?? user?.name ?? user?.email ?? ""))}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Email</p>
                    <p className="mt-1 text-sm font-semibold text-text">{textOrDash(user?.email as string | undefined)}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Contact</p>
                    <p className="mt-1 text-sm font-semibold text-text">{textOrDash(user?.contact as string | undefined)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Quick Notes</p>
                <div className="mt-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-text">
                  {branch.note ? branch.note : "No additional notes for this branch."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {status === "loading" && businesses.length === 0 ? (
        <div className="border border-dashed bg-white p-10 text-center text-muted">Loading businesses...</div>
      ) : (
        <>
          <BusinessList
            businesses={businesses}
            rawRecords={rawBusinesses}
            onAddBusiness={() => router.push("/business-setup")}
            onAddBranch={(businessId) => router.push(`/business-setup/manage-business/add-branch?businessId=${businessId}`)}
            onEditBusiness={(id) => router.push(`/business-setup/manage-business/edit?id=${id}`)}
            onDeleteBusiness={handleDeleteBusiness}
            onEditBranch={(branch) => {
              const business = rawBusinesses.find((record) =>
                Array.isArray(record.branches) && record.branches.some((item) => String(item.id) === branch.id)
              );
              if (business) {
                router.push(`/business-setup/manage-business/add-branch?businessId=${business.id}&branchId=${branch.id}`);
              }
            }}
            onDeleteBranch={handleDeleteBranch}
          />
        </>
      )}
    </div>
  );
}
