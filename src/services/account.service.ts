// src/services/account.service.ts
import axiosInstance from "./main.service";
import { API } from "../api";
import type { Account } from "../types/account";
import type { OrganizationAdminForm } from "../types/organizationAdmin";
import type { AccountForm } from "../types/account";
import { getErrorMessage } from "../utils/errorHandler";

export const AccountService = {
  /** Lấy tất cả tài khoản */
  getAllAccounts: async (): Promise<Account[]> => {
    try {
      const { data } = await axiosInstance.get(API.GET_ALL_ACCOUNT);
      return data as Account[];
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error("Error fetching accounts:", msg);
      throw new Error(msg);
    }
  },

  /** Lấy tài khoản theo ID */
  getAccountById: async (id: string): Promise<Account> => {
    try {
      const { data } = await axiosInstance.get(`${API.GET_ACCOUNT_ID}/${id}`);
      return data as Account;
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error(`Error fetching account ${id}:`, msg);
      throw new Error(msg);
    }
  },

  /** Đăng ký Organization Admin */
  registerOrganizationAdmin: async (payload: OrganizationAdminForm): Promise<Account> => {
    try {
      const { data } = await axiosInstance.post(API.CREATE_ORG_ADMIN, payload);
      return data as Account;
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error("Error registering org admin:", msg);
      throw new Error(msg);
    }
  },

  /** Đăng ký Instructor */
  registerInstructor: async (payload: AccountForm): Promise<Account> => {
    try {
      const { data } = await axiosInstance.post(API.CREATE_INSTRUCTOR, payload);
      return data as Account;
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error("Error registering instructor:", msg);
      throw new Error(msg);
    }
  },

  /** Đăng ký Student */
  registerStudent: async (payload: AccountForm): Promise<Account> => {
    try {
      const { data } = await axiosInstance.post(API.CREATE_STUDENT, payload);
      return data as Account;
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error("Error registering student:", msg);
      throw new Error(msg);
    }
  },

  /** Cập nhật tài khoản */
  updateAccount: async (id: string, payload: Partial<Account>): Promise<Account> => {
    try {
      const { data } = await axiosInstance.put(`${API.UPDATE_ACCOUNT}/${id}`, {
        ...payload,
        updatedAt: new Date().toISOString(),
      });
      return data as Account;
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error(`Error updating account ${id}:`, msg);
      throw new Error(msg);
    }
  },

  /** Xóa tài khoản */
  deleteAccount: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API.DELETE_ACCOUNT}/${id}`);
    } catch (error) {
      const msg = getErrorMessage(error);
      console.error(`Error deleting account ${id}:`, msg);
      throw new Error(msg);
    }
  },

    /** Ban tài khoản: chuyển isActive = false (PUT /ban_account/{id}) */
banAccount: async (id: string): Promise<Account> => {
  try {
    // Một số server yêu cầu body rỗng cho PUT => truyền {} để chắc chắn
    await axiosInstance.put(`${API.BAN_ACCOUNT}/${id}`, {});

    // Lấy lại user sau khi ban để cập nhật UI
    const { data } = await axiosInstance.get(`${API.GET_ACCOUNT_ID}/${id}`);
    return data as Account;
  } catch (error) {
    const msg = getErrorMessage(error);
    console.error(`Error banning account ${id}:`, msg);
    throw new Error(msg);
  }
},

/** Unban tài khoản: chuyển isActive = true (PUT /unban_account/{id}) */
unbanAccount: async (id: string): Promise<Account> => {
  try {
    await axiosInstance.put(`${API.UNBAN_ACCOUNT}/${id}`, {});

    const { data } = await axiosInstance.get(`${API.GET_ACCOUNT_ID}/${id}`);
    return data as Account;
  } catch (error) {
    const msg = getErrorMessage(error);
    console.error(`Error unbanning account ${id}:`, msg);
    throw new Error(msg);
  }
},


};
