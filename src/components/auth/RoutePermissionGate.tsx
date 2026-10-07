"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { checkRoutePermissionService } from "@/modules/roleAccess/services/roleAccess.service";
import { useAppSelector } from "@/store/hooks";

interface RoutePermissionState {
  routeKey: string;
  allowed: boolean;
  message: string;
}

export default function RoutePermissionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [routePermission, setRoutePermission] =
    useState<RoutePermissionState | null>(null);

  const isSuperAdmin =
    user?.role?.trim().toUpperCase() === "SUPER ADMIN";
  const routeKey = user ? `${user.id}:${pathname}` : null;

  useEffect(() => {
    if (!isAuthenticated || !user || isSuperAdmin || !routeKey) {
      return;
    }

    let isCurrent = true;
    setRoutePermission(null);

    const verifyRoutePermission = async () => {
      try {
        const response = await checkRoutePermissionService(pathname);

        if (isCurrent) {
          setRoutePermission({
            routeKey,
            allowed: response.success === true,
            message:
              response.message ||
              "You do not have permission to access this page.",
          });
        }
      } catch (error) {
        if (isCurrent) {
          setRoutePermission({
            routeKey,
            allowed: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to check route permission.",
          });
        }
      }
    };

    void verifyRoutePermission();

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated, user?.id, user?.role, isSuperAdmin, pathname, routeKey]);

  if (!isAuthenticated || !user || isSuperAdmin) {
    return <>{children}</>;
  }

  if (!routePermission || routePermission.routeKey !== routeKey) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <span className="flex size-10 items-center justify-center rounded-full bg-slate-100">
            <span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
          </span>
          <p className="text-sm font-medium text-slate-600">
            Verifying your page access...
          </p>
        </div>
      </div>
    );
  }

  if (!routePermission.allowed) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-50 px-6 py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/70 via-slate-50 to-slate-50"
        />

        <section
          className="relative w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-900/5 sm:p-12"
          role="alert"
          aria-labelledby="access-denied-title"
        >
          <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-rose-50 ring-1 ring-inset ring-rose-100">
            <ShieldAlert
              aria-hidden="true"
              className="size-10 text-rose-600"
              strokeWidth={1.7}
            />
          </div>

          <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 ring-1 ring-inset ring-rose-100">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Access restricted
          </div>

          <h1
            id="access-denied-title"
            className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            You can&apos;t access this page
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Your account doesn&apos;t have permission to view this page. If you
            believe this is a mistake, contact your administrator.
          </p>

          {/* <div className="mt-8 rounded-xl border border-rose-100 bg-rose-50/70 px-5 py-4 text-left">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
              Details
            </p>
            <p className="text-sm leading-6 text-slate-700">
              {routePermission.message}
            </p>
          </div> */}
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
