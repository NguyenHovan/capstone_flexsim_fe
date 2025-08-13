import axiosInstance from "./main.service";
import { API } from "../api";
import type { OrderStatusCode } from "../types/order";

export type CreatePaymentResponse = {
  orderId?: string;
  orderCode?: number;
  checkoutUrl?: string;
  payUrl?: string;
};

export type PaymentUpdateResponse = {
  orderCode: number;
  orderId?: string;
  status?: OrderStatusCode;
};

const unwrap = (d: any) => (d?.data ?? d);

export const PaymentService = {
  // ===== Core =====
  async createByOrderId(orderId: string): Promise<CreatePaymentResponse> {
    const { data } = await axiosInstance.post(API.CREATE_PAYMENT_BY_ORDER_ID(orderId));
    return unwrap(data) as CreatePaymentResponse;
  },

  async update(body: { orderCode: number }): Promise<PaymentUpdateResponse> {
    const { data } = await axiosInstance.put(API.UPDATE_PAYMENT, body);
    return unwrap(data) as PaymentUpdateResponse;
  },

  // ===== Aliases =====
  createPaymentByOrderId(orderId: string) { return this.createByOrderId(orderId); },
  updatePayment(body: { orderCode: number }) { return this.update(body); },
};
