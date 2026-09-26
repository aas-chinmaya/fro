"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import {checkAuth,} from "@/modules/auth/store/authSlice";
import {loadRoleAccess,loadRolePermissions,} from "@/modules/roleAccess/store/roleAccessSlice";
import { fetchBusinesses } from "@/modules/business/store/businessSlice";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export default function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const dispatch = useAppDispatch();

  const initializedRef = useRef(false);

  const [initialized, setInitialized] =
    useState(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const initializeApp = async () => {
      try {
        /*
         * ============================================
         * 1. CHECK AUTHENTICATION
         * ============================================
         */

        const authResult =
          await dispatch(checkAuth()).unwrap();

        /*
         * ============================================
         * 2. CHECK IF USER IS AUTHENTICATED
         * ============================================
         */

        if (
          !authResult?.isAuthenticated ||
          !authResult?.data
        ) {
          return;
        }

        const user = authResult.data;

        await dispatch(fetchBusinesses()).unwrap();

        /*
         * ============================================
         * 3. GET USER ROLE
         * ============================================
         */

        const userRole = user.role;

        /*
         * ============================================
         * 4. SUPER ADMIN
         * ============================================
         *
         * SUPER ADMIN does not need permission API.
         *
         */

        if (
          userRole?.toUpperCase() ===
          "SUPER ADMIN"
        ) {

          return;
        }

        /*
         * ============================================
         * 5. LOAD ALL ROLES
         * ============================================
         */

        const roleAccessResult =
          await dispatch(
            loadRoleAccess()
          ).unwrap();

        /*
         * ============================================
         * 6. FIND CURRENT USER ROLE
         * ============================================
         */

        const currentRole =
          roleAccessResult.roles.find(
            (role) =>
              role.name?.trim().toUpperCase() ===
              userRole?.trim().toUpperCase()
          );

        /*
         * ============================================
         * 7. VALIDATE ROLE ID
         * ============================================
         */

        if (!currentRole?.id) {
          return;
        }

        /*
         * ============================================
         * 8. LOAD ROLE PERMISSIONS
         * ============================================
         */
        await dispatch(
          loadRolePermissions(
            currentRole.id
          )
        ).unwrap();
      } catch (error) {
      } finally {
        setInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  /*
   * ================================================
   * WAIT UNTIL AUTH + PERMISSION INITIALIZATION
   * IS FINISHED
   * ================================================
   */

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}