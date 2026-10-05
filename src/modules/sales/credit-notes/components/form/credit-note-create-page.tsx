"use client";

import { useRouter } from "next/navigation";
import { CreditNoteForm } from "./credit-note-form";

export function CreditNoteCreatePage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">New credit note</h1>
        <p className="text-sm text-slate-500">
          Issue against a customer / sales invoice
        </p>
      </div>
      <CreditNoteForm
        mode="create"
        onSuccess={(cn) => {
          if (cn?.id) router.push(`/sales/credit-notes/${cn.id}`);
          else router.push("/sales/credit-notes");
        }}
        onCancel={() => router.push("/sales/credit-notes")}
      />
    </div>
  );
}
