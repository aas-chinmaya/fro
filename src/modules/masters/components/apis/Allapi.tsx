"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { Pagination } from "@/components/data-table";
import ApiFormModal from "./addApi";
import DeleteApiDialog from "./deleteApi";
import ApiTableRow from "./updateApi";
import {
  fetchApis,
  createApi,
  updateApi,
  deleteApi,
  clearError,
  clearSuccess,
  fetchModules,
} from "@/modules/masters/store/masterSlice";
import {
  getFeaturesByModule,
  getFeaturesBySubModule,
  getSubmodules,
} from "@/modules/masters/api/master.api";
import type { AppDispatch, RootState } from "@/store/store";
import type { API, Feature, Submodule } from "@/modules/masters/types";
import { apiSchema, type ApiFormValues } from "@/modules/masters/validation";

const PAGE_SIZE = 10;

export default function ApiMasterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { apis, apisPagination, isLoading, error, success } = useSelector((state: RootState) => state.masters);
  const { modules } = useSelector((state: RootState) => state.masters);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingApi, setEditingApi] = useState<API | null>(null);
  const [submodules, setSubmodules] = useState<Submodule[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loadingSubmodules, setLoadingSubmodules] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string>("");
  const [page, setPage] = useState(1);
  const [filterModuleId, setFilterModuleId] = useState<string>("");
  const [filterSubmoduleId, setFilterSubmoduleId] = useState<string>("");
  const [filterFeatureId, setFilterFeatureId] = useState<string>("");
  const [filterSubmodules, setFilterSubmodules] = useState<Submodule[]>([]);
  const [filterFeatures, setFilterFeatures] = useState<Feature[]>([]);

  const defaultValues: ApiFormValues = {
    name: "",
    method: "GET",
    route: "",
    description: "",
    priority: 1,
    moduleId: "",
    subModuleId: "",
    featureId: "",
  };

