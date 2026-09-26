import ItemCard from "@/modules/items/components/products/ItemCard";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ItemDetailsPage({ params }: Props) {
  const { id } = await params;

  return <ItemCard productId={id} />;
}
