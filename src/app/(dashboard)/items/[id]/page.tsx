import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ItemDetailsLegacyPage({ params }: Props) {
  const { id } = await params;

  redirect(`/items/products/${id}`);
}
