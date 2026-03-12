import axios from "axios";
import { AUTH_STORAGE_KEYS } from "../models/auth";

const BASE_URL = "http://localhost:8386/api/v1";

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"    },
})



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