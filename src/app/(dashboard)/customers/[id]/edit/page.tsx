import EditCustomers from "@/modules/customers/components/editCustomers";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Customer</h1>
          <p className="text-gray-500">Update customer details.</p>
        </div>
      </div>

      <EditCustomers />
    </div>
  );
}
