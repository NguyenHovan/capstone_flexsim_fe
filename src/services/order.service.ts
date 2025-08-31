import axiosInstance from "./main.service";
import { API } from "../api";
import type { Order, OrderCreateInput, OrderStatusCode } from "../types/order";
import { getErrorMessage } from "../utils/errorHandler";

const unwrap = (d: any) => (d?.data ?? d);

function assertCreateInput(b: OrderCreateInput) {
  const err = (k: string) => new Error(`Missing/invalid "${k}" for OrderCreateInput`);
  if (!b || typeof b !== "object") throw new Error("Invalid OrderCreateInput");
  if (!b.organizationId || typeof b.organizationId !== "string") throw err("organizationId");
  if (!b.accountId || typeof b.accountId !== "string") throw err("accountId");
  if (!b.subscriptionPlanId || typeof b.subscriptionPlanId !== "string") throw err("subscriptionPlanId");
}

export const OrderService = {
  async getAll(): Promise<Order[]> {
    try {
      const { data } = await axiosInstance.get(API.GET_ALL_ORDER);
      const payload = unwrap(data);
      return Array.isArray(payload) ? payload : (payload?.items ?? []);
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
      assertCreateInput(body);
      const payload: OrderCreateInput = {
        organizationId: body.organizationId,
        accountId: body.accountId,
        subscriptionPlanId: body.subscriptionPlanId,
      };
      const { data } = await axiosInstance.post(API.CREATE_ORDER, payload, {
        headers: { "Content-Type": "application/json" },
      });
      return unwrap(data) as Order;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error creating order:", msg);
      throw new Error(msg);
    }
  },

  async updateStatus(id: string, status: OrderStatusCode): Promise<void> {
    try {
      await axiosInstance.put(
        API.UPDATE_ORDER_STATUS(id),
        null,
        { params: { status: Number(status) } } 
      );
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
  updateOrderStatus(id: string, status: OrderStatusCode): Promise<void> { return this.updateStatus(id, status); },
  deleteOrder(id: string): Promise<void> { return this.delete(id); },

  async getByAccountId(accountId: string): Promise<Order[]> {
    const all = await this.getAll();
    return all.filter(o => o.accountId === accountId);
  },

  async getByOrganizationId(orgId: string): Promise<Order[]> {
    const all = await this.getAll();
    return all.filter(o => o.organizationId === orgId);
  },
};
