import axios from "axios";
import { AUTH_STORAGE_KEYS } from "../models/auth";

const BASE_URL = "http://localhost:8386/api/v1";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"    },
})

const AUTH_WHITELIST = [
  "/auth/login",
  "/auth/login-admin",
  "/auth/register",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/verify-otp"
];



axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor: xử lý 401 → refresh token ────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};


// Response interceptor to handle errors
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa retry, thử refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);

            // Không có refresh token → chỉ clear localStorage, không redirect
            if (!refreshToken) {
                clearAuthStorage();
                // Không tự động chuyển trang
                return Promise.reject(error);
            }

            // Nếu đang refresh, đưa request vào hàng đợi
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
                const newAccessToken: string = response.data.data.accessToken;

                localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearAuthStorage();
                // Chỉ redirect nếu không đang ở trang login/register
                const currentPath = window.location.pathname;
                if (currentPath !== '/login' && currentPath !== '/register') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        if (error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

function clearAuthStorage() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
}


export default axiosClient;