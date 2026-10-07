"use client";

import { useRouter } from "next/navigation";
import { FormPageHeader } from "@/modules/sales/shared/components/ui/form-page-header";
import { CreditNoteForm } from "./credit-note-form";

export default function CreditNoteCreatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <FormPageHeader
        title="Create credit note"
        description="Select customer, items, and reason for the credit"
      />
      <CreditNoteForm
        mode="create"
        onSuccess={() => {
          router.push("/sales/credit-notes");
        }}
        onCancel={() => router.push("/sales/credit-notes")}
      />
    </div>
  );
}
