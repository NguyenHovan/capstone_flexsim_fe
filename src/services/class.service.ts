import { API } from "../api";
import axiosInstance from "./main.service";

export const ClassService = {
  getAllClasses: async () => {
    const response = await axiosInstance.get(API.GET_ALL_CLASS);
    return response.data;
  },

  createClass: async (payload: {
    className: string;
    numberOfStudent: number;
    courseId: string;
  }) => {
    const response = await axiosInstance.post(API.CREATE_CLASS, payload);
    return response.data;
  },

  updateClass: async (id: string, payload: any) => {
    const response = await axiosInstance.put(
      `${API.UPDATE_CLASS}/${id}`,
      payload
    );
    return response.data;
  },

  deleteClass: async (id: string) => {
    const response = await axiosInstance.post(`${API.DELETE_CLASS}/${id}`);
    return response.data;
  },
};
