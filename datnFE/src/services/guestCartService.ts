/**
 * Guest Cart Service - 访客购物车服务
 * 使用 localStorage 存储未登录用户的购物车数据
 */

import { message } from "antd";

const GUEST_CART_KEY = "guest_cart";

export interface GuestCartItem {
  productDetailId: string;
  productId: string;
  productName: string;
  variantName?: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
}

export interface GuestCart {
  id: string;
  items: GuestCartItem[];
  updatedAt: number;
}

const generateGuestCartId = (): string => {
  return "guest_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

const getGuestCart = (): GuestCart => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (stored) {
      const cart = JSON.parse(stored) as GuestCart;
      return cart;
    }
  } catch (e) {
    console.error("Error reading guest cart:", e);
  }
  return {
    id: generateGuestCartId(),
    items: [],
    updatedAt: Date.now(),
  };
};

const saveGuestCart = (cart: GuestCart): void => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Error saving guest cart:", e);
  }
};

export const guestCartService = {
  /**
   * 获取购物车中的商品数量
   */
  getCartCount: (): number => {
    const cart = getGuestCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  /**
   * 获取完整购物车
   */
  getCart: (): GuestCart => {
    return getGuestCart();
  },

  /**
   * 获取购物车商品列表
   */
  getItems: (): GuestCartItem[] => {
    return getGuestCart().items;
  },

  /**
   * 添加商品到购物车
   */
  addToCart: (item: Omit<GuestCartItem, "quantity"> & { quantity?: number }): void => {
    const cart = getGuestCart();
    const existingIndex = cart.items.findIndex(
      (i) => i.productDetailId === item.productDetailId
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += item.quantity ?? 1;
    } else {
      cart.items.push({
        ...item,
        quantity: item.quantity ?? 1,
      });
    }

    cart.updatedAt = Date.now();
    saveGuestCart(cart);
    message.success("Đã thêm vào giỏ hàng");
  },

  /**
   * 从购物车移除商品
   */
  removeFromCart: (productDetailId: string): void => {
    const cart = getGuestCart();
    cart.items = cart.items.filter((i) => i.productDetailId !== productDetailId);
    cart.updatedAt = Date.now();
    saveGuestCart(cart);
  },

  /**
   * 更新商品数量
   */
  updateQuantity: (productDetailId: string, quantity: number): void => {
    const cart = getGuestCart();
    const item = cart.items.find((i) => i.productDetailId === productDetailId);

    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter((i) => i.productDetailId !== productDetailId);
      } else {
        item.quantity = quantity;
      }
      cart.updatedAt = Date.now();
      saveGuestCart(cart);
    }
  },

  /**
   * 清空购物车
   */
  clearCart: (): void => {
    const emptyCart: GuestCart = {
      id: generateGuestCartId(),
      items: [],
      updatedAt: Date.now(),
    };
    saveGuestCart(emptyCart);
  },

  /**
   * 检查购物车是否为空
   */
  isEmpty: (): boolean => {
    return getGuestCart().items.length === 0;
  },

  /**
   * 获取指定商品的数量
   */
  getItemQuantity: (productDetailId: string): number => {
    const cart = getGuestCart();
    const item = cart.items.find((i) => i.productDetailId === productDetailId);
    return item?.quantity ?? 0;
  },

  /**
   * 合并访客购物车到服务器购物车
   * 返回需要合并的商品列表
   */
  getMergeItems: (): GuestCartItem[] => {
    return getGuestCart().items;
  },

  /**
   * 获取购物车总计
   */
  getTotal: (): number => {
    const cart = getGuestCart();
    return cart.items.reduce((sum, item) => {
      const price = item.discountedPrice && item.discountedPrice < item.price
        ? item.discountedPrice
        : item.price;
      return sum + price * item.quantity;
    }, 0);
  },

  /**
   * 转换为结账请求格式
   */
  toCheckoutItems: (): { productDetailId: string; quantity: number }[] => {
    return getGuestCart().items.map((item) => ({
      productDetailId: item.productDetailId,
      quantity: item.quantity,
    }));
  },
};

export default guestCartService;
