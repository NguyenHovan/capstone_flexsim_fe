export interface CreatePaymentResponse {
  checkoutUrl?: string;
  orderCode?: number;
  orderId?: string;
}

export interface PaymentUpdateInput {
  orderCode: number;
}
