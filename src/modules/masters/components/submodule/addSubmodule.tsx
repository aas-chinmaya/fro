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
import type { Submodule } from "@/modules/masters/types";

interface SubmoduleFormModalProps {
  open: boolean;
  editingSubmodule: Submodule | null;
  selectedModuleName: string;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  form: Submodule;
  onFieldChange: (field: keyof Submodule, value: string | number) => void;
  isLoading: boolean;
}

export default function SubmoduleFormModal({
  open,
  editingSubmodule,
  selectedModuleName,
  onClose,
  onSubmit,
  form,
  onFieldChange,
  isLoading,
}: SubmoduleFormModalProps) {
  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>{editingSubmodule ? "Edit Submodule" : "Add Submodule"}</ModalTitle>
          <ModalDescription>
            {editingSubmodule ? "Update submodule information." : "Create a new submodule under the selected module."}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={onSubmit}>
          <ModalBody className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Module</label>
              <input
                type="text"
                value={selectedModuleName}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                placeholder="Enter submodule name"
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
                placeholder="Enter submodule route"
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
              {isLoading ? "Saving..." : editingSubmodule ? "Update Submodule" : "Save Submodule"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
