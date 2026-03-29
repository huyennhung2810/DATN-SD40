import axiosClient from "./axiosClient";

export interface CheckoutRequest {
  customerId: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientAddress: string;
  paymentMethod: "COD" | "VNPAY";
  voucherCode?: string | null;
  note?: string;
  /** Phí vận chuyển tính từ GHN (VNĐ). Mặc định 0 = miễn phí. */
  phiVanChuyen?: number;
}

export interface CheckoutResponse {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  /** SUCCESS (COD) | REDIRECT (VNPay) */
  status: string;
  paymentUrl?: string;
  message: string;
}

const paymentApi = {
  checkout: (data: CheckoutRequest): Promise<CheckoutResponse> =>
    axiosClient.post("/client/orders/checkout", data).then((res) => res.data),
};

export default paymentApi;
