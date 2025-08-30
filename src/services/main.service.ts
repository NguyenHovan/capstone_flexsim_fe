// import axios, {
//   type AxiosInstance,
//   type InternalAxiosRequestConfig,
// } from "axios";

// const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/";
// const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || "500000", 10);

// const axiosInstance: AxiosInstance = axios.create({
//   baseURL,
//   timeout,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// axiosInstance.interceptors.request.use(
//   (config: InternalAxiosRequestConfig<any>) => {
//     const token = localStorage.getItem("accessToken");
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default axiosInstance;
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { API } from "../api";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/";
const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || "500000", 10);

const PUBLIC_PATHS = new Set<string>([
  API.LOGIN,
  API.VERIFY_EMAIL,
  API.RESEND_VERIFY,
  API.FORGOT_PASSWORD,
  API.RESET_PASSWORD, 
]);

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    const url = config.url || "";
    const skipByHeader =
      (config as any).skipAuth === true || config.headers?.["X-Skip-Auth"] === "1";
    const skipByPath = [...PUBLIC_PATHS].some((p) => url.startsWith(p));

    if (!skipByHeader && !skipByPath) {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    } else {
      if (config.headers) delete (config.headers as any).Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
