import { CreditNoteView } from "@/modules/sales/credit-notes/components/view/credit-note-view";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function CreditNoteDetailPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  return <CreditNoteView id={resolved.id} />;
}
