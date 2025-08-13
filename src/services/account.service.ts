// src/services/account.service.ts
import axiosInstance from "./main.service";
import { API } from "../api";
import type { Account } from "../types/account";
import type { OrganizationAdminForm } from "../types/organizationAdmin";
import type { AccountForm, UpdateAccountPayload } from "../types/account";
import { getErrorMessage } from "../utils/errorHandler";
const unwrap = (d: any) => (d?.data ?? d) as any;


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
getAllByOrgId: async (orgId: string): Promise<Account[]> => {
    try {
      const res = await axiosInstance.get(`${API.GET_ALL_ACCOUNT_ORGID}/${orgId}`);
      const payload = res?.data;

      const list =
        Array.isArray(payload) ? payload :
        Array.isArray(payload?.data) ? payload.data :
        Array.isArray(payload?.items) ? payload.items :
        [];

      return list as Account[];
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error('Error fetching accounts by orgId:', msg);
      throw new Error(msg);
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

async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axiosInstance.post(API.UPLOAD_FILE, formData, {
        transformRequest: [(form, headers) => {
          delete headers["Content-Type"];
          delete (headers as any)["content-type"];
          return form as any;
        }],
      });

      const payload = unwrap(data);
      return (payload?.url as string) ?? "";
    } catch (error: any) {
      const msg = getErrorMessage(error);
      console.error("Error uploading avatar:", msg);
      throw new Error(msg);
    }
  },

  async updateAccount(
  id: string,
  payload: { fullName?: string; phone?: string; gender?: number; address?: string; avtUrl?: string },
): Promise<Account> {
  try {
    // Chỉ pick đúng 5 field + chuẩn hoá kiểu
    const body: any = {};
    if (payload.fullName !== undefined) body.fullName = String(payload.fullName).trim();
    if (payload.phone    !== undefined) body.phone    = String(payload.phone).trim();
    if (payload.address  !== undefined) body.address  = String(payload.address).trim();

    // NOTE: UI của bạn đang dùng genderOptions {1,2,3} trong khi interface comment là 0,1,2.
    // Map lại nếu cần (bỏ nếu BE chấp nhận 1,2,3):
    if (payload.gender !== undefined) {
      const g = parseInt(String(payload.gender), 10);
      // Nếu BE: 0-Male,1-Female,2-Other còn UI: 1-Male,2-Female,3-Other => map về 0/1/2:
      const map = { 1: 0, 2: 1, 3: 2 } as Record<number, number>;
      body.gender = (g in map) ? map[g] : g;
    }

    if (payload.avtUrl !== undefined && String(payload.avtUrl).trim()) {
      body.avtUrl = String(payload.avtUrl).trim();
    }

    const { data } = await axiosInstance.put(
      `${API.UPDATE_ACCOUNT}/${id}`,
      body,
      { headers: { 'Content-Type': 'application/json' } } // ép JSON trong trường hợp axiosInstance set mặc định multipart
    );
    return data as Account;
  } catch (error: any) {
    console.error('PUT /update_account error detail:', error?.response?.data);
    const msg = getErrorMessage(error);
    console.error(`Error updating account ${id}:`, msg);
    throw new Error(msg);
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