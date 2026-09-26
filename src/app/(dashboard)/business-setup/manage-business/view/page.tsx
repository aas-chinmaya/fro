"use client";

import { useSearchParams } from "next/navigation";

import BusinessDetails from "@/modules/business/components/BusinessDetails";

export default function ViewBusinessPage() {
  const search = useSearchParams();
  const id = search.get("id");

  return <BusinessDetails businessId={id} mode="view" />;
}
