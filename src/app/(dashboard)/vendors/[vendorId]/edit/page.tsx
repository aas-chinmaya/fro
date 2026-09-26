"use client";

import { useParams } from "next/navigation";
import EditVendorWrapper from "@/modules/vendor/components/edit/EditVendorWrapper";

export default function EditVendorPage() {
  const params = useParams();
  const vendorId = params?.vendorId as string;

  return <EditVendorWrapper vendorId={vendorId} />;
}
