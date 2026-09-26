"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubmodules,
  createSubmodule,
  updateSubmodule,
  deleteSubmodule,
  clearError,
  clearSuccess,
} from "@/modules/masters/store/masterSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { Submodule } from "@/modules/masters/types";
import { notify } from "@/lib/toast";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import SubmoduleFormModal from "./addSubmodule";
import DeleteSubmoduleDialog from "./deleteSubmodule";
import SubmoduleTableRow from "./updateSubmodule";

export default function SubmoduleSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { submodules, submodulesLoading, selectedModuleId, isLoading, error, success, modules } =
    useSelector((state: RootState) => state.masters);

  const [submoduleSearch, setSubmoduleSearch] = useState("");
  const [showSubmoduleModal, setShowSubmoduleModal] = useState(false);
  const [editingSubmodule, setEditingSubmodule] = useState<Submodule | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string>("");
  const [submoduleForm, setSubmoduleForm] = useState<Submodule>({
    name: "",
    route: "",
    description: "",
    priority: 1,
    moduleId: "",
  });

  useEffect(() => {
    if (selectedModuleId) {
      dispatch(fetchSubmodules({ moduleId: selectedModuleId, search: submoduleSearch }));
    }
  }, [selectedModuleId, submoduleSearch, dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(clearSuccess());
      setShowSubmoduleModal(false);
      setSubmoduleForm({ name: "", route: "", description: "", priority: 1, moduleId: "" });
      setEditingSubmodule(null);
      if (selectedModuleId) dispatch(fetchSubmodules({ moduleId: selectedModuleId, search: submoduleSearch }));
    }
  }, [success, dispatch, selectedModuleId, submoduleSearch]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddSubmodule = () => {
    if (!selectedModuleId) {
      notify.error("Please select a module first");
      return;
    }
    setEditingSubmodule(null);
    setSubmoduleForm({ name: "", route: "", description: "", priority: 1, moduleId: selectedModuleId });
    setShowSubmoduleModal(true);
  };

  const handleEditSubmodule = (submodule: Submodule) => {
    setEditingSubmodule(submodule);
    setSubmoduleForm(submodule);
    setShowSubmoduleModal(true);
  };

  const handleDeleteSubmodule = async (id: string | number | undefined) => {
    if (!id) return;
    const submoduleItem = submodules.find((item) => String(item.id) === String(id));
    setPendingDeleteId(String(id));
    setPendingDeleteName(submoduleItem?.name ?? "this submodule");
    setConfirmOpen(true);
  };

  const confirmDeleteSubmodule = async () => {
    if (!pendingDeleteId) return;
    try {
      await dispatch(deleteSubmodule(pendingDeleteId)).unwrap();
    } catch {
      // error handled by slice
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
      setPendingDeleteName("");
    }
  };

  const handleSubmitSubmodule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubmodule?.id) {
      await dispatch(updateSubmodule({ id: editingSubmodule.id, data: submoduleForm })).unwrap();
    } else {
      await dispatch(createSubmodule(submoduleForm)).unwrap();
    }
  };

  const getSelectedModuleName = () => {
    const module = modules.find((m) => m.id === selectedModuleId);
    return module?.name || "No module selected";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submodules</h2>
        <p className="text-sm text-gray-600 mb-4">
          {selectedModuleId ? `Selected: ${getSelectedModuleName()}` : "Select a module to see submodules"}
        </p>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search submodules..."
              value={submoduleSearch}
              onChange={(e) => setSubmoduleSearch(e.target.value)}
              disabled={!selectedModuleId}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg  outline-none disabled:bg-gray-100"
            />
          </div>
          <Button onClick={handleAddSubmodule} disabled={!selectedModuleId} variant="primary" className="flex items-center gap-2">
            <Plus size={20} />
            Add Submodule
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {!selectedModuleId ? (
          <div className="p-6 text-center text-gray-500">Select a module to view submodules</div>
        ) : submodulesLoading ? (
          <div className="p-6 text-center text-gray-500">Loading submodules...</div>
        ) : submodules.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No submodules found</div>
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
              {submodules.map((submodule) => (
                <SubmoduleTableRow
                  key={submodule.id ?? submodule.name}
                  submodule={submodule}
                  onEdit={handleEditSubmodule}
                  onDelete={handleDeleteSubmodule}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SubmoduleFormModal
        open={showSubmoduleModal}
        editingSubmodule={editingSubmodule}
        selectedModuleName={getSelectedModuleName()}
        onClose={() => setShowSubmoduleModal(false)}
        onSubmit={handleSubmitSubmodule}
        form={submoduleForm}
        onFieldChange={(field, value) => setSubmoduleForm({ ...submoduleForm, [field]: value })}
        isLoading={isLoading}
      />

      <DeleteSubmoduleDialog
        open={confirmOpen}
        name={pendingDeleteName}
        onConfirm={confirmDeleteSubmodule}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
          setPendingDeleteName("");
        }}
      />
    </div>
  );
}
