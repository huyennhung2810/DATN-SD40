import axios from "axios";
import { AUTH_STORAGE_KEYS } from "../models/auth";
import { logoutAction } from "../redux/slices/authSlice"; 
import { store } from "../redux/store";

const BASE_URL = "http://localhost:8386/api/v1";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
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
        // Kiểm tra whitelist chính xác hơn
        const isAuthApi = AUTH_WHITELIST.some(url => config.url === url || config.url?.endsWith(url));

        if (token && !isAuthApi) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

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

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
            const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);

            if (!refreshToken) {
                clearAuthStorage();
                store.dispatch(logoutAction()); // Cập nhật Redux ngay lập tức
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Lưu ý: khớp với @RequestBody RefreshTokenRequest ở Backend
                const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
                const newAccessToken: string = response.data.data.accessToken;

                localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearAuthStorage();
                store.dispatch(logoutAction()); // Đăng xuất người dùng trên toàn hệ thống

                const currentPath = window.location.pathname;
                if (currentPath !== '/login' && currentPath !== '/register') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        // Trả về error.response.data để Frontend lấy được message lỗi từ GlobalExceptionHandler
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