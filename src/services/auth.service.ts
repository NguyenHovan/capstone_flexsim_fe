import axiosInstance from "./main.service";
import { API } from "../api";
import type { Login, Register } from "../types/auth";

export const AuthService = {
  register: async (payload: Register) => {
    try {
      const response = await axiosInstance.post(`${API.REGISTER}`, payload);
      return response.data;
    } catch (error) {
      console.log({ error });
    }
  },

  login: async (payload: Login) => {
    try {
      const response = await axiosInstance.post(`${API.LOGIN}`, payload);
      return response.data;
    } catch (error) {
      console.log({ error });
    }
  },
};
