"use client";

import { DataTable, Pagination, Search, TableToolbar } from "@/components/data-table";
import { Switch } from "@/components/ui";
import { ProductRow } from "@/modules/items/types";
import ItemActions from "./ItemActions";

interface Props {
  products: ProductRow[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  totalRecords?: number;
  search: string;
  onPageChange?: (page: number) => void;
  onSearch: (search: string) => void;
  onStatusChange?: (id: string, status: boolean) => Promise<void> | void;
}

export default function ProductTable({
  products,
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
        <Search placeholder="Search product..." value={search} onChange={onSearch} />
      </TableToolbar>

      <DataTable
        columns={[
          { accessorKey: "itemCode", header: "Item Code" },
          { accessorKey: "itemName", header: "Item Name" },
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
          {
            id: "brand",
            header: "Brand",
            cell: ({ row }) => <span>{row.original.brand?.brandName ?? "-"}</span>,
          },
          {
            id: "unit",
            header: "Unit",
            cell: ({ row }) => <span>{row.original.inventoryUnit?.unitName ?? "-"}</span>,
          },
          {
            id: "tax",
            header: "Tax",
            cell: ({ row }) => <span>{row.original.tax?.gstRate ?? "-"}%</span>,
          },
          { accessorKey: "minimumStock", header: "Min Stock" },
          { accessorKey: "maximumStock", header: "Max Stock" },
          {
            id: "status",
            header: "Status",
            cell: ({ row }) => {
              const itemId = String(row.original.id ?? (row.original as any)._id ?? "");
              return (
                <Switch
                  checked={row.original.status}
                  onCheckedChange={(next) => itemId && onStatusChange?.(itemId, !!next)}
                  aria-label="Toggle product status"
                />
              );
            },
          },
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
              const itemId = String(row.original.id ?? (row.original as any)._id ?? "");
              return <ItemActions id={itemId} name={row.original.itemName} />;
            },
            enableSorting: false,
            enableHiding: false,
          },
        ]}
        data={products}
        loading={loading}
        emptyMessage="No products found."
      />

      <Pagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={(nextPage) => onPageChange?.(nextPage)} />
    </div>
  );
}
