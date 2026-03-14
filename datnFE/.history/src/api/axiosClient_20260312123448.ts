import axios from "axios";
import { AUTH_STORAGE_KEYS } from "../models/auth";

const BASE_URL = "http://localhost:8386/api/v1";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"    },
})


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
    (error) => {
        if (error.response && error.response.data) {
            // Return the error data so saga can handle it
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;