import type { ResponseObject } from "./base";
import type { Page } from "./order";
import axiosClient from "../api/axiosClient";

export interface CustomerOrderListResponse {
  id: string;
  code: string;
  createdDate: number;
  orderStatus: string;
  orderStatusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  totalAmount: number | null;
  totalAfterDiscount: number | null;
  shippingFee: number | null;
  campaignDiscount: number | null;
  voucherDiscount: number | null;
  voucherCode: string | null;
  itemCount: number;
  itemPreviews: OrderItemPreview[];
}

export interface OrderItemPreview {
  productName: string;
  productImage: string | null;
  variantLabel: string;
  quantity: number;
}

export interface CustomerOrderDetailResponse {
  id: string;
  code: string;
  createdDate: number;
  paymentDate: number | null;
  orderType: string | null; // OFFLINE | ONLINE | GIAO_HANG
  orderStatus: string;
  orderStatusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  recipientName: string | null;
  recipientPhone: string | null;
  recipientEmail: string | null;
  recipientAddress: string | null;
  shippingMethodName: string | null;
  /** Tổng giá niêm yết trước KM sản phẩm */
  originalSubtotal: number | null;
  /** Tạm tính sau KM, trước voucher */
  totalAmount: number | null;
  /** Tổng giảm từ đợt khuyến mãi sản phẩm */
  campaignDiscount: number | null;
  /** Giảm từ voucher */
  voucherDiscount: number | null;
  voucherCode: string | null;
  voucherName: string | null;
  shippingFee: number | null;
  customerPaid: number | null;
  totalAfterDiscount: number | null;
  note: string | null;
  items: CustomerOrderItemResponse[];
  timeline: CustomerOrderHistoryResponse[];
  canCancel: boolean;
  canConfirmReceived: boolean;
  canBuyAgain: boolean;
}

export interface CustomerOrderItemResponse {
  id: string;
  productDetailId: string | null;
  productName: string;
  brandName: string | null;
  productImage: string | null;
  variantLabel: string;
  colorName: string | null;
  storageLabel: string | null;
  quantity: number;
  /** Đơn giá niêm yết / trước KM dòng */
  listUnitPrice: number | null;
  unitPrice: number | null;
  discountAmount: number | null;
  totalPrice: number | null;
  serialNumbers: string[];
  serialCount: number;
}

export interface CustomerOrderHistoryResponse {
  id: string;
  status: string;
  statusLabel: string;
  timestamp: string | null;
  note: string | null;
  performedBy: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface CancelOrderResponse {
  orderId: string;
  orderCode: string;
  status: string;
  statusLabel: string;
  message: string;
}

export interface BuyAgainResponse {
  orderId: string;
  orderCode: string;
  addedCount: number;
  addedProducts: string[];
  unavailableProducts: string[];
  cartItemCount: number;
  message: string;
}

export interface ConfirmReceivedResponse {
  orderId: string;
  orderCode: string;
  status: string;
  statusLabel: string;
  message: string;
}

export type OrderPageResponse = ResponseObject<Page<CustomerOrderListResponse>>;

const BASE = "/client/orders";

export const getOrderList = async (
  status?: string,
  page = 0,
  size = 8
): Promise<OrderPageResponse> => {
  const params: Record<string, string | number> = { page, size };
  if (status && status !== "all") params.status = status;
  const res = await axiosClient.get<ResponseObject<Page<CustomerOrderListResponse>>>(BASE, { params });
  return res.data;
};

export const getOrderDetail = async (orderId: string): Promise<ResponseObject<CustomerOrderDetailResponse>> => {
  const res = await axiosClient.get<ResponseObject<CustomerOrderDetailResponse>>(`${BASE}/${orderId}`);
  return res.data;
};

export const cancelOrder = async (
  orderId: string,
  reason?: string
): Promise<ResponseObject<CancelOrderResponse>> => {
  const res = await axiosClient.post<ResponseObject<CancelOrderResponse>>(
    `${BASE}/${orderId}/cancel`,
    reason ? { reason } : {}
  );
  return res.data;
};

export const confirmReceived = async (
  orderId: string
): Promise<ResponseObject<ConfirmReceivedResponse>> => {
  const res = await axiosClient.post<ResponseObject<ConfirmReceivedResponse>>(
    `${BASE}/${orderId}/confirm-received`,
    {}
  );
  return res.data;
};

export const buyAgain = async (
  orderId: string
): Promise<ResponseObject<BuyAgainResponse>> => {
  const res = await axiosClient.post<ResponseObject<BuyAgainResponse>>(
    `${BASE}/${orderId}/buy-again`,
    {}
  );
  return res.data;
};

export interface UpdateShippingInfoRequest {
  shippingAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
}

export const updateShippingInfo = async (
  orderId: string,
  data: UpdateShippingInfoRequest
): Promise<ResponseObject<unknown>> => {
  const res = await axiosClient.patch<ResponseObject<unknown>>(
    `${BASE}/${orderId}/shipping-info`,
    data
  );
  return res.data;
};
