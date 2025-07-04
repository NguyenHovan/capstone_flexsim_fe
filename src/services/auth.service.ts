import axiosInstance from "./main.service";
import { API } from "../api";
import type {
  ChangePassword,
  ForgotPassword,
  Login,
  Register,
} from "../types/auth";

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
    const response = await axiosInstance.post(`${API.LOGIN}`, payload);
    return response.data;
  },
  forgotPassword: async (payload: ForgotPassword) => {
    const response = await axiosInstance.post(
      `${API.FORGOT_PASSWORD}`,
      payload
    );
    return response.data;
  },
  changePassword: async (payload: ChangePassword) => {
    const response = await axiosInstance.post(
      `${API.CHANGE_PASSWORD}`,
      payload
    );
    return response.data;
  },

  verifyEmail: async (otp: string) => {
    const response = await axiosInstance.post(
      `${API.VERIFY_EMAIL}`,
      JSON.stringify(otp)
    );
    return response.data;
  },
};
