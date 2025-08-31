// import axiosInstance from "./main.service";
// import { API } from "../api";
// import type {
//   ChangePassword,
//   ForgotPassword,
//   Login,
// } from "../types/auth";

// export const AuthService = {
  
//   login: async (payload: Login) => {
//     const response = await axiosInstance.post(`${API.LOGIN}`, payload);
//     return response.data;
//   },
//   forgotPassword: async (payload: ForgotPassword) => {
//     const response = await axiosInstance.post(
//       `${API.FORGOT_PASSWORD}`,
//       payload
//     );
//     return response.data;
//   },
//   changePassword: async (payload: ChangePassword) => {
//     const response = await axiosInstance.post(
//       `${API.CHANGE_PASSWORD}`,
//       payload
//     );
//     return response.data;
//   },

//   resendVerify: async (userName: string) => {
//     // Nếu BE cần { userName } trong body
//     const { data } = await axiosInstance.post(API.RESEND_VERIFY, { userName });
//     return data;
//   },

//   /** Xác thực email bằng OTP */
//   verifyEmail: async (userName: string, otp: string) => {
//     // Nếu BE cần { userName, otp } trong body
//     const { data } = await axiosInstance.post(API.VERIFY_EMAIL, { userName, otp });
//     return data;
//   },
// };
import axiosInstance from "./main.service";
import { API } from "../api";
import type { ChangePassword, ForgotPassword, Login } from "../types/auth";

export const AuthService = {
  login: async (payload: Login) => {
    const { data } = await axiosInstance.post(API.LOGIN, payload);
    return data;
  },

  forgotPassword: async (payload: ForgotPassword) => {
    const { data } = await axiosInstance.post(API.FORGOT_PASSWORD, payload);
    return data;
  },

  changePassword: async (payload: ChangePassword) => {
    const { data } = await axiosInstance.post(API.CHANGE_PASSWORD, payload);
    return data;
  },

  /** BE expects JSON string body: "username" (or email) */
  resendVerify: async (identity: string) => {
    const { data } = await axiosInstance.post(
      API.RESEND_VERIFY,
      JSON.stringify(identity),
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  },

  /** BE expects JSON string body: "otp" */
  verifyEmail: async (otp: string) => {
    const { data } = await axiosInstance.post(
      API.VERIFY_EMAIL,
      JSON.stringify(otp),
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  },
};
