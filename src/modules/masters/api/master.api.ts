import axios from 'axios';
import api from '@/services/api';
import { MASTERS_ENDPOINTS } from '@/modules/masters/endpoint/master.endpoint';
import type { Module, Submodule, Feature, API, Role } from '../types';

// Helper function to extract data from different response structures
const extractData = <T>(response: any): T[] => {
  const candidates = [response, response?.data, response?.result];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate?.modules && Array.isArray(candidate.modules)) return candidate.modules;
    if (candidate?.subModules && Array.isArray(candidate.subModules)) return candidate.subModules;
    if (candidate?.features && Array.isArray(candidate.features)) return candidate.features;
    if (candidate?.apis && Array.isArray(candidate.apis)) return candidate.apis;
    if (candidate?.roles && Array.isArray(candidate.roles)) return candidate.roles;
    if (candidate?.data && Array.isArray(candidate.data)) return candidate.data;
    if (candidate?.items && Array.isArray(candidate.items)) return candidate.items;
    if (candidate?.result && Array.isArray(candidate.result)) return candidate.result;
  }

  return [];
};

export interface MasterListResponse<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const getPaginated = async <T>(endpoint: string, search: string, page: number, limit: number) => {
  const response = await api.get<any>(endpoint, { params: { search, page, limit, pageSize: limit } });
  const payload = response.data?.data ?? response.data;
  const items = extractData<T>(response.data);
  const pagination = payload?.pagination ?? payload?.meta ?? response.data?.pagination ?? response.data?.meta ?? payload;
  const total = Number(pagination?.total ?? pagination?.totalRecords ?? pagination?.totalCount ?? pagination?.totalItems ?? items.length);
  const resolvedLimit = Number(pagination?.limit ?? pagination?.pageSize ?? pagination?.itemsPerPage ?? limit);

  return {
    items,
    pagination: {
      page: Number(pagination?.page ?? pagination?.currentPage ?? page),
      limit: resolvedLimit,
      total,
      totalPages: Number(pagination?.totalPages ?? pagination?.pages ?? Math.max(1, Math.ceil(total / resolvedLimit))),
    },
  } as MasterListResponse<T>;
};

// Module API functions
export const getModules = async (search?: string): Promise<Module[]> => {
  try {
    const params = search ? { search } : {};
    const response = await api.get<any>(MASTERS_ENDPOINTS.GET_MODULES, { params });
    return extractData<Module>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch modules');
    }
    throw error;
  }
};

export const getModulesPaginated = (search = '', page = 1, limit = 10) =>
  getPaginated<Module>(MASTERS_ENDPOINTS.GET_MODULES, search, page, limit);

export const createModule = async (moduleData: Module): Promise<Module> => {
  try {
    const response = await api.post<Module>(MASTERS_ENDPOINTS.CREATE_MODULE, moduleData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create module');
    }
    throw error;
  }
};

export const updateModule = async (id: string, moduleData: Module): Promise<Module> => {
  try {
    const response = await api.put<Module>(`${MASTERS_ENDPOINTS.UPDATE_MODULE}/${id}`, moduleData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update module');
    }
    throw error;
  }
};

export const deleteModule = async (id: string): Promise<void> => {
  try {
    await api.delete(`${MASTERS_ENDPOINTS.DELETE_MODULE}/${id}`, {
      withCredentials: true,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete module');
    }
    throw error;
  }
};

// Submodule API functions
export const getSubmodules = async (moduleId?: string, search?: string): Promise<Submodule[]> => {
  try {
    let endpoint = MASTERS_ENDPOINTS.GET_SUBMODULES;
    const params: any = {};
    
    if (moduleId) {
      endpoint = `${MASTERS_ENDPOINTS.GET_SUBMODULES_BY_MODULE}/${moduleId}`;
    }
    if (search) params.search = search;
    
    const response = await api.get<any>(endpoint, { params });
    return extractData<Submodule>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submodules');
    }
    throw error;
  }
};

export const createSubmodule = async (submoduleData: Submodule): Promise<Submodule> => {
  try {
    const response = await api.post<Submodule>(
      MASTERS_ENDPOINTS.CREATE_SUBMODULE,
      submoduleData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create submodule');
    }
    throw error;
  }
};

