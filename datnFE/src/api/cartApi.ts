import axiosClient from "./axiosClient";
import type { GuestCartItem } from "../services/guestCartService";

export interface CartItemResponse {
  id: string;
  productDetailId: string;
  productName: string;
  variantName?: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
}

export interface MergeCartRequest {
  customerId: string;
  items: {
    productDetailId: string;
    quantity: number;
  }[];
}

const cartApi = {
  getCart: (customerId: string): Promise<CartItemResponse[]> =>
    axiosClient.get(`/client/cart?customerId=${customerId}`).then((res) => res.data),

  addToCart: (
    customerId: string,
    item: {
      productDetailId: string;
      quantity: number;
    }
  ): Promise<any> =>
    axiosClient.post(`/client/cart/add?customerId=${customerId}`, item),

  mergeGuestCart: (customerId: string, items: GuestCartItem[]): Promise<any> => {
    const mergeItems = items.map((item) => ({
      productDetailId: item.productDetailId,
      quantity: item.quantity,
    }));
    return axiosClient.post(`/client/cart/merge?customerId=${customerId}`, {
      items: mergeItems,
    });
  },

  updateQuantity: (cartDetailId: string, quantity: number): Promise<any> =>
    axiosClient.put(`/client/cart/update/${cartDetailId}?quantity=${quantity}`),

  removeFromCart: (cartDetailId: string): Promise<any> =>
    axiosClient.delete(`/client/cart/remove/${cartDetailId}`),
};

export default cartApi;
