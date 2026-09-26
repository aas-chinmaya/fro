"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { CategoryMasterRow } from "../../../types";
import { CategoryActions } from "@/modules/items/components/masters/category/CategoryActions";

export const CategoryMasterColumns = (
  onDeleteSuccess?: () => void
): ColumnDef<CategoryMasterRow>[] => [
  {
    accessorKey: "categoryType",
    header: "Category Type",
    cell: ({ row }) => {
      const type = row.original.categoryType;

      return (
        <span>
          {type === "SERVICE" ? "Service" : "Product"}
        </span>
      );
    },
  },

  {
    accessorKey: "categoryName",
    header: "Category Name",
  },

  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const html = row.original.description || "";

      const text = html
        .replace(/<[^>]*>/g, "")
        .trim();

      return (
        <span className="line-clamp-2">
          {text || "-"}
        </span>
      );
    },
  },

  {
    id: "actions",
    header: () => (
      <div className="text-right">
        Actions
      </div>
    ),

    cell: ({ row }) => (
      <CategoryActions
        id={String(row.original.id)}
        name={row.original.categoryName}
        onDeleteSuccess={onDeleteSuccess}
      />
    ),

    enableSorting: false,
    enableHiding: false,
  },
];
