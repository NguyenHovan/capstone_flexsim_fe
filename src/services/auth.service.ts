import axiosInstance from "./main.service";
import { API } from "../api";
import type { Register } from "../types/auth";

export const AuthService = {
  register: async (payload: Register) => {
    try {
      const response = await axiosInstance.post(`${API.REGISTER}`, payload);
      return response.data;
    } catch (error) {
      console.log({ error });
    }
  },
};
