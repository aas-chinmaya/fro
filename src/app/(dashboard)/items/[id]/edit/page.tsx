import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditItemLegacyPage({ params }: Props) {
  const { id } = await params;

  redirect(`/items/products/${id}/edit`);
}
