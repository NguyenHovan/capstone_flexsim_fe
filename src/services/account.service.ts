// src/services/account.service.ts
import axiosInstance from "./main.service";
import { API } from "../api";
import type { Account } from "../types/account";
import type { OrganizationAdminForm } from "../types/organizationAdmin";
import type { AccountForm, UpdateAccountPayload } from "../types/account";
import { getErrorMessage } from "../utils/errorHandler";

export const AccountService = {
  getAllAccounts: async (): Promise<Account[]> => {
    try {
      const { data } = await axiosInstance.get(API.GET_ALL_ACCOUNT);
      return data as Account[];
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error("Error fetching accounts:", msg);
      throw error; 
    }
  },

  getAccountById: async (id: string): Promise<Account> => {
    try {
      const { data } = await axiosInstance.get(`${API.GET_ACCOUNT_ID}/${id}`);
      return data as Account;
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error(`Error fetching account ${id}:`, msg);
      throw error; 
    }
  },

  registerOrganizationAdmin: async (payload: OrganizationAdminForm): Promise<Account> => {
    try {
      const { data } = await axiosInstance.post(API.CREATE_ORG_ADMIN, payload);
      return data as Account;
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error("Error registering org admin:", msg);
      throw error; 
    }
  },

  registerInstructor: async (payload: AccountForm): Promise<Account> => {
    try {
      const { data } = await axiosInstance.post(API.CREATE_INSTRUCTOR, payload);
      return data as Account;
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error("Error registering instructor:", msg);
      throw error; 
    }
  },

  registerStudent: async (payload: AccountForm): Promise<Account> => {
    try {
      const { data } = await axiosInstance.post(API.CREATE_STUDENT, payload);
      return data as Account;
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error("Error registering student:", msg);
      throw error;
    }
  },

  uploadAvatar: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axiosInstance.post(API.UPLOAD_FILE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return (data?.url as string) ?? "";
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error("Error uploading avatar:", msg);
      throw error; 
    }
  },

  updateAccount: async (id: string, payload: UpdateAccountPayload): Promise<Account> => {
    try {
      const { data } = await axiosInstance.put(`${API.UPDATE_ACCOUNT}/${id}`, payload);
      return data as Account;
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error(`Error updating account ${id}:`, msg);
      throw error; 
    }
  },

  deleteAccount: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API.DELETE_ACCOUNT}/${id}`);
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error(`Error deleting account ${id}:`, msg);
      throw error; 
    }
  },

  banAccount: async (id: string): Promise<Account> => {
    try {
      await axiosInstance.put(`${API.BAN_ACCOUNT}/${id}`, {});
      const { data } = await axiosInstance.get(`${API.GET_ACCOUNT_ID}/${id}`);
      return data as Account;
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error(`Error banning account ${id}:`, msg);
      throw error; 
    }
  },

  unbanAccount: async (id: string): Promise<Account> => {
    try {
      await axiosInstance.put(`${API.UNBAN_ACCOUNT}/${id}`, {});
      const { data } = await axiosInstance.get(`${API.GET_ACCOUNT_ID}/${id}`);
      return data as Account;
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error(`Error unbanning account ${id}:`, msg);
      throw error; 
    }
  },
};
