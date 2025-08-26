import axiosInstance from "./main.service";
import { API } from "../api";
import type { ClassItem, ClassForm } from "../types/class";
import { getErrorMessage } from "../utils/errorHandler";

export const ClassService = {
  getAll: async (): Promise<ClassItem[]> => {
    try {
      const { data } = await axiosInstance.get(API.GET_ALL_CLASS);
      return (data?.data ?? data) as ClassItem[];
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error("Error fetching classes:", msg, err.response?.data);
      throw new Error(msg);
    }
  },

  getById: async (id: string): Promise<ClassItem> => {
    try {
      const { data } = await axiosInstance.get(`${API.GET_CLASS_ID}/${id}`);
      return (data?.data ?? data) as ClassItem;
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error("Error fetching class by ID:", msg, err.response?.data);
      throw new Error(msg);
    }
  },

  create: async (payload: ClassForm): Promise<ClassItem> => {
    try {
      const body = {
        // map tối thiểu, giữ camelCase nếu BE auto-bind (ASP.NET Core mặc định ok)
        ...payload,
      };
      const { data } = await axiosInstance.post(API.CREATE_CLASS, body, {
        headers: { "Content-Type": "application/json" },
      });
      return (data?.data ?? data) as ClassItem;
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error("Error creating class:", msg, err.response?.data);
      throw new Error(msg);
    }
  },

  update: async (
    id: string,
    payload: Partial<ClassForm>
  ): Promise<ClassItem> => {
    try {
      const { data } = await axiosInstance.put(
        `${API.UPDATE_CLASS}/${id}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return (data?.data ?? data) as ClassItem;
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error("Error updating class:", msg, err.response?.data);
      throw new Error(msg);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API.DELETE_CLASS}/${id}`);
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error("Error deleting class:", msg, err.response?.data);
      throw new Error(msg);
    }
  },

  getClassByCourse: async (courseId: string) => {
    const response = await axiosInstance.get(
      `${API.GET_CLASS_BY_COURSE}/${courseId}`
    );
    return response?.data;
  },
  getClassByStudent: async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const response = await axiosInstance.get(
      `${API.GET_CLASS_BY_STUDENT}/${currentUser.id}`
    );
    return response.data;
  },
};
