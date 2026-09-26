"use client";

import { EmptyBusinessDashboard } from "@/config/dashboard";
import BusinessDetails from "@/modules/business/components/BusinessDetails";
import { selectSelectedBusiness } from "@/modules/business/store/businessSlice";
import { useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const business = useAppSelector(selectSelectedBusiness);

  const businessId = business?.id;

  if (!business) {
    return <EmptyBusinessDashboard business={business} />;
  }
  return <BusinessDetails businessId={businessId} />;
}












// "use client";

// import { useSearchParams } from "next/navigation";

// import { EmptyBusinessDashboard } from "@/config/dashboard";
// import BusinessDetails from "@/modules/business/components/BusinessDetails";

// export default function DashboardPage(business: string) {
//   const searchParams = useSearchParams();
//   const businessId = searchParams.get("businessId");

//   if (!businessId) return <EmptyBusinessDashboard />;

//   return <BusinessDetails businessId={businessId} />;
// }