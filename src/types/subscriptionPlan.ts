export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationInMonths: number;
  maxWorkSpaces: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}
