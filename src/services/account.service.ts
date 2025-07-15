import axiosInstance from "./main.service";
import { API } from "../api";

import type { Account } from "../types/account";

export const AccountService = {
  // Lấy tất cả tài khoản
  getAllAccounts: async (): Promise<Account[]> => {
    const response = await axiosInstance.get(`${API.GET_ALL_ACCOUNT}`);
    return response.data;
  },

  // Lấy thông tin tài khoản theo ID
  getAccountById: async (id: string): Promise<Account> => {
    const response = await axiosInstance.get(`${API.GET_ACCOUNT_ID}/${id}`);
    return response.data;
  },

  // Tạo mới tài khoản
  createAccount: async (payload: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'deleteAt'>): Promise<Account> => {
    const response = await axiosInstance.post(`${API.REGISTER}`, payload);
    return response.data;
  },

  // Cập nhật tài khoản
  updateAccount: async (id: string, payload: Partial<Account>): Promise<Account> => {
    const response = await axiosInstance.put(`${API.UPDATE_ACCOUNT}/${id}`, payload);
    return response.data;
  },

  // Xóa tài khoản
  deleteAccount: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API.DELETE_ACCOUNT}/${id}`);
  },

  // Tạo Organization Admin
  createOrgAdmin: async (payload: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'deleteAt'>): Promise<Account> => {
    const response = await axiosInstance.post(`${API.CREATE_ORG_ADMIN}`, payload);
    return response.data;
  },
};