export interface PosOrder {
    id: string;
    totalAmount: number;
    totalAfterDiscount: number;
    createdAt?: string;
    customer?: any;
    voucher?: any;
}

export interface PosOrderDetail {
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productDetail: any;
}
