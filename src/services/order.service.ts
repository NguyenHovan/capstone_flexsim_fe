import axiosInstance from "./main.service";
import { API } from "../api";
import type { Order, OrderCreateInput, OrderStatusCode } from "../types/order";

export const OrderService = {
  getAll: async (): Promise<Order[]> => {
    const res = await axiosInstance.get(API.GET_ALL_ORDER);
    return res.data;
  },
  getById: async (id: string): Promise<Order> => {
    const res = await axiosInstance.get(`${API.GET_ORDER_ID}/${id}`);
    return res.data;
  },
  create: async (body: OrderCreateInput): Promise<Order> => {
    const res = await axiosInstance.post(API.CREATE_ORDER, body);
    return res.data;
  },
  // /api/orders/{id}/status?status=#
  updateStatus: async (id: string, status: OrderStatusCode): Promise<Order> => {
    const url = `${API.GET_ORDER_ID}/${id}/status?status=${status}`;
    const res = await axiosInstance.put(url);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API.DELETE_ORDER}/${id}`);
  },
};
