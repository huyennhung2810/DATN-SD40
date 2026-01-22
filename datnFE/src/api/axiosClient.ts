import axios from "axios";


const axiosClient = axios.create({
    baseURL: "http://localhost:8386/api/v1",
    headers: {
  "Content-Type": "multipart/form-data"
    },


    withCredentials: true,
})

export default axiosClient;