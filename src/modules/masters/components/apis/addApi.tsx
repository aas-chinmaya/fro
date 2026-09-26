import type { BaseSyntheticEvent } from "react";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
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
import type { API, Feature, Submodule, Module } from "@/modules/masters/types";
import type { ApiFormValues } from "@/modules/masters/validation";

interface ApiFormModalProps {
  open: boolean;
  editingApi: API | null;
  onClose: () => void;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void> | void;
  register: UseFormRegister<ApiFormValues>;
  errors: FieldErrors<ApiFormValues>;
  setValue: UseFormSetValue<ApiFormValues>;
  modules: Module[];
  submodules: Submodule[];
  features: Feature[];
  loadingSubmodules: boolean;
  loadingFeatures: boolean;
  currentModuleId: string | number | undefined;
  isSubmitting: boolean;
  isLoading: boolean;
}

export default function ApiFormModal({
  open,
  editingApi,
  onClose,
  onSubmit,
  register,
  errors,
  setValue,
  modules,
  submodules,
  features,
  loadingSubmodules,
  loadingFeatures,
  currentModuleId,
  isSubmitting,
  isLoading,
}: ApiFormModalProps) {
  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>{editingApi ? "Edit API" : "Add API"}</ModalTitle>
          <ModalDescription>
            {editingApi ? "Update API information." : "Create a new API endpoint."}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={onSubmit}>
          <ModalBody className="max-h-[70vh] space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Module</label>
                <select
                  {...register("moduleId")}
                  onChange={(e) => {
                    setValue("moduleId", e.target.value);
                    setValue("subModuleId", "");
                    setValue("featureId", "");
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Module</option>
                  {modules.map((module) => (
                    <option key={module.id} value={String(module.id)}>
                      {module.name}
                    </option>
                  ))}
                </select>
                {errors.moduleId && <p className="mt-1 text-sm text-red-500">{errors.moduleId.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Sub Module</label>
                <select
                  {...register("subModuleId")}
                  onChange={(e) => {
                    setValue("subModuleId", e.target.value);
                    setValue("featureId", "");
                  }}
                  disabled={!currentModuleId || loadingSubmodules}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                >
                  <option value="">{loadingSubmodules ? "Loading..." : "Select Sub Module"}</option>
                  {submodules.map((submodule) => (
                    <option key={submodule.id} value={String(submodule.id)}>
                      {submodule.name}
                    </option>
                  ))}
                </select>
                {errors.subModuleId && <p className="mt-1 text-sm text-red-500">{errors.subModuleId.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Feature</label>
                <select
                  {...register("featureId")}
                  disabled={!currentModuleId || loadingFeatures}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                >
                  <option value="">{loadingFeatures ? "Loading..." : "Select Feature"}</option>
                  {features.map((feature) => (
                    <option key={feature.id} value={String(feature.id)}>
                      {feature.name}
                    </option>
                  ))}
                </select>
                {errors.featureId && <p className="mt-1 text-sm text-red-500">{errors.featureId.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Method</label>
                <select
                  {...register("method")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
                {errors.method && <p className="mt-1 text-sm text-red-500">{errors.method.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                {...register("name")}
                placeholder="Enter API name"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Route</label>
              <input
                type="text"
                {...register("route")}
                placeholder="Enter API route"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
              />
              {errors.route && <p className="mt-1 text-sm text-red-500">{errors.route.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                {...register("description")}
                placeholder="Enter description"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none placeholder-gray-400 focus:ring-2 focus:ring-primary"
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
            </div>

          
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? "Saving..." : editingApi ? "Update API" : "Save API"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
