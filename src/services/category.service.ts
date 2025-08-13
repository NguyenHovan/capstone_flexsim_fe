import axiosInstance from "./main.service";
import { API } from "../api";
import type { Category, CategoryForm } from "../types/category";
import { getErrorMessage } from "../utils/errorHandler";

export const CategoryService = {
  getAll: async (): Promise<Category[]> => {
    try {
      const { data } = await axiosInstance.get(API.GET_ALL_CATEGORY);
      return (data?.data ?? data) as Category[];
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error fetching categories:", msg);
      throw new Error(msg);
    }
  },

  getById: async (id: string): Promise<Category> => {
    try {
      const { data } = await axiosInstance.get(`${API.GET_CATEGORY_ID}/${id}`);
      return (data?.data ?? data) as Category;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error fetching category by id:", msg);
      throw new Error(msg);
    }
  },

  create: async (payload: CategoryForm): Promise<Category> => {
    try {
      const { data } = await axiosInstance.post(API.CREATE_CATEGORY, payload);
      return (data?.data ?? data) as Category;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error creating category:", msg);
      throw new Error(msg);
    }
  },

  update: async (id: string, payload: CategoryForm): Promise<Category> => {
    try {
      const { data } = await axiosInstance.put(`${API.UPDATE_CATEGORY}/${id}`, payload);
      return (data?.data ?? data) as Category;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error updating category:", msg);
      throw new Error(msg);
    }
  },

  // theo API bạn đang dùng: POST /delete/{id}
  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.post(`${API.DELETE_CATEGORY}/${id}`);
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error deleting category:", msg);
      throw new Error(msg);
    }
  },
};
