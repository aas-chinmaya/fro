"use client";
import { useMemo, useState, type FormEvent } from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui";
import { Pagination, Search, TableToolbar } from "@/components/data-table";
import { useAppDispatch } from "@/store/hooks";
import { useVendorCategories } from "../hooks/useVendorCategories";
import {
  createVendorCategory,
  deleteVendorCategory,
  updateVendorCategory,
} from "../store/vendorCategorySlice";
import type { VendorCategory, VendorCategoryPayload } from "../types";

const emptyForm: VendorCategoryPayload = {
  code: "",
  name: "",
  description: "",
  status: "ACTIVE",
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default function VendorCategories() {
  const dispatch = useAppDispatch();
  const { items, pagination, loading, saving, refresh } = useVendorCategories();
  const [form, setForm] = useState<VendorCategoryPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<VendorCategory | null>(null);
  const currentPage = pagination.page || 1;
  const pageSize = pagination.limit || 10;
  const totalPages =
    pagination.totalPages ??
    (pagination.total
      ? Math.max(1, Math.ceil(pagination.total / pageSize))
      : currentPage);
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = [
        item.code,
        item.name,
        item.description ?? "",
        item.status,
      ].some((value) => String(value ?? "").toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setIsFormOpen(false);
  };

  const editItem = (item: VendorCategory) => {
    setEditingId(item.id);
    setForm({
      code: item.code,
      name: item.name,
      description: item.description ?? "",
      status: item.status,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
    };
    if (!payload.code || !payload.name) {
      setFormError("Code and name are required.");
      return;
    }
    try {
      if (editingId)
        await dispatch(
          updateVendorCategory({ id: editingId, payload }),
        ).unwrap();
      else await dispatch(createVendorCategory(payload)).unwrap();
      resetForm();
    } catch {
      /* The slice exposes the server error. */
    }
  };

  const removeItem = async (item: VendorCategory) => {
    try {
      await dispatch(deleteVendorCategory(item.id)).unwrap();
      if (editingId === item.id) resetForm();
    } catch {
      /* The slice exposes the server error. */
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    await removeItem(deleteItem);
    setDeleteItem(null);
  };

  return (
    <main className="space-y-5 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FolderTree className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Vendor categories
            </h1>
            <p className="text-sm text-muted">
              Master table · {pagination.total ?? items.length} records
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setFormError(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add category
        </Button>
      </div>

      <TableToolbar>
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Search
            value={search}
            onChange={setSearch}
            placeholder="Search categories..."
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </TableToolbar>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Category name</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading vendor categories...
                  </td>
                </tr>
              )}
              {!loading && filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No vendor categories found.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                      {item.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-gray-500">
                      {item.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          item.status === "ACTIVE" ? "success" : "warning"
                        }
                      >
                        {item.status === "ACTIVE" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => editItem(item)}
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteItem(item)}
                          aria-label={`Delete ${item.name}`}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="border-t">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalRecords={pagination.total ?? items.length}
            pageSize={pageSize}
            onPageChange={(page) => void refresh(page, pageSize)}
          />
        </div>
      </div>

      <Modal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) resetForm();
        }}
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingId ? "Edit vendor category" : "Add vendor category"}
            </ModalTitle>
            <ModalDescription>
              Use a unique code for this category.
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <form
              id="vendor-category-form"
              className="space-y-4"
              onSubmit={submit}
            >
              <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                Code <span className="text-red-500">*</span>
                <Input
                  value={form.code}
                  maxLength={50}
                  onChange={(event) =>
                    setForm({ ...form, code: event.target.value })
                  }
                  placeholder="ELECTRONICS"
                />
              </label>
              <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
                <Input
                  value={form.name}
                  maxLength={120}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Electronics"
                />
              </label>
              <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                Description
                <textarea
                  value={form.description ?? ""}
                  maxLength={500}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Optional description"
                  className="min-h-24 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </label>
              <label className="block space-y-1.5 text-sm font-medium text-gray-700">
                Status
                <select
                  value={form.status ?? "ACTIVE"}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" form="vendor-category-form" disabled={saving}>
              <Plus className="mr-2 h-4 w-4" />
              {saving
                ? "Saving..."
                : editingId
                  ? "Update category"
                  : "Create category"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        open={Boolean(deleteItem)}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null);
        }}
      >
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Delete vendor category?</ModalTitle>
            <ModalDescription>
              This action will permanently remove{" "}
              {deleteItem?.name || "this vendor category"}.
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this vendor category?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteItem(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void confirmDelete()}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}
