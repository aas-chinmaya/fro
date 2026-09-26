// Customer API Endpoints
export const CUSTOMER_ENDPOINTS = {
  // Create a new customer
  CREATE: "/customers/create",

  // Fetch all customers
  FETCH_ALL: "/customers/fetch",

  // Fetch customer by ID
  FETCH_BY_ID: (id: string) => `/customers/fetch/${id}`,

  // Fetch customer dashboard by ID
  DASHBOARD: (id: string) => `/customers/${id}/dashboard`,

  // Fetch complete customer ledger by ID
  LEDGER: (id: string) => `/customers/${id}/ledger`,

  // Fetch customer statement by ID
  STATEMENT: (id: string) => `/customers/${id}/statement`,

  // Fetch complete customer purchase history by ID
  PURCHASES: (id: string) => `/customers/${id}/purchases`,

  // Update customer
  UPDATE: (id: string) => `/customers/update/${id}`,

  // Delete customer
  DELETE: (id: string) => `/customers/delete/${id}`,
};
