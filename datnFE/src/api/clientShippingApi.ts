import axiosClient from "./axiosClient";

export interface GHNFeeRequest {
  toDistrictId: number;
  toWardCode: string;
  quantity: number;
  totalOrderValue: number;
}

export interface GHNFeeResponse {
  fee: number;
}

export const clientShippingApi = {
  /** Lấy danh sách Tỉnh/Thành phố từ backend */
  getProvinces: () => axiosClient.get("/client/shipping/ghn/provinces").then((res) => res.data),

  /** Lấy danh sách Quận/Huyện từ backend */
  getDistricts: (provinceId: number) => axiosClient.get(`/client/shipping/ghn/districts?province_id=${provinceId}`).then((res) => res.data),

  /** Lấy danh sách Phường/Xã từ backend */
  getWards: (districtId: number) => axiosClient.get(`/client/shipping/ghn/wards?district_id=${districtId}`).then((res) => res.data),

  /** Tính phí vận chuyển qua backend */
  calculateFee: (params: GHNFeeRequest): Promise<GHNFeeResponse> =>
    axiosClient.post("/client/shipping/ghn/fee", params).then(res => res.data),
};
