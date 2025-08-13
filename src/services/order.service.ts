import axiosInstance from "./main.service";
import { API } from "../api";
import type { Order, OrderCreateInput, OrderStatusCode } from "../types/order";
import { getErrorMessage } from "../utils/errorHandler";

const unwrap = (d: any) => (d?.data ?? d);

export const OrderService = {
  async getAll(): Promise<Order[]> {
    try {
      const { data } = await axiosInstance.get(API.GET_ALL_ORDER);
      return unwrap(data) as Order[];
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error fetching orders:", msg);
      throw new Error(msg);
    }
  },

  async getById(id: string): Promise<Order> {
    try {
      const { data } = await axiosInstance.get(`${API.GET_ORDER_ID}/${id}`);
      return unwrap(data) as Order;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error fetching order by id:", msg);
      throw new Error(msg);
    }
  },

  async create(body: OrderCreateInput): Promise<Order> {
    try {
      const { data } = await axiosInstance.post(API.CREATE_ORDER, body);
      return unwrap(data) as Order;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error creating order:", msg);
      throw new Error(msg);
    }
  },

  async updateStatus(id: string, status: OrderStatusCode): Promise<Order> {
    try {
      const url = `${API.UPDATE_ORDER}/${id}?status=${status}`;
      const { data } = await axiosInstance.put(url);
      return unwrap(data) as Order;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error updating order status:", msg);
      throw new Error(msg);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${API.DELETE_ORDER}/${id}`);
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error deleting order:", msg);
      throw new Error(msg);
    }
  },

  getOrders(): Promise<Order[]> { return this.getAll(); },
  getOrderById(id: string): Promise<Order> { return this.getById(id); },
  createOrder(body: OrderCreateInput): Promise<Order> { return this.create(body); },
  updateOrderStatus(id: string, status: OrderStatusCode): Promise<Order> { return this.updateStatus(id, status); },
  deleteOrder(id: string): Promise<void> { return this.delete(id); },

  async updateStatusByQuery(id: string, status: OrderStatusCode): Promise<Order> {
    const { data } = await axiosInstance.put(`${API.GET_ORDER_ID}/${id}/status?status=${status}`);
    return unwrap(data) as Order;
  },
};
