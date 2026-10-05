import { CreditNoteView } from "@/modules/sales/credit-notes/components/view/credit-note-view";

interface Props {
  params: Promise<{ id: string }> | { id: string };
}

export default async function Page({ params }: Props) {
  const p = await Promise.resolve(params);
  return <CreditNoteView id={p.id} />;
}
