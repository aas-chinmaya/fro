"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
}

export function FormPageHeader({ title, description, backHref }: FormPageHeaderProps) {
  const router = useRouter();
  return (
    <div className="flex items-start gap-3">
      {backHref ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          onClick={() => router.push(backHref)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      ) : null}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
