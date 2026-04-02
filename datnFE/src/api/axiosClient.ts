import axios, { AxiosError, type InternalAxiosRequestConfig} from "axios";
import { message } from "antd";
import { AUTH_STORAGE_KEYS } from "../models/auth";
import { store } from "../redux/store";
import { authActions } from "../redux/auth/authSlice";

const BASE_URL = "http://localhost:8386/api/v1";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000, // 10 giây
});

const AUTH_WHITELIST = [
    "/auth/login",
    "/auth/login-admin",
    "/auth/register",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/verify-otp"
];

// Đọc token: sessionStorage trước (admin tab), rồi localStorage (client)
const readToken = (key: string): string | null =>
    sessionStorage.getItem(key) ?? localStorage.getItem(key);

// Ghi token vào đúng storage sau khi refresh (giữ nguyên loại storage ban đầu)
const writeRefreshedTokens = (accessToken: string, newRefreshToken?: string) => {
    const useSession = !!sessionStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    const storage = useSession ? sessionStorage : localStorage;
    storage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (newRefreshToken) storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
};

axiosClient.interceptors.request.use(
    (config) => {
        console.log("[DEBUG] Request URL:", config.baseURL + config.url);
        console.log("[DEBUG] Request data:", config.data);
        const token = readToken(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        const isAuthApi = AUTH_WHITELIST.some(url =>
            config.url === url || config.url?.endsWith(url)
        );

        if (token && !isAuthApi) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 1. Xử lý lỗi 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
            const refreshToken = readToken(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
            const storedUser = readToken(AUTH_STORAGE_KEYS.USER);
            if (!refreshToken) {
                if (storedUser) {
                    message.warning({
                        content: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
                        duration: 2,
                        onClose: handleGlobalLogout,
                    });
                }
                return Promise.reject(error);
            }
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                }).catch(err => Promise.reject(err));
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                writeRefreshedTokens(accessToken, newRefreshToken);
                processQueue(null, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                message.error({
                    content: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
                    duration: 2,
                    onClose: handleGlobalLogout,
                });
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // 2. Xử lý lỗi mạng hoặc timeout
        if (!error.response) {
            // Lỗi mạng (Network Error) hoặc timeout
            message.error("Không thể kết nối máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.");
            return Promise.reject({ message: "Không thể kết nối máy chủ" });
        }

        // 3. Trả về data lỗi từ GlobalExceptionHandler của Backend
        if (error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

function handleGlobalLogout() {
    store.dispatch(authActions.logoutAction());

    // Phân biệt admin vs client để redirect đúng trang đăng nhập
    const path = window.location.pathname;
    const isAdminPath = path.startsWith('/admin') || (
        !path.startsWith('/client') &&
        !path.startsWith('/login') &&
        !path.startsWith('/register')
    );
    const redirectPath = isAdminPath ? '/admin/login' : '/login';
    if (path !== redirectPath) {
        window.location.href = redirectPath;
    }
}

export default axiosClient;