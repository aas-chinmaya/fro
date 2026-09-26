"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  CalendarDays,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui";

import {
  fetchBusinesses,
  selectBusinesses,
  selectBusinessStatus,
  selectBusinessError,
  setSelectedBusiness,
} from "@/modules/business/store/businessSlice";

import type { AppDispatch, RootState } from "@/store/store";

/* =========================================================
   ALL BUSINESS
========================================================= */

export default function AllBusiness() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const businesses = useSelector((state: RootState) =>
    selectBusinesses(state)
  );

  const status = useSelector((state: RootState) =>
    selectBusinessStatus(state)
  );

  const error = useSelector((state: RootState) =>
    selectBusinessError(state)
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchBusinesses());
    }
  }, [dispatch, status]);

  /* =========================================================
     SELECT BUSINESS
  ========================================================= */

  const handleBusinessSelect = (
    business: (typeof businesses)[number]
  ) => {
    dispatch(setSelectedBusiness(business));
    router.push("/dashboard");
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (status === "loading") {
    return <BusinessLoading />;
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (status === "failed") {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">
          {error || "Unable to load businesses."}
        </p>
      </div>
    );
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  if (!businesses.length) {
    return (
      <div className="rounded-lg border bg-primary/5 p-10 text-center">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

        <h3 className="text-base font-semibold">
          No businesses found
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          There are no businesses available to display.
        </p>
      </div>
    );
  }

  /* =========================================================
     BUSINESS LIST
  ========================================================= */

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {businesses.map((business) => (
        <div
          key={business.id}
          role="button"
          tabIndex={0}
          onClick={() => handleBusinessSelect(business)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleBusinessSelect(business);
            }
          }}
          className="cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <BusinessCard business={business} />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   BUSINESS CARD
========================================================= */

interface BusinessCardProps {
  business: ReturnType<typeof selectBusinesses>[number];
}

function BusinessCard({ business }: BusinessCardProps) {
  const primaryAddress =
    business.addresses?.find(
      (address) => address.isBilling || address.isShipping
    ) || business.addresses?.[0];

  const location = [
    primaryAddress?.city || business.city,
    primaryAddress?.state || business.state,
    primaryAddress?.country || business.country,
  ]
    .filter(Boolean)
    .join(", ");

  const isActive =
    business.status === "Active" ||
    business.status === "ACTIVE";

  return (
    <Card className="h-full overflow-hidden transition-all duration-200 hover:bg-primary/5 hover:shadow-xl">
      {/* Header */}
      <CardHeader className="border-b bg-primary/5 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-foreground">
                {business.name}
              </h3>

              <p className="truncate text-sm text-muted-foreground">
                {business.businessType || "Business"}
              </p>
            </div>
          </div>

          <span
            className={[
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
              isActive
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {business.status}
          </span>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4 p-5">
        {/* Legal Name */}
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Legal Name
          </p>

          <p className="truncate text-lg font-medium">
            {business.legalName || "-"}
          </p>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 gap-2">
          <InfoItem
            icon={Mail}
            value={business.email}
          />

          <InfoItem
            icon={Phone}
            value={business.phone}
          />

          {business.website && (
            <InfoItem
              icon={Globe}
              value={business.website}
            />
          )}

          {location && (
            <InfoItem
              icon={MapPin}
              value={location}
            />
          )}
        </div>

        {/* Tax information */}
        <div className="grid grid-cols-2 gap-3">
          <InfoBox
            icon={ReceiptText}
            label="GSTIN"
            value={business.gstin || "-"}
          />

          <InfoBox
            icon={FileText}
            label="PAN"
            value={business.pan || "-"}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />

            <div>
              <p className="text-[10px] text-muted-foreground">
                Financial Year
              </p>

              <p className="text-sm font-medium">
                {business.financialYear || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />

            <div>
              <p className="text-[10px] text-muted-foreground">
                Branches
              </p>

              <p className="text-sm font-medium">
                {business.branches?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  value?: string | null;
}

function InfoItem({ icon: Icon, value }: InfoItemProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />

      <span className="truncate text-sm text-muted-foreground">
        {value || "-"}
      </span>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

interface InfoBoxProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function InfoBox({
  icon: Icon,
  label,
  value,
}: InfoBoxProps) {
  return (
    <div className="rounded-md border bg-primary/5 p-3">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />

        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>

      <p className="truncate text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function BusinessLoading() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden"
        >
          <CardHeader className="border-b bg-primary/5 p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-lg bg-muted" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-5">
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />

            <div className="space-y-3">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 animate-pulse rounded-md bg-muted" />
              <div className="h-16 animate-pulse rounded-md bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}








// "use client";

// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   Building2,
//   CalendarDays,
//   FileText,
//   Globe,
//   Mail,
//   MapPin,
//   Phone,
//   ReceiptText,
//   ShieldCheck,
// } from "lucide-react";

// import { Card, CardContent, CardHeader } from "@/components/ui";
// import {
//   fetchBusinesses,
//   selectBusinesses,
//   selectBusinessStatus,
//   selectBusinessError,
// } from "@/modules/business/store/businessSlice";

// import type { AppDispatch, RootState } from "@/store/store";
// import Link from "next/link";

// export default function AllBusiness() {

//   const dispatch = useDispatch<AppDispatch>();

//   const businesses = useSelector((state: RootState) =>
//     selectBusinesses(state)
//   );

//   const status = useSelector((state: RootState) =>
//     selectBusinessStatus(state)
//   );

//   const error = useSelector((state: RootState) =>
//     selectBusinessError(state)
//   );

//   useEffect(() => {
//     if (status === "idle") {
//       dispatch(fetchBusinesses());
//     }
//   }, [dispatch, status]);

//   if (status === "loading") {
//     return <BusinessLoading />;
//   }

//   if (status === "failed") {
//     return (
//       <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
//         <p className="text-sm font-medium text-destructive">
//           {error || "Unable to load businesses."}
//         </p>
//       </div>
//     );
//   }

//   if (!businesses.length) {
//     return (
//       <div className="rounded-lg border bg-primary/5 p-10 text-center">
//         <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

//         <h3 className="text-base font-semibold">
//           No businesses found
//         </h3>

//         <p className="mt-1 text-sm text-muted-foreground">
//           There are no businesses available to display.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
//       {businesses.map((business) => (
//         <Link
//           key={business.id}
//           href="/dashboard"
//           className="block"
//         >
//           <BusinessCard business={business} />
//         </Link>
//       ))}
//     </div>
//   );
// }

// /* =========================================================
//    BUSINESS CARD
// ========================================================= */

// interface BusinessCardProps {
//   business: ReturnType<typeof selectBusinesses>[number];
// }

// function BusinessCard({ business }: BusinessCardProps) {
//   const primaryAddress =
//     business.addresses?.find(
//       (address) => address.isBilling || address.isShipping
//     ) || business.addresses?.[0];

//   const location = [
//     primaryAddress?.city || business.city,
//     primaryAddress?.state || business.state,
//     primaryAddress?.country || business.country,
//   ]
//     .filter(Boolean)
//     .join(", ");

//   const isActive =
//     business.status === "Active" ||
//     business.status === "ACTIVE";

//   return (
//     <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-xl">
//       {/* Header */}
//       <CardHeader className="border-b bg-primary/5 px-5 py-4">
//         <div className="flex items-start justify-between gap-3">
//           <div className="flex min-w-0 items-center gap-3">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
//               {business.logo ? (
//                 <img
//                   src={business.logo}
//                   alt={business.name}
//                   className="h-full w-full object-cover"
//                 />
//               ) : (
//                 <Building2 className="h-5 w-5" />
//               )}
//             </div>

//             <div className="min-w-0">
//               <h3 className="truncate text-lg font-semibold text-foreground">
//                 {business.name}
//               </h3>

//               <p className="truncate text-sm text-muted-foreground">
//                 {business.businessType || "Business"}
//               </p>
//             </div>
//           </div>

//           <span
//             className={[
//               "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
//               isActive
//                 ? "bg-primary/10 text-primary"
//                 : "bg-muted text-muted-foreground",
//             ].join(" ")}
//           >
//             {business.status}
//           </span>
//         </div>
//       </CardHeader>

//       {/* Content */}
//       <CardContent className="space-y-4 p-5">
//         {/* Legal Name */}
//         <div>
//           <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
//             Legal Name
//           </p>

//           <p className="truncate text-lg font-medium">
//             {business.legalName || "-"}
//           </p>
//         </div>

//         {/* Contact */}
//         <div className="grid grid-cols-1 gap-2">
//           <InfoItem
//             icon={Mail}
//             value={business.email}
//           />

//           <InfoItem
//             icon={Phone}
//             value={business.phone}
//           />

//           {business.website && (
//             <InfoItem
//               icon={Globe}
//               value={business.website}
//             />
//           )}

//           {location && (
//             <InfoItem
//               icon={MapPin}
//               value={location}
//             />
//           )}
//         </div>

//         {/* Tax information */}
//         <div className="grid grid-cols-2 gap-3">
//           <InfoBox
//             icon={ReceiptText}
//             label="GSTIN"
//             value={business.gstin || "-"}
//           />

//           <InfoBox
//             icon={FileText}
//             label="PAN"
//             value={business.pan || "-"}
//           />
//         </div>

//         {/* Footer information */}
//         <div className="flex items-center justify-between border-t pt-4">
//           <div className="flex items-center gap-2">
//             <CalendarDays className="h-4 w-4 text-primary" />

//             <div>
//               <p className="text-[10px] text-muted-foreground">
//                 Financial Year
//               </p>

//               <p className="text-sm font-medium">
//                 {business.financialYear || "-"}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <ShieldCheck className="h-4 w-4 text-primary" />

//             <div>
//               <p className="text-[10px] text-muted-foreground">
//                 Branches
//               </p>

//               <p className="text-sm font-medium">
//                 {business.branches?.length || 0}
//               </p>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// /* =========================================================
//    INFO ITEM
// ========================================================= */

// interface InfoItemProps {
//   icon: React.ComponentType<{ className?: string }>;
//   value: string;
// }

// function InfoItem({ icon: Icon, value }: InfoItemProps) {
//   return (
//     <div className="flex min-w-0 items-center gap-2">
//       <Icon className="h-4 w-4 shrink-0 text-primary" />

//       <span className="truncate text-sm text-muted-foreground">
//         {value || "-"}
//       </span>
//     </div>
//   );
// }

// /* =========================================================
//    INFO BOX
// ========================================================= */

// interface InfoBoxProps {
//   icon: React.ComponentType<{ className?: string }>;
//   label: string;
//   value: string;
// }

// function InfoBox({ icon: Icon, label, value }: InfoBoxProps) {
//   return (
//     <div className="rounded-md border bg-primary/5 p-3">
//       <div className="mb-1 flex items-center gap-1.5">
//         <Icon className="h-3.5 w-3.5 text-primary" />

//         <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
//           {label}
//         </span>
//       </div>

//       <p className="truncate text-sm font-medium">
//         {value}
//       </p>
//     </div>
//   );
// }

// /* =========================================================
//    LOADING
// ========================================================= */

// function BusinessLoading() {
//   return (
//     <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
//       {Array.from({ length: 6 }).map((_, index) => (
//         <Card key={index} className="overflow-hidden">
//           <CardHeader className="border-b bg-primary/5 p-5">
//             <div className="flex items-center gap-3">
//               <div className="h-11 w-11 animate-pulse rounded-lg bg-muted" />

//               <div className="flex-1 space-y-2">
//                 <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
//                 <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent className="space-y-4 p-5">
//             <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />

//             <div className="space-y-3">
//               <div className="h-3 w-full animate-pulse rounded bg-muted" />
//               <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
//               <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div className="h-16 animate-pulse rounded-md bg-muted" />
//               <div className="h-16 animate-pulse rounded-md bg-muted" />
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }