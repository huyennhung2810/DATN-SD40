import axios, { AxiosError } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../utils/authStorage";

// Use a fallback to localhost if env variable is not set
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_BASE_URL_SERVER;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return `${envUrl}/api/v1`;
  }
  // Default fallback
  return "http://localhost:8386/api/v1";
};

const baseURL = getBaseURL();

// Debug log
console.log("🔌 API Base URL:", baseURL);

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const axiosRaw = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`📤 Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
    (response) => {
      console.log(`📥 Response: ${response.status} ${response.config.url}`);
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as (typeof error.config & { _retry?: boolean });
      const status = error?.response?.status;
      const url = error.config?.url;

      console.log(`❌ Error: ${status} ${url}`, error.response?.data);

      if (status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            console.log("🔄 Attempting token refresh...");
            const res = await axiosRaw.post("/auth/refresh", {
              refreshToken,
              screen: "ADMIN",
            });
            const { accessToken, refreshToken: newRefreshToken } = res.data as {
              accessToken: string;
              refreshToken: string;
            };
            setTokens(accessToken, newRefreshToken);
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosClient(originalRequest);
          } catch (_e) {
            console.log("❌ Token refresh failed");
            clearTokens();
            window.location.href = "/login";
          }
        } else {
          console.log("❌ No refresh token found");
          clearTokens();
          window.location.href = "/login";
        }
      }

      if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
      }
      return Promise.reject(error);
    }
);

export default axiosClient;
