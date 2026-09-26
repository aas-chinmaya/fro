"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import DeleteCategoryModal from "./DeleteCategoryModal";

interface CategoryActionsProps {
  id: string;
  name: string;
  onDeleteSuccess?: () => void;
}

export function CategoryActions({
  id,
  name,
  onDeleteSuccess,
}: CategoryActionsProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = () => {
    router.push(`/items/category-master/${id}/edit`);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {/* View */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="View category"
          title="View category"
          onClick={() =>
            router.push(`/items/category-master/${id}`)
          }
          className="hover:bg-primary/10 hover:text-primary"
        >
          <Eye className="h-4 w-4" />
        </Button>

        {/* Edit */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Edit category"
          title="Edit category"
          onClick={handleEdit}
          className="hover:bg-primary/10 hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        {/* Delete */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete category"
          title="Delete category"
          onClick={() => setIsDeleteOpen(true)}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <DeleteCategoryModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        categoryId={id}
        categoryName={name}
        onDeleteSuccess={onDeleteSuccess}
      />
    </>
  );
}
