"use client";

import { Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface ServiceActionsProps {
  id: string;
  name: string;
}

export default function ServiceActions({ id, name }: ServiceActionsProps) {
  const router = useRouter();
  const serviceId = id?.trim() || "";

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="View service"
        title="View service"
        onClick={() => serviceId && router.push(`/items/services/${serviceId}`)}
        disabled={!serviceId}
        className="hover:bg-violet-50 hover:text-violet-600"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Edit service"
        title="Edit service"
        onClick={() => router.push(`/items/services/${id}/edit`)}
        className="hover:bg-blue-50 hover:text-blue-600"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}
