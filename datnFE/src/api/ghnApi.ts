import axios from "axios";
import type { AxiosInstance } from "axios";
import type {
  GHNFeeRequest,
  GHNFeeResponse,
  GHNProvinceResponse,
  GHNDistrictResponse,
  GHNWardResponse,
  GHNServicesResponse,
} from "../models/ghnModels";

const GHN_BASE_URL = "https://online-gateway.ghn.vn/shiip/public-api/v2";
const TOKEN = import.meta.env.VITE_GHN_TOKEN;
const SHOP_ID = import.meta.env.VITE_GHN_SHOP_ID;

// Separate axios instance for GHN — does NOT go through the auth interceptor
const ghnClient: AxiosInstance = axios.create({
  baseURL: GHN_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Token: TOKEN,
    ShopId: String(SHOP_ID),
  },
  timeout: 15000,
});

export const ghnApi = {
  /** Lấy danh sách Tỉnh/Thành phố */
  getProvinces: (): Promise<GHNProvinceResponse> =>
    ghnClient.get("/master-data/province").then((res) => res.data),

  /** Lấy danh sách Quận/Huyện theo Tỉnh */
  getDistricts: (provinceId: number): Promise<GHNDistrictResponse> =>
    ghnClient
      .get(`/master-data/district?province_id=${provinceId}`)
      .then((res) => res.data),

  /** Lấy danh sách Phường/Xã theo Quận */
  getWards: (districtId: number): Promise<GHNWardResponse> =>
    ghnClient
      .get(`/master-data/ward?district_id=${districtId}`)
      .then((res) => res.data),

  /** Lấy danh sách dịch vụ giao hàng khả dụng */
  getServices: (
    fromDistrictId: number,
    toDistrictId: number
  ): Promise<GHNServicesResponse> =>
    ghnClient
      .post("/shipping-order/services", {
        shop_id: Number(SHOP_ID),
        from_district: fromDistrictId,
        to_district: toDistrictId,
      })
      .then((res) => res.data),

  // /** Tính phí vận chuyển (Chuyển sang backend: clientShippingApi.ts) */
  // calculateFee: (
  //   params: GHNFeeRequest
  // ): Promise<GHNFeeResponse> =>
  //   ghnClient
  //     .post("/shipping-order/fee", params)
  //     .then((res) => res.data),
};
