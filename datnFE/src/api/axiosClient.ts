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

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
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
            const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
            const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
            if (!refreshToken) {
                // Chỉ hiện thông báo khi người dùng ĐÃ từng đăng nhập (có user trong storage)
                // Không làm gì khi người dùng chưa đăng nhập lần nào
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
                // Dùng axios (global instance) để tránh interceptor của axiosClient gây loop
                const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                if (newRefreshToken) {
                    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
                }
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
    // Dispatch action này sẽ xóa localStorage và reset Redux State cùng lúc
    store.dispatch(authActions.logoutAction());
    
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

export default axiosClient;