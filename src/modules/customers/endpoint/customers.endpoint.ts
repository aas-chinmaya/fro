// Customer API Endpoints
export const CUSTOMER_ENDPOINTS = {
  CREATE: "/customers/create",
  FETCH_ALL: "/customers/fetch",
  FETCH_BY_ID: (id: string) => `/customers/fetch/${id}`,
  DASHBOARD: (id: string) => `/customers/${id}/dashboard`,
  LEDGER: (id: string) => `/customers/${id}/ledger`,
  STATEMENT: (id: string) => `/customers/${id}/statement`,
  PURCHASES: (id: string) => `/customers/${id}/purchases`,
  UPDATE: (id: string) => `/customers/update/${id}`,
  DELETE: (id: string) => `/customers/delete/${id}`,

  // reward config endpoints
  REWARD_CONFIG_CREATE: "/rewards/config",
  REWARD_CONFIG_FETCH: (businessId: string, branchId: string) => `/rewards/config/${businessId}/${branchId}`,
  REWARD_CONFIG_UPDATE: (businessId: string, branchId: string) => `/rewards/config/${businessId}/${branchId}`,
  REWARD_CONFIG_DELETE: (businessId: string, branchId: string) => `/rewards/config/${businessId}/${branchId}`,
};
