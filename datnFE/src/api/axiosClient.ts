import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8386/api/v1",
    withCredentials: true,
});

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