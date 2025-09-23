import axiosInstance from "./main.service";
import { API } from "../api";
import type { Category, CategoryForm } from "../types/category";
import { getErrorMessage } from "../utils/errorHandler";

const unwrap = (d: any) => (d?.data ?? d);

export const CategoryService = {
  getCategories: async () => {
    const response = await axiosInstance.get(`${API.GET_ALL_CATEGORY}`);
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    try {
      const { data } = await axiosInstance.get(`${API.GET_CATEGORY_ID}/${id}`);
      return unwrap(data) as Category;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error fetching category by id:", msg);
      throw new Error(msg);
    }
  },

  async create(payload: CategoryForm): Promise<Category> {
    try {
      const { data } = await axiosInstance.post(API.CREATE_CATEGORY, payload);
      return unwrap(data) as Category;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error creating category:", msg);
      throw new Error(msg);
    }
  },

  async update(id: string, payload: CategoryForm): Promise<Category> {
    try {
      const { data } = await axiosInstance.put(`${API.UPDATE_CATEGORY}/${id}`, payload);
      return unwrap(data) as Category;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Error updating category:", msg);
      throw new Error(msg);
    }
  },

  async delete(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`${API.DELETE_CATEGORY}/${id}`);
  } catch (err) {
    const msg = getErrorMessage(err);
    console.error("Error deleting category:", msg);
    throw new Error(msg);
  }
},

  getCategoryById(id: string): Promise<Category> { return this.getById(id); },
  createCategory(body: CategoryForm): Promise<Category> { return this.create(body); },
  updateCategory(id: string, body: CategoryForm): Promise<Category> { return this.update(id, body); },
  deleteCategory(id: string): Promise<void> { return this.delete(id); },
};
