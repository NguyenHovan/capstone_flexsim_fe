import axiosInstance from "./main.service";
import { API } from "../api";
import type { OrderStatusCode } from "../types/order";

export type CreatePaymentResponse = {
  orderId?: string;
  orderCode?: number;
  checkoutUrl?: string; // PayOS URL
  payUrl?: string;      // nếu backend trả tên khác
};

export type PaymentUpdateResponse = {
  orderCode: number;
  orderId?: string;
  status?: OrderStatusCode; // 0|1|2 nếu backend trả về
};

export const PaymentService = {
  async createByOrderId(orderId: string): Promise<CreatePaymentResponse> {
    const res = await axiosInstance.post(API.CREATE_PAYMENT_BY_ORDER_ID(orderId));
    return res.data as CreatePaymentResponse;
  },

  async update(body: { orderCode: number }): Promise<PaymentUpdateResponse> {
    const res = await axiosInstance.put(API.PAYMENT_UPDATE, body);
    return res.data as PaymentUpdateResponse;
  },
};
