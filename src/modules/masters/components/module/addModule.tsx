import type { FormEventHandler } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  Button,
} from "@/components/ui";
import type { Module } from "@/modules/masters/types";

interface ModuleFormModalProps {
  open: boolean;
  editingModule: Module | null;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  form: Module;
  onFieldChange: (field: keyof Module, value: string | number) => void;
  isLoading: boolean;
}

export default function ModuleFormModal({
  open,
  editingModule,
  onClose,
  onSubmit,
  form,
  onFieldChange,
  isLoading,
}: ModuleFormModalProps) {
  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>{editingModule ? "Edit Module" : "Add Module"}</ModalTitle>
          <ModalDescription>
            {editingModule ? "Update module information." : "Create a new module."}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={onSubmit}>
          <ModalBody className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                placeholder="Enter module name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Route</label>
              <input
                type="text"
                value={form.route}
                onChange={(e) => onFieldChange("route", e.target.value)}
                placeholder="Enter module route"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                placeholder="Enter description"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
              <input
                type="number"
                min={1}
                value={form.priority}
                onChange={(e) => onFieldChange("priority", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editingModule ? "Update Module" : "Save Module"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
