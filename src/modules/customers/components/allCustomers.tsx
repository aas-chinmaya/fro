"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCustomers, setLoading } from "../store/customers.slice";
import { customersService } from "../services/customers.service";
import { Customer } from "../types";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import Search from "@/components/data-table/Search";
import Pagination from "@/components/data-table/Pagination";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

export default function AllCustomers() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { customers, loading } = useAppSelector((state) => state.customers);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      dispatch(setLoading(true));
      const response = await customersService.getCustomers();
      dispatch(setCustomers(response.data || response));
    } catch (error) {
      notify.error("Failed to fetch customers. Please try again.");
      console.error("Error fetching customers:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await customersService.deleteCustomer(id);
        notify.success("Customer deleted successfully.");
        fetchCustomers();
      } catch (error) {
        notify.error("Failed to delete customer. Please try again.");
        console.error("Error deleting customer:", error);
      }
    }
  };

  const columns: ColumnDef<Customer>[] = [
    // {
    //   accessorKey: "customerCode",
    //   header: "Code",
    //   cell: ({ row }) => (
    //     <span className="font-medium">{row.getValue("customerCode") || "N/A"}</span>
    //   ),
    // },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.getValue("name")}</p>
          <p className="text-xs text-gray-500">
            {row.original.companyName || "N/A"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "customerType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("customerType") as string;
        const variants: Record<string, any> = {
          WALK_IN: "default",
          REGULAR: "secondary",
          WHOLESALE: "outline",
        };
        return <Badge variant={variants[type] || "default"}>{type}</Badge>;
      },
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
      cell: ({ row }) => <span>{row.getValue("mobile")}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("email") || "N/A"}</span>
      ),
    },
    // {
    //   accessorKey: "creditLimit",
    //   header: "Credit Limit",
    //   cell: ({ row }) => (
    //     <span className="font-semibold">
    //       ₹{(row.getValue("creditLimit") as number).toLocaleString()}
    //     </span>
    //   ),
    // },
    {
  accessorKey: "isActive",
  header: "Status",
  cell: ({ row }) => {
    const isActive = row.getValue("isActive") as boolean;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
          isActive
            ? "bg-green-50 text-green-600"
            : "bg-red-50 text-red-600"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isActive ? "bg-green-500" : "bg-red-500"
          }`}
        />
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  },
},
   {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Edit customer"
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/customers/${row.original.id}/edit`);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Delete customer"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(row.original.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <Search
            placeholder="Search by name, mobile, or email..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <Button
          onClick={() => router.push("/customers/add")}
          className="w-full sm:w-auto"
        >
          + Add Customer
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedCustomers}
        loading={loading}
        onRowClick={(customer) => router.push(`/customers/${customer.id}/customer-dashboard`)}
        emptyMessage={
          filteredCustomers.length === 0
            ? searchTerm
              ? "No customers found matching your search."
              : "No customers found. Click 'Add Customer' to create one."
            : "Loading..."
        }
      />

      {/* Pagination */}
      {!loading && filteredCustomers.length > 0 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalRecords={filteredCustomers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
