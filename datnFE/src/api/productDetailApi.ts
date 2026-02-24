// src/api/productDetailApi.ts
import axiosClient from "./axiosClient";

const productDetailApi = {
  // Lấy tất cả chi tiết sản phẩm để chọn áp dụng giảm giá
  getAll: (params: any) => {
    return axiosClient.get('http://localhost:8386/api/admin/product-details', { params });
  },
};

export default productDetailApi;