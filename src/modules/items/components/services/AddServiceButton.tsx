"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AddServiceButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/items/services/create")}
      className="flex items-center gap-2"
    >
      <Plus className="h-4 w-4" />
      Add service
    </Button>
  );
}
