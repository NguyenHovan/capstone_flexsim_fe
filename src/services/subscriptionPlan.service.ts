import axiosInstance from "./main.service";
import { API } from "../api";
import type { SubscriptionPlan } from "../types/subscriptionPlan";

export const SubscriptionPlanService = {
  getAll: async (): Promise<SubscriptionPlan[]> => {
    const res = await axiosInstance.get(API.GET_ALL_SUBCRIPTION);
    return res.data;
  },
  getById: async (id: string): Promise<SubscriptionPlan> => {
    const res = await axiosInstance.get(`${API.GET_SUBCRIPTION_ID}/${id}`);
    return res.data;
  },
  create: async (body: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
    const res = await axiosInstance.post(API.CREATE_SUBCRIPTION, body);
    return res.data;
  },
  update: async (id: string, body: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
    const res = await axiosInstance.put(`${API.UPDATE_SUBCRIPTION}/${id}`, body);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API.DELETE_SUBCRIPTION}/${id}`);
  },
};
