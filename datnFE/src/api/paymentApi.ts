import axiosClient from "./axiosClient";
import type { GuestCartItem } from "../services/guestCartService";

export interface CheckoutRequest {
  customerId?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  recipientAddress?: string;
  paymentMethod: "COD" | "VNPAY";
  voucherCode?: string | null;
  note?: string;
  isBuyNow?: boolean;
  items: {
    productDetailId: string;
    quantity: number;
  }[];
  /** THÔNG TIN KHÁCH CHƯA ĐĂNG NHẬP */
  guestInfo?: GuestInfo;
}

export interface GuestInfo {
  receiverName: string;
  phone: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  addressDetail: string;
}

export interface CheckoutResponse {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  status: string;
  paymentUrl?: string;
  message: string;
}

const paymentApi = {
  checkout: (data: CheckoutRequest): Promise<CheckoutResponse> =>
    axiosClient.post("/client/orders/checkout", data).then((res) => res.data),
};

export default paymentApi;
