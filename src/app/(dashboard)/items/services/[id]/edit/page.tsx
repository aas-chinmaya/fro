import ServiceForm from "@/modules/items/components/services/ServiceForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditServicePage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Service</h1>
        <p className="text-gray-500">Update Service Information</p>
      </div>

      <ServiceForm serviceId={id} />
    </div>
  );
}
