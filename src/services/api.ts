import axios, {
  type InternalAxiosRequestConfig,
} from "axios";

/* ==================================================
 * AXIOS INSTANCE
 * ================================================== */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,

  /*
   * Send cookies by default.
   *
   * Example:
   * refreshToken=...
   */
  withCredentials: true,
});

/* ==================================================
 * PUBLIC AUTH ROUTES
 *
 * These routes DON'T need cookies.
 * ================================================== */

const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/create-password",
];

/* ==================================================
 * NORMALIZE URL
 * ================================================== */

const normalizePath = (url: string) => {
  /*
   * Remove query parameters.
   *
   * /login?email=test@gmail.com
   *       ↓
   * /login
   */
  const pathname = url.split("?")[0];

  /*
   * Remove trailing slash.
   *
   * /login/
   *       ↓
   * /login
   */
  return pathname.replace(/\/+$/, "") || "/";
};

/* ==================================================
 * CHECK PUBLIC AUTH ROUTE
 * ================================================== */

const isPublicAuthRoute = (
  url: string
): boolean => {
  const pathname = normalizePath(url);

  return PUBLIC_AUTH_ROUTES.some(
    (route) => {
      const normalizedRoute =
        normalizePath(route);

      /*
       * Handles:
       *
       * /login
       * /auth/login
       * /api/v1/auth/login
       */
      return (
        pathname === normalizedRoute ||
        pathname.endsWith(
          normalizedRoute
        )
      );
    }
  );
};

/* ==================================================
 * REQUEST INTERCEPTOR
 * ================================================== */

api.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig
  ) => {
    const url = config.url || "";

    // Let the browser add the multipart boundary for file uploads.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    const isPublic =
      isPublicAuthRoute(url);

    /*
     * PUBLIC AUTH APIs
     *
     * No cookies.
     */
    if (isPublic) {
      config.withCredentials = false;
    }

    /*
     * ALL OTHER APIs
     *
     * Send cookies.
     */
    else {
      config.withCredentials = true;
    }

    return config;
  },

  (error) => {

    return Promise.reject(error);
  }
);

/* ==================================================
 * RESPONSE INTERCEPTOR
 * ================================================== */

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/* ==================================================
 * EXPORT
 * ================================================== */

export default api;







// import axios from "axios";


// const api = axios.create({

//   baseURL:
//     process.env.NEXT_PUBLIC_API_URL ,
    

//   headers: {
//     "Content-Type": "application/json",
//   },

//   timeout: 10000,

// });


// export default api;