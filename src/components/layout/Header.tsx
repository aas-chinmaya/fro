"use client";

import { useEffect } from "react";
import { Menu, Search, X, Building2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Input } from "@/components/ui";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";
import {
  fetchBusinesses,
  selectBusinessRecords,
  selectBusinessStatus,
} from "@/modules/business/store/businessSlice";
import type { AppDispatch } from "@/store/store";
import { useAppSelector } from "@/store/hooks";

interface HeaderProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
}

export default function Header({
  sidebarOpen,
  onMenuClick,
}: HeaderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const businesses = useSelector(selectBusinessRecords);
  const businessStatus = useSelector(selectBusinessStatus);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (businessStatus === "idle") {
      dispatch(fetchBusinesses());
    }
  }, [businessStatus, dispatch]);

  const business = businesses[0];

  const businessName =
    business?.displayName ||
    business?.tradeName ||
    business?.legalName ||
    "Business Account";

  const businessLogo = business?.logo || null;
  const isSuperAdmin = user?.role?.trim().toUpperCase() === "SUPER ADMIN";

  return (
    <header className="sticky top-0 z-30 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex min-w-0 flex-1 items-center gap-6">
          {/* Business */}
          {isSuperAdmin ? (
            <div className="hidden shrink-0 items-center md:flex">
              <p className="text-lg font-semibold text-gray-900">
                SUPER ADMIN
              </p>
            </div>
          ) : (
            <div className="hidden shrink-0 items-center gap-3 md:flex">
              {/* Business Logo */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
                {businessLogo ? (
                  <img
                    src={businessLogo}
                    alt={businessName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2
                    size={22}
                    className="text-primary"
                  />
                )}
              </div>

              {/* Business Name */}
              <div className="min-w-0 leading-tight">
                {businessStatus === "loading" ? (
                  <>
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />

                    <div className="mt-1.5 h-3 w-28 animate-pulse rounded bg-gray-100" />
                  </>
                ) : (
                  <>
                    <p
                      className="max-w-60 truncate text-sm font-semibold text-gray-900"
                      title={businessName}
                    >
                      {businessName}
                    </p>

                    <p className="text-xs text-gray-500">
                      Primary Business Account
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="flex min-w-0 flex-1 items-center">
            <div className="relative w-full max-w-xl">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <Input
                placeholder="Search items, customers, invoices..."
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="ml-6 flex shrink-0 items-center gap-2">
          <NotificationBell />

          <UserMenu />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label={
              sidebarOpen
                ? "Close Sidebar"
                : "Open Sidebar"
            }
          >
            {sidebarOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}