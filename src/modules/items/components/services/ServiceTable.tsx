"use client";

import { DataTable, Pagination, Search, TableToolbar } from "@/components/data-table";
import { Switch } from "@/components/ui";
import { ServiceRow } from "@/modules/items/types";
import ServiceActions from "./ServiceActions";

interface Props {
  services: ServiceRow[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  totalRecords?: number;
  search: string;
  onPageChange?: (page: number) => void;
  onSearch: (search: string) => void;
  onStatusChange?: (id: string, status: boolean) => Promise<void> | void;
}

export default function ServiceTable({
  services,
  loading = false,
  page = 1,
  totalPages = 1,
  totalRecords = 0,
  search,
  onPageChange,
  onSearch,
  onStatusChange,
}: Props) {
  return (
    <div className="space-y-4">
      <TableToolbar>
        <Search placeholder="Search service..." value={search} onChange={onSearch} />
      </TableToolbar>

      <DataTable
        columns={[
          { accessorKey: "serviceCode", header: "Service Code" },
          { accessorKey: "serviceName", header: "Service Name" },
          {
            id: "category",
            header: "Category",
            cell: ({ row }) => <span>{row.original.category?.categoryName ?? "-"}</span>,
          },
          {
            id: "subCategory",
            header: "Sub Category",
            cell: ({ row }) => <span>{row.original.subCategory?.subCategoryName ?? "-"}</span>,
          },
          // {
          //   id: "tax",
          //   header: "Tax",
          //   cell: ({ row }) => <span>{row.original.tax?.hsnCode ?? "-"}</span>,
          // },
          { accessorKey: "sacCode", header: "SAC Code" },
          { accessorKey: "serviceCharge", header: "Service Charge" },
          { accessorKey: "gstRate", header: "GST Rate" },
          {
            id: "status",
            header: "Status",
            cell: ({ row }) => {
              const serviceId = String(row.original.id ?? "");
              return (
                <Switch
                  checked={row.original.status}
                  onCheckedChange={(next) => serviceId && onStatusChange?.(serviceId, !!next)}
                  aria-label="Toggle service status"
                />
              );
            },
          },
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
              const serviceId = String(row.original.id ?? "");
              return <ServiceActions id={serviceId} name={row.original.serviceName} />;
            },
            enableSorting: false,
            enableHiding: false,
          },
        ]}
        data={services}
        loading={loading}
        emptyMessage="No services found."
      />

      <Pagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={(nextPage) => onPageChange?.(nextPage)} />
    </div>
  );
}
