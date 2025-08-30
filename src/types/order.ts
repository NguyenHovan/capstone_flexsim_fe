export type OrderStatusCode = 0 | 1 | 2;

export interface OrderCreateInput {
  organizationId: string;
  accountId: string;
  subscriptionPlanId: string; 
}

export interface Order {
  id: string;
  organizationId: string;
  accountId: string;
  subscriptionPlanId?: string;   
  subcriptionPlanId?: string;    
  description?: string;
  totalPrice?: number;
  orderTime?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  status?: OrderStatusCode;
  orderCode?: number | null;
  payments?: any[] | null;
  organization?: any | null;
  statusNavigation?: any | null;
  subcriptionPlan?: any | null;
}

export const getOrderStatusLabel = (s?: OrderStatusCode) => {
  switch (s) {
    case 0: return "PENDING";
    case 1: return "PAID";
    case 2: return "CANCELLED";
    default: return "UNKNOWN";
  }
};
