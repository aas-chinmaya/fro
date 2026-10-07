import ShelfDetails from "@/modules/warehouse/components/shelf/ShelfDetails";

export default async function ShelfDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShelfDetails shelfId={id} />;
}
