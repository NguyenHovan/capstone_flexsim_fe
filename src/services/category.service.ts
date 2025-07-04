import axiosInstance from "./main.service";
import { API } from "../api";

export const CategoryService = {
  getCategories: async () => {
    const response = await axiosInstance.get(`${API.GET_ALL_CATEGORY}`);
    return response.data;
  },
};
