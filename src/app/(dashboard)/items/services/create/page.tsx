import ServiceForm from "@/modules/items/components/services/ServiceForm";

export default function CreateServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create Service</h1>
        <p className="text-sm text-slate-500">Add a new service with category and tax settings.</p>
      </div>
      <ServiceForm />
    </div>
  );
}