export const updateSubmodule = async (id: string, submoduleData: Submodule): Promise<Submodule> => {
  try {
    const response = await api.put<Submodule>(
      `${MASTERS_ENDPOINTS.UPDATE_SUBMODULE}/${id}`,
      submoduleData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update submodule');
    }
    throw error;
  }
};

export const deleteSubmodule = async (id: string): Promise<void> => {
  try {
    await api.delete(`${MASTERS_ENDPOINTS.DELETE_SUBMODULE}/${id}`, {
      withCredentials: true,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete submodule');
    }
    throw error;
  }
};

// Feature API functions
export const getFeatures = async (search?: string): Promise<Feature[]> => {
  try {
    const params = search ? { search } : {};
    const response = await api.get<any>(MASTERS_ENDPOINTS.GET_FEATURES, { params });
    return extractData<Feature>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch features');
    }
    throw error;
  }
};

export const getFeaturesPaginated = async (
  search = '',
  page = 1,
  limit = 10,
  moduleId?: string | number,
  subModuleId?: string | number,
) => {
  if (!moduleId && !subModuleId) {
    return getPaginated<Feature>(MASTERS_ENDPOINTS.GET_FEATURES, search, page, limit);
  }

  const filteredFeatures = subModuleId
    ? await getFeaturesBySubModule(subModuleId)
    : await getFeaturesByModule(moduleId as string | number);
  const normalizedSearch = search.trim().toLowerCase();
  const searchedFeatures = normalizedSearch
    ? filteredFeatures.filter((feature) =>
        [feature.name, feature.route, feature.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : filteredFeatures;
  const total = searchedFeatures.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const items = searchedFeatures.slice((page - 1) * limit, page * limit);

  return {
    items,
    pagination: { page, limit, total, totalPages },
  } as MasterListResponse<Feature>;
};

export const getFeaturesByModule = async (moduleId: string | number): Promise<Feature[]> => {
  try {
    const response = await api.get<any>(`${MASTERS_ENDPOINTS.GET_FEATURES_BY_MODULE}/${moduleId}`);
    return extractData<Feature>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch features');
    }
    throw error;
  }
};

export const getFeaturesBySubModule = async (subModuleId: string | number): Promise<Feature[]> => {
  try {
    const response = await api.get<any>(`${MASTERS_ENDPOINTS.GET_FEATURES_BY_SUBMODULE}/${subModuleId}`);
    return extractData<Feature>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch features');
    }
    throw error;
  }
};

export const createFeature = async (featureData: Feature): Promise<Feature> => {
  try {
    const response = await api.post<Feature>(MASTERS_ENDPOINTS.CREATE_FEATURE, featureData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create feature');
    }
    throw error;
  }
};

export const updateFeature = async (id: string | number, featureData: Feature): Promise<Feature> => {
  try {
    const response = await api.put<Feature>(`${MASTERS_ENDPOINTS.UPDATE_FEATURE}/${id}`, featureData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update feature');
    }
    throw error;
  }
};

