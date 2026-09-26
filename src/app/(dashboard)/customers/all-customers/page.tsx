import AllCustomers from "@/modules/customers/components/allCustomers";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Customer</h1>
          <p className="text-gray-500">Create a new customer profile.</p>
        </div>
      </div>

      <AllCustomers />
    </div>
  );
}
