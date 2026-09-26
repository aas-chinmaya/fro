"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFeaturesPaginated,
  createFeature,
  updateFeature,
  deleteFeature,
  clearError,
  clearSuccess,
  fetchModules,
} from "@/modules/masters/store/masterSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { Feature, Module, Submodule } from "@/modules/masters/types";
import { notify } from "@/lib/toast";
import { Search, Plus } from "lucide-react";
import { getSubmodules } from "@/modules/masters/api/master.api";
import { Button } from "@/components/ui";
import { Pagination } from "@/components/data-table";
import FeatureFormModal from "./addFeature";
import DeleteFeatureDialog from "./deleteFeature";
import FeatureTableRow from "./updateFeature";

const PAGE_SIZE = 10;

export default function FeatureMasterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { features, isLoading, error, success } = useSelector(
    (state: RootState) => state.masters
  );
  const { modules } = useSelector((state: RootState) => state.masters);

  // State management
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [submodules, setSubmodules] = useState<Submodule[]>([]);
  const [loadingSubmodules, setLoadingSubmodules] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState<string>("");


  const [formData, setFormData] = useState<Feature>({
    name: "",
    route: "",
    description: "",
    priority: 1,
    moduleId: "",
    subModuleId: "",
  });

  const getFeatureModuleId = (feature: Feature) =>
    feature.moduleId ?? feature.module?.id ?? feature.subModule?.module?.id ?? "";

  const getFeatureSubmoduleId = (feature: Feature) =>
    feature.subModuleId ?? feature.subModule?.id ?? "";

  // Fetch modules on mount
  useEffect(() => {
    dispatch(fetchModules({ search: "" }));
  }, [dispatch]);

  // Fetch features
  useEffect(() => {
    dispatch(fetchFeaturesPaginated({
      search,
      page,
      limit: PAGE_SIZE,
      moduleId: selectedModuleId || undefined,
      subModuleId: selectedSubmoduleId || undefined,
    }));
  }, [search, dispatch, page, selectedModuleId, selectedSubmoduleId]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedModuleId, selectedSubmoduleId]);

  const { featuresPagination } = useSelector((state: RootState) => state.masters);

  // Fetch submodules when module changes
  useEffect(() => {
    const handleSubmoduleFetch = async () => {
      const moduleId = selectedModuleId || formData.moduleId;
      if (moduleId) {
        setLoadingSubmodules(true);
        try {
          const data = await getSubmodules(String(moduleId));
          setSubmodules(data);
        } catch (err) {
          notify.error("Failed to fetch submodules");
          setSubmodules([]);
        } finally {
          setLoadingSubmodules(false);
        }
      } else {
        setSubmodules([]);
      }
    };
    handleSubmoduleFetch();
  }, [formData.moduleId, selectedModuleId]);

  useEffect(() => {
    if (success) {
      dispatch(clearSuccess());
      setShowModal(false);
      resetFormData();
      dispatch(fetchFeaturesPaginated({
        search,
        page,
        limit: PAGE_SIZE,
        moduleId: selectedModuleId || undefined,
        subModuleId: selectedSubmoduleId || undefined,
      }));
    }
  }, [success, dispatch, search, page, selectedModuleId, selectedSubmoduleId]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddFeature = () => {
    resetFormData();
    setShowModal(true);
  };

  const handleEditFeature = async (feature: Feature) => {
    const subModuleId = getFeatureSubmoduleId(feature);
    let moduleId = getFeatureModuleId(feature);

    if (!moduleId && subModuleId) {
      setLoadingSubmodules(true);
      try {
        const allSubmodules = await getSubmodules();
        setSubmodules(allSubmodules);
        moduleId = allSubmodules.find(
          (submodule) => String(submodule.id) === String(subModuleId),
        )?.moduleId ?? "";
      } catch {
        notify.error("Failed to fetch submodules");
      } finally {
        setLoadingSubmodules(false);
      }
    }

    setEditingFeature(feature);
    setFormData({
      ...feature,
      moduleId,
      subModuleId,
    });
    setShowModal(true);
  };

  const handleDeleteFeature = async (id: string | number | undefined) => {
    if (!id) return;
    const featureItem = features.find((item) => item.id === id);
    setPendingDeleteId(id);
    setPendingDeleteName(featureItem?.name ?? "this feature");
    setConfirmOpen(true);
  };

  const confirmDeleteFeature = async () => {
    if (!pendingDeleteId) return;
    try {
      await dispatch(deleteFeature(pendingDeleteId)).unwrap();
    } catch {
      // error handled by slice
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
      setPendingDeleteName("");
    }
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      route: "",
      description: "",
      priority: 1,
      moduleId: "",
      subModuleId: "",
    });
    setEditingFeature(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Feature = {
      name: formData.name,
      route: formData.route,
      description: formData.description,
      priority: formData.priority,
      moduleId: formData.moduleId as string | number,
      subModuleId: formData.subModuleId as string | number,
    };

    if (editingFeature?.id) {
      await dispatch(updateFeature({ id: editingFeature.id, data: payload })).unwrap();
    } else {
      await dispatch(createFeature(payload)).unwrap();
    }
  };

  const selectedModuleName = useMemo(() => {
    return modules.find((module) => String(module.id) === String(formData.moduleId))?.name ?? "";
  }, [formData.moduleId, modules]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Feature Master</h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg  outline-none"
                />
              </div>
              <select
                value={selectedModuleId}
                onChange={(event) => {
                  setSelectedModuleId(event.target.value);
                  setSelectedSubmoduleId("");
                }}
                className="min-w-48 rounded-lg border border-gray-300 px-3 py-2 outline-none "
              >
                <option value="">All modules</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedSubmoduleId}
                onChange={(event) => setSelectedSubmoduleId(event.target.value)}
                disabled={!selectedModuleId || loadingSubmodules}
                className="min-w-48 rounded-lg border border-gray-300 px-3 py-2 outline-none  disabled:bg-gray-100"
              >
                <option value="">All submodules</option>
                {submodules.map((submodule) => (
                  <option key={submodule.id} value={submodule.id}>
                    {submodule.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleAddFeature} variant="primary" className="flex items-center gap-2">
                <Plus size={20} />
                Add Feature
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Route</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {features.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No features found
                    </td>
                  </tr>
                ) : (
                  features.map((feature) => (
                    <FeatureTableRow
                      key={feature.id ?? feature.name}
                      feature={feature}
                      onEdit={handleEditFeature}
                      onDelete={handleDeleteFeature}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {features.length > 0 && (
            <Pagination
              page={page}
              totalPages={featuresPagination.totalPages}
              totalRecords={featuresPagination.total}
              pageSize={featuresPagination.limit}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <FeatureFormModal
        open={showModal}
        editingFeature={editingFeature}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        form={formData}
        onFieldChange={(field, value) => setFormData((current) => ({ ...current, [field]: value }))}
        modules={modules}
        submodules={submodules}
        loadingSubmodules={loadingSubmodules}
        isLoading={isLoading}
      />

      <DeleteFeatureDialog
        open={confirmOpen}
        name={pendingDeleteName}
        onConfirm={confirmDeleteFeature}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
          setPendingDeleteName("");
        }}
      />
    </div>
  );
}
