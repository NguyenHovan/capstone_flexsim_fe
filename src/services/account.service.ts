// src/services/account.service.ts
import axiosInstance from "./main.service";
import { API } from "../api";
import type { Account } from "../types/account";
import type { OrganizationAdminForm } from "../types/organizationAdmin";
import type { AccountForm } from "../types/account";
export const AccountService = {
  // Lấy tất cả tài khoản
  getAllAccounts: async (): Promise<Account[]> => {
    try {
      const response = await axiosInstance.get(`${API.GET_ALL_ACCOUNT}`);
      return response.data as Account[];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  },

  // Lấy thông tin tài khoản theo ID
  getAccountById: async (id: string): Promise<Account> => {
    try {
      const response = await axiosInstance.get(`${API.GET_ACCOUNT_ID}/${id}`);
      return response.data as Account;
    } catch (error) {
      console.error('Error fetching account by id:', error);
      throw error;
    }
  },

  createAccount: async (payload: AccountForm): Promise<Account> => {
    try {
      console.log('Payload sent to create account:', payload);
      const response = await axiosInstance.post(`${API.REGISTER}`, payload);
      const newAccount = response.data as Account;
      console.log('Response from create account:', newAccount);
      return newAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  // Cập nhật tài khoản
  updateAccount: async (id: string, payload: Partial<Account>): Promise<Account> => {
    try {
      const response = await axiosInstance.put(`${API.UPDATE_ACCOUNT}/${id}`, {
        ...payload,
        updatedAt: new Date().toISOString(),
      });
      return response.data as Account;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  },

  // Xóa tài khoản
  deleteAccount: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API.DELETE_ACCOUNT}/${id}`);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // Đăng ký Organization Admin
  registerOrganizationAdmin: async (payload: OrganizationAdminForm): Promise<Account> => {
    try {
      const response = await axiosInstance.post(`${API.CREATE_ORG_ADMIN}`, payload);
      return response.data as Account;
    } catch (error) {
      console.error('Error registering organization admin:', error);
      throw error;
    }
  },
};