export const deleteFeature = async (id: string | number): Promise<void> => {
  try {
    await api.delete(`${MASTERS_ENDPOINTS.DELETE_FEATURE}/${id}`, {
      withCredentials: true,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete feature');
    }
    throw error;
  }
};

export interface ApiListResponse {
  items: API[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API API functions
export const getApis = async (search = '', page = 1, limit = 10): Promise<ApiListResponse> => {
  try {
    const params = { search, page, limit, pageSize: limit };
    const response = await api.get<any>(MASTERS_ENDPOINTS.GET_APIS, { params });
    const payload = response.data?.data ?? response.data;
    const items = extractData<API>(response.data);
        const pagination =
          payload?.pagination ??
          payload?.meta ??
          response.data?.pagination ??
          response.data?.meta ??
          payload;
        const total = Number(
          pagination?.total ??
            pagination?.totalRecords ??
            pagination?.totalCount ??
            pagination?.totalItems ??
            items.length,
        );
        const resolvedLimit = Number(
          pagination?.limit ?? pagination?.pageSize ?? pagination?.itemsPerPage ?? limit,
        );

    return {
      items,
      pagination: {
                page: Number(pagination?.page ?? pagination?.currentPage ?? page),
        limit: resolvedLimit,
        total,
                totalPages: Number(
                  pagination?.totalPages ??
                    pagination?.pages ??
                    Math.max(1, Math.ceil(total / resolvedLimit)),
                ),
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch APIs');
    }
    throw error;
  }
};

export const getApisPaginated = async (
  search = '',
  page = 1,
  limit = 10,
  moduleId?: string | number,
  subModuleId?: string | number,
  featureId?: string | number,
): Promise<ApiListResponse> => {
  if (!moduleId && !subModuleId && !featureId) {
    return getApis(search, page, limit);
  }

  const filteredApis = featureId
    ? await getApisByFeature(featureId)
    : subModuleId
      ? await getApisBySubModule(subModuleId)
      : await getApisByModule(moduleId as string | number);
  const normalizedSearch = search.trim().toLowerCase();
  const searchedApis = normalizedSearch
    ? filteredApis.filter((apiItem) =>
        [apiItem.name, apiItem.method, apiItem.route, apiItem.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : filteredApis;
  const total = searchedApis.length;

  return {
    items: searchedApis.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getApisByFeature = async (featureId: string | number): Promise<API[]> => {
  try {
    const response = await api.get<any>(`${MASTERS_ENDPOINTS.GET_APIS_BY_FEATURE}/${featureId}`);
    return extractData<API>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch APIs');
    }
    throw error;
  }
};

export const getApisByModule = async (moduleId: string | number): Promise<API[]> => {
  try {
    const response = await api.get<any>(`${MASTERS_ENDPOINTS.GET_APIS_BY_MODULE}/${moduleId}`);
    return extractData<API>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch APIs');
    }
    throw error;
  }
};

export const getApisBySubModule = async (subModuleId: string | number): Promise<API[]> => {
  try {
    const response = await api.get<any>(`${MASTERS_ENDPOINTS.GET_APIS_BY_SUBMODULE}/${subModuleId}`);
    return extractData<API>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch APIs');
    }
    throw error;
  }
};

export const createApi = async (apiData: API): Promise<API> => {
  try {
    const response = await api.post<API>(MASTERS_ENDPOINTS.CREATE_API, apiData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create API');
    }
    throw error;
  }
};

export const updateApi = async (id: string | number, apiData: API): Promise<API> => {
  try {
    const response = await api.put<API>(`${MASTERS_ENDPOINTS.UPDATE_API}/${id}`, apiData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update API');
    }
    throw error;
  }
};

export const deleteApi = async (id: string | number): Promise<void> => {
  try {
    await api.delete(`${MASTERS_ENDPOINTS.DELETE_API}/${id}`, {
      withCredentials: true,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete API');
    }
    throw error;
  }
};

// Role API functions
export const getRoles = async (search?: string): Promise<Role[]> => {
  try {
    const params = search ? { search } : {};
    const response = await api.get<any>(MASTERS_ENDPOINTS.GET_ROLES, { params });
    return extractData<Role>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch roles');
    }
    throw error;
  }
};

export const getRolesPaginated = (search = '', page = 1, limit = 10) =>
  getPaginated<Role>(MASTERS_ENDPOINTS.GET_ROLES, search, page, limit);

export const createRole = async (roleData: Role): Promise<Role> => {
  try {
    const response = await api.post<Role>(MASTERS_ENDPOINTS.CREATE_ROLE, roleData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create role');
    }
    throw error;
  }
};

export const updateRole = async (id: string | number, roleData: Role): Promise<Role> => {
  try {
    const response = await api.put<Role>(`${MASTERS_ENDPOINTS.UPDATE_ROLE}/${id}`, roleData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update role');
    }
    throw error;
  }
};

export const deleteRole = async (id: string | number): Promise<void> => {
  try {
    await api.delete(`${MASTERS_ENDPOINTS.DELETE_ROLE}/${id}`, {
      withCredentials: true,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete role');
    }
    throw error;
  }
};
