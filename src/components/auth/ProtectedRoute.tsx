"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    isAuthenticated,
    loading,
    initialized,
  } = useAppSelector((state) => state.auth);

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) =>
      pathname === route ||
      (route !== "/" && pathname.startsWith(`${route}/`))
  );

  const isSuperAdmin =
    user?.role?.trim().toUpperCase() === "SUPER ADMIN";

  useEffect(() => {
    if (!initialized || loading) {
      return;
    }

    /*
     * ============================================
     * LOGGED-IN USER ON PUBLIC ROUTE
     * ============================================
     */

    if (
      isPublicRoute &&
      isAuthenticated &&
      user
    ) {
      if (isSuperAdmin) {
        console.log("Super Admin detected, redirecting to /all-business");
        router.replace("/all-business");
      } else {
        console.log("Regular user detected, redirecting to /dashboard");
        router.replace("/dashboard");
      }

      return;
    }

    /*
     * ============================================
     * LOGGED-OUT USER ON PROTECTED ROUTE
     * ============================================
     */

    if (
      !isPublicRoute &&
      (!isAuthenticated || !user)
    ) {
      router.replace("/login");
    }
  }, [
    initialized,
    loading,
    isAuthenticated,
    user,
    isSuperAdmin,
    isPublicRoute,
    router,
  ]);

  /*
   * ============================================
   * WAIT FOR AUTH INITIALIZATION
   * ============================================
   */

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  /*
   * ============================================
   * AUTHENTICATED USER ON PUBLIC PAGE
   * ============================================
   */

  if (
    isPublicRoute &&
    isAuthenticated &&
    user
  ) {
    return null;
  }

  /*
   * ============================================
   * UNAUTHENTICATED USER ON PROTECTED PAGE
   * ============================================
   */

  if (
    !isPublicRoute &&
    (!isAuthenticated || !user)
  ) {
    return null;
  }

  return <>{children}</>;
}











// "use client";

// import { useEffect } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { useAppSelector } from "@/store/hooks";

// const PUBLIC_ROUTES = [
//   "/",
//   "/login",
//   "/register",
//   "/forgot-password",
//   "/reset-password",
// ];

// interface ProtectedRouteProps {
//   children: React.ReactNode;
// }

// export default function ProtectedRoute({
//   children,
// }: ProtectedRouteProps) {
//   const router = useRouter();
//   const pathname = usePathname();

//   const {
//     user,
//     isAuthenticated,
//     loading,
//     initialized,
//   } = useAppSelector((state) => state.auth);

//   const isPublicRoute = PUBLIC_ROUTES.some(
//     (route) =>
//       pathname === route ||
//       (route !== "/" && pathname.startsWith(`${route}/`))
//   );

//   useEffect(() => {
//     if (!initialized || loading) {
//       return;
//     }

//     // Logged-in user trying to access login/register/etc.
//     if (
//       isPublicRoute &&
//       isAuthenticated &&
//       user
//     ) {
//       console.log("Super Admin detected, redirecting to /all-business");
//       router.replace("/dashboard");
//       return;
//     }

//     // Logged-out user trying to access protected page.
//     if (
//       !isPublicRoute &&
//       (!isAuthenticated || !user)
//     ) {
//       router.replace("/login");
//     }
//   }, [
//     initialized,
//     loading,
//     isAuthenticated,
//     user,
//     isPublicRoute,
//     router,
//   ]);

//   // Wait for auth check.
//   if (!initialized || loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="text-sm text-gray-500">
//           Loading...
//         </div>
//       </div>
//     );
//   }

//   // Authenticated user on public page.
//   if (
//     isPublicRoute &&
//     isAuthenticated &&
//     user
//   ) {
//     return null;
//   }

//   // Unauthenticated user on protected page.
//   if (
//     !isPublicRoute &&
//     (!isAuthenticated || !user)
//   ) {
//     return null;
//   }

//   return <>{children}</>;
// }