import RackDetails from "@/modules/warehouse/components/rack/RackDetails";

export default async function RackDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RackDetails rackId={id} />;
}