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
import type { Feature, Submodule } from "@/modules/masters/types";

interface FeatureFormModalProps {
  open: boolean;
  editingFeature: Feature | null;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  form: Feature;
  onFieldChange: (field: keyof Feature, value: string | number) => void;
  modules: Array<{ id?: string | number; name: string }>;
  submodules: Submodule[];
  loadingSubmodules: boolean;
  isLoading: boolean;
}

export default function FeatureFormModal({
  open,
  editingFeature,
  onClose,
  onSubmit,
  form,
  onFieldChange,
  modules,
  submodules,
  loadingSubmodules,
  isLoading,
}: FeatureFormModalProps) {
  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>{editingFeature ? "Edit Feature" : "Add Feature"}</ModalTitle>
          <ModalDescription>
            {editingFeature ? "Update feature information." : "Create a new feature."}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={onSubmit}>
          <ModalBody className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Module</label>
              <select
                value={String(form.moduleId ?? "")}
                onChange={(e) => onFieldChange("moduleId", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Module</option>
                {modules.map((module) => (
                  <option key={module.id} value={String(module.id)}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sub Module</label>
              <select
                value={String(form.subModuleId ?? "")}
                onChange={(e) => onFieldChange("subModuleId", e.target.value)}
                disabled={!form.moduleId || loadingSubmodules}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              >
                <option value="">{loadingSubmodules ? "Loading..." : "Select Sub Module"}</option>
                {submodules.map((submodule) => (
                  <option key={submodule.id} value={String(submodule.id)}>
                    {submodule.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                placeholder="Enter feature name"
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
                placeholder="Enter feature route"
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
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editingFeature ? "Update Feature" : "Save Feature"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
