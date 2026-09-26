"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchModulesPaginated,
  createModule,
  updateModule,
  deleteModule,
  selectModule,
  clearError,
  clearSuccess,
} from "@/modules/masters/store/masterSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { Module, Submodule } from "@/modules/masters/types";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { Pagination } from "@/components/data-table";
import SubmoduleSection from "@/modules/masters/components/submodule/allSubmodule";
import ModuleFormModal from "./addModule";
import DeleteModuleDialog from "./deleteModule";
import ModuleTableRow from "./updateModule";

const PAGE_SIZE = 10;

export default function ModuleAndSubmodulePage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    modules,
    modulesLoading,
    submodules,
    submodulesLoading,
    selectedModuleId,
    isLoading,
    error,
    success,
  } = useSelector((state: RootState) => state.masters);

  // Module states
  const [moduleSearch, setModuleSearch] = useState("");
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string>("");
  const [modulePage, setModulePage] = useState(1);
  const [moduleForm, setModuleForm] = useState<Module>({
    name: "",
    route: "",
    description: "",
    priority: 1,
  });

  // Submodule states


  // Fetch modules on mount
  useEffect(() => {
    dispatch(fetchModulesPaginated({ search: moduleSearch, page: modulePage, limit: PAGE_SIZE }));
  }, [moduleSearch, modulePage, dispatch]);

  useEffect(() => {
    setModulePage(1);
  }, [moduleSearch]);

  const { modulesPagination } = useSelector((state: RootState) => state.masters);



  // Handle success/error
  useEffect(() => {
    if (success) {
      dispatch(clearSuccess());
      setShowModuleModal(false);
      setModuleForm({ name: "", route: "", description: "", priority: 1 });
      setEditingModule(null);
      dispatch(fetchModulesPaginated({ search: moduleSearch, page: modulePage, limit: PAGE_SIZE }));
    }
  }, [success, dispatch, moduleSearch, selectedModuleId]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Module handlers
  const handleModuleRowClick = (module: Module) => {
    dispatch(selectModule(module.id || null));
  };

  const handleAddModule = () => {
    setEditingModule(null);
    setModuleForm({ name: "", route: "", description: "", priority: 1 });
    setShowModuleModal(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm(module);
    setShowModuleModal(true);
  };

  const handleDeleteModule = async (id: string | number | undefined) => {
    if (!id) return;
    const moduleItem = modules.find((item) => String(item.id) === String(id));
    setPendingDeleteId(String(id));
    setPendingDeleteName(moduleItem?.name ?? "this module");
    setConfirmOpen(true);
  };

  const confirmDeleteModule = async () => {
    if (!pendingDeleteId) return;
    try {
      await dispatch(deleteModule(pendingDeleteId)).unwrap();
    } catch {
      // error handled by slice
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
      setPendingDeleteName("");
    }
  };

  const handleSubmitModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModule?.id) {
      await dispatch(updateModule({ id: editingModule.id, data: moduleForm })).unwrap();
    } else {
      await dispatch(createModule(moduleForm)).unwrap();
    }
  };

  const getSelectedModuleName = () => {
    const module = modules.find((m) => m.id === selectedModuleId);
    return module?.name || "No module selected";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Module & Submodule Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE - MODULES */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Modules</h2>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none"
                  />
                </div>
                <Button onClick={handleAddModule} variant="primary" className="flex items-center gap-2">
                  <Plus size={20} />
                  Add Module
                </Button>
              </div>
            </div>

            {/* Module Table */}
            <div className="overflow-x-auto">
              {modulesLoading ? (
                <div className="p-6 text-center text-gray-500">Loading modules...</div>
              ) : modules.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No modules found</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((module) => (
                      <ModuleTableRow
                        key={module.id ?? module.name}
                        module={module}
                        selectedModuleId={selectedModuleId}
                        onSelect={handleModuleRowClick}
                        onEdit={handleEditModule}
                        onDelete={handleDeleteModule}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {modules.length > 0 && (
              <Pagination
                page={modulePage}
                totalPages={modulesPagination.totalPages}
                totalRecords={modulesPagination.total}
                pageSize={modulesPagination.limit}
                onPageChange={setModulePage}
              />
            )}
          </div>

          <SubmoduleSection />
        </div>
      </div>

      <ModuleFormModal
        open={showModuleModal}
        editingModule={editingModule}
        onClose={() => setShowModuleModal(false)}
        onSubmit={handleSubmitModule}
        form={moduleForm}
        onFieldChange={(field, value) => setModuleForm({ ...moduleForm, [field]: value })}
        isLoading={isLoading}
      />

      <DeleteModuleDialog
        open={confirmOpen}
        name={pendingDeleteName}
        onConfirm={confirmDeleteModule}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
          setPendingDeleteName("");
        }}
      />
    </div>
  );
}
