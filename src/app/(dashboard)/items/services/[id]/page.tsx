import ServiceCard from "@/modules/items/components/services/ServiceCard";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ServiceDetailsPage({ params }: Props) {
  const { id } = await params;

  return <ServiceCard serviceId={id} />;
}
