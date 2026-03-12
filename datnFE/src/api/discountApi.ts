import axiosClient from "./axiosClient";

// Vì axiosClient đã có baseURL: http://localhost:8386/api/v1
// Nên ở đây chúng ta chỉ cần viết đường dẫn tương đối thôi cho gọn.
const DISCOUNT_BASE = '/admin/discounts';
const PRODUCT_DETAIL_BASE = '/admin/product-details-discount';

export const discountApi = {
    /**
     * Lấy danh sách đợt giảm giá (Phân trang + Tìm kiếm)
     */
    getAll: (params: any) => {
        return axiosClient.get(DISCOUNT_BASE, { params });
    },

    /**
     * Lấy chi tiết một đợt giảm giá
     */
    getOne: (id: string) => {
        return axiosClient.get(`${DISCOUNT_BASE}/${id}`);
    },

    /**
     * Thêm mới đợt giảm giá
     */
    add: (data: any) => {
        return axiosClient.post(DISCOUNT_BASE, data);
    },

    /**
     * Cập nhật đợt giảm giá
     */
    update: (id: string, data: any) => {
        return axiosClient.put(`${DISCOUNT_BASE}/${id}`, data);
    },

    /**
     * Thay đổi trạng thái đợt giảm giá
     */
    changeStatus: (id: string) => {
        return axiosClient.patch(`${DISCOUNT_BASE}/${id}/status`);
    }
};

export const productDetailApi = {
    /**
     * Lấy tất cả chi tiết sản phẩm để chọn áp dụng giảm giá
     */
    getAll: (params: any) => {
        return axiosClient.get(PRODUCT_DETAIL_BASE, { params });
    },
};

export default { discountApi, productDetailApi };