const {
  register,
  handleSubmit,
  reset,
  watch,
  setValue,
  formState: { errors, isSubmitting },
} = useForm<ApiFormValues>({
  resolver: zodResolver(apiSchema),
  defaultValues,
});

  const currentModuleId = watch("moduleId");
  const currentSubModuleId = watch("subModuleId");

  const getApiModuleId = (api: API) =>
    api.moduleId ??
    api.module?.id ??
    api.subModule?.module?.id ??
    api.feature?.module?.id ??
    api.feature?.subModule?.moduleId ??
    api.feature?.subModule?.module?.id ??
    "";

  const getApiSubmoduleId = (api: API) =>
    api.subModuleId ?? api.subModule?.id ?? api.feature?.subModule?.id ?? "";

  const getApiFeatureId = (api: API) => api.featureId ?? api.feature?.id ?? "";

  useEffect(() => {
    dispatch(fetchModules({ search: "" }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchApis({
      search,
      page,
      limit: PAGE_SIZE,
      moduleId: filterModuleId || undefined,
      subModuleId: filterSubmoduleId || undefined,
      featureId: filterFeatureId || undefined,
    }));
  }, [dispatch, search, page, filterModuleId, filterSubmoduleId, filterFeatureId]);

  useEffect(() => {
    setPage(1);
  }, [search, filterModuleId, filterSubmoduleId, filterFeatureId]);

  useEffect(() => {
    const loadFilterData = async () => {
      if (!filterModuleId) {
        setFilterSubmodules([]);
        setFilterFeatures([]);
        return;
      }

      try {
        const submoduleData = await getSubmodules(filterModuleId);
        setFilterSubmodules(submoduleData);
        const featureData = filterSubmoduleId
          ? await getFeaturesBySubModule(filterSubmoduleId)
          : await getFeaturesByModule(filterModuleId);
        setFilterFeatures(featureData);
      } catch {
        setFilterSubmodules([]);
        setFilterFeatures([]);
      }
    };

    loadFilterData();
  }, [filterModuleId, filterSubmoduleId]);

  const displayedApis =
    apisPagination.total > apis.length
      ? apis
      : apis.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    const loadRelatedData = async () => {
      if (!currentModuleId) {
        setSubmodules([]);
        setFeatures([]);
        setValue("subModuleId", "");
        setValue("featureId", "");
        return;
      }

      setLoadingSubmodules(true);
      setLoadingFeatures(true);

      try {
        const submoduleData = await getSubmodules(String(currentModuleId));
        const selectedSubmodule = submoduleData.find(
          (item) => String(item.id) === String(currentSubModuleId),
        );
        const selectedSubmoduleId = selectedSubmodule?.id;

        if (currentSubModuleId && submoduleData.length > 0 && !selectedSubmodule) {
          setValue("subModuleId", "");
          setValue("featureId", "");
        }

        const featureData = selectedSubmoduleId
          ? await getFeaturesBySubModule(selectedSubmoduleId)
          : await getFeaturesByModule(currentModuleId);

        setSubmodules(submoduleData);
        setFeatures(featureData);
      } catch {
        setSubmodules([]);
        setFeatures([]);
      } finally {
        setLoadingSubmodules(false);
        setLoadingFeatures(false);
      }
    };

    loadRelatedData();
  }, [currentModuleId, currentSubModuleId, setValue]);

  useEffect(() => {
    if (success) {
      dispatch(clearSuccess());
      setShowModal(false);
      resetFormData();
      dispatch(fetchApis({
        search,
        page,
        limit: PAGE_SIZE,
        moduleId: filterModuleId || undefined,
        subModuleId: filterSubmoduleId || undefined,
        featureId: filterFeatureId || undefined,
      }));
    }
  }, [success, dispatch, search, page, filterModuleId, filterSubmoduleId, filterFeatureId]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddApi = () => {
    reset(defaultValues);
    setEditingApi(null);
    setShowModal(true);
  };

  const handleEditApi = async (api: API) => {
    const moduleId = getApiModuleId(api);
    const subModuleId = getApiSubmoduleId(api);
    const featureId = getApiFeatureId(api);

    if (moduleId) {
      setLoadingSubmodules(true);
      setLoadingFeatures(true);
      try {
        const submoduleData = await getSubmodules(String(moduleId));
        const nestedSubmodule = api.feature?.subModule;
        const resolvedSubmodules = nestedSubmodule &&
          !submoduleData.some((item) => String(item.id) === String(subModuleId))
          ? [...submoduleData, nestedSubmodule]
          : submoduleData;
        setSubmodules(resolvedSubmodules);

        const featureData = subModuleId
          ? await getFeaturesBySubModule(subModuleId)
          : await getFeaturesByModule(moduleId);
        const resolvedFeatures = api.feature &&
          !featureData.some((item) => String(item.id) === String(featureId))
          ? [...featureData, api.feature]
          : featureData;
        setFeatures(resolvedFeatures);
      } catch {
        setSubmodules(api.feature?.subModule ? [api.feature.subModule] : []);
        setFeatures(api.feature ? [api.feature] : []);
      } finally {
        setLoadingSubmodules(false);
        setLoadingFeatures(false);
      }
    }

    setEditingApi(api);
    reset({
      name: api.name ?? "",
      method: (api.method as ApiFormValues["method"]) || "GET",
      route: api.route ?? "",
      description: api.description ?? "",
      priority: Number(api.priority ?? 1),
      moduleId,
      subModuleId,
      featureId,
    });
    setShowModal(true);
  };

  const handleDeleteApi = async (id: string | number | undefined) => {
    if (!id) return;
    const apiItem = apis.find((item) => item.id === id);
    setPendingDeleteId(id);
    setPendingDeleteName(apiItem?.name ?? "this API");
    setConfirmOpen(true);
  };

  const confirmDeleteApi = async () => {
    if (!pendingDeleteId) return;
    try {
      await dispatch(deleteApi(pendingDeleteId)).unwrap();
    } catch {
      // error is handled by the slice
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
      setPendingDeleteName("");
    }
  };

  const resetFormData = () => {
    reset(defaultValues);
    setEditingApi(null);
  };

  const onSubmit = async (data: ApiFormValues) => {
    const payload: API = {
      name: data.name,
      method: data.method,
      route: data.route,
      description: data.description,
      priority: Number(data.priority),
      featureId: data.featureId as string | number,
      subModuleId: data.subModuleId as string | number,
      moduleId: data.moduleId as string | number,
    };

    if (editingApi?.id) {
      await dispatch(updateApi({ id: editingApi.id, data: payload })).unwrap();
    } else {
      await dispatch(createApi(payload)).unwrap();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Master</h1>

        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search APIs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 outline-none "
                />
              </div>
              <select
                value={filterModuleId}
                onChange={(event) => {
                  setFilterModuleId(event.target.value);
                  setFilterSubmoduleId("");
                  setFilterFeatureId("");
                }}
                className="min-w-48 rounded-lg border border-gray-300 px-3 py-2 outline-none "
              >
                <option value="">All modules</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>{module.name}</option>
                ))}
              </select>
              <select
                value={filterSubmoduleId}
                onChange={(event) => {
                  setFilterSubmoduleId(event.target.value);
                  setFilterFeatureId("");
                }}
                disabled={!filterModuleId}
                className="min-w-48 rounded-lg border border-gray-300 px-3 py-2 outline-none  disabled:bg-gray-100"
              >
                <option value="">All submodules</option>
                {filterSubmodules.map((submodule) => (
                  <option key={submodule.id} value={submodule.id}>{submodule.name}</option>
                ))}
              </select>
              <select
                value={filterFeatureId}
                onChange={(event) => setFilterFeatureId(event.target.value)}
                disabled={!filterModuleId}
                className="min-w-48 rounded-lg border border-gray-300 px-3 py-2 outline-none  disabled:bg-gray-100"
              >
                <option value="">All features</option>
                {filterFeatures.map((feature) => (
                  <option key={feature.id} value={feature.id}>{feature.name}</option>
                ))}
              </select>
              <Button onClick={handleAddApi} variant="primary" className="flex items-center gap-2">
                <Plus size={20} />
                Add API
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Route</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {apis.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No APIs found
                    </td>
                  </tr>
                ) : (
                  displayedApis.map((api,index) => (
                    <ApiTableRow key={api.id ?? `${api.name}-${index}`} api={api} onEdit={handleEditApi} onDelete={handleDeleteApi} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {apis.length > 0 && (
            <Pagination
              page={page}
              totalPages={apisPagination.totalPages}
              totalRecords={apisPagination.total}
              pageSize={apisPagination.limit}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <ApiFormModal
        open={showModal}
        editingApi={editingApi}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        setValue={setValue}
        modules={modules}
        submodules={submodules}
        features={features}
        loadingSubmodules={loadingSubmodules}
        loadingFeatures={loadingFeatures}
        currentModuleId={currentModuleId}
        isSubmitting={isSubmitting}
        isLoading={isLoading}
      />

      <DeleteApiDialog
        open={confirmOpen}
        name={pendingDeleteName}
        onConfirm={confirmDeleteApi}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
          setPendingDeleteName("");
        }}
      />
    </div>
  );
}
