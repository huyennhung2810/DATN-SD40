import type { ResponseObject } from "../../models/base";
import type {
  ADOrderSearchRequest,
  OrderDetailPageResponse,
  OrderPageResponse,
} from "../../models/order";
import axiosClient from "../axiosClient";

const PREFIX = "/admin/invoices";

export const invoiceApi = {
  searchInvoices: (
    params: ADOrderSearchRequest,
  ): Promise<{ data: ResponseObject<OrderPageResponse> }> => {
    return axiosClient.get(`${PREFIX}`, { params });
  },

  getInvoiceDetails: async (
    maHoaDon: string,
    params?: { page?: number; size?: number },
  ): Promise<ResponseObject<OrderDetailPageResponse>> => {
    const res = await axiosClient.get(`${PREFIX}/all`, {
      params: { maHoaDon, page: 0, size: 100, ...params },
    });
    return res.data;
  },
};
