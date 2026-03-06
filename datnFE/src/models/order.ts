export interface OrderResponse {
    id: string;
    code: string;
    orderStatus: string;
    orderType: string;
    recipientName: string;
    recipientPhone: string;
    totalAmount: number;
    totalAfterDiscount: number;
    createdDate: number;
}

export interface OrderDetailResponse {
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productDetail: any;
}
