import axiosClient from "./axiosClient";

export interface CheckoutRequest {
  customerId: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientAddress: string;
  paymentMethod: "COD" | "VNPAY";
  note?: string;
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
