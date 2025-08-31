import axiosInstance from "./main.service";
import { API } from "../api";
import type { Account } from "../types/account";
import type { OrganizationAdminForm } from "../types/organizationAdmin";
import type { UpdateAccountPayload } from "../types/account";
import type { AccountForm} from "../types/account";
import type { ForgotPassword as ForgotPasswordPayload } from "../types/account";

import { getErrorMessage } from "../utils/errorHandler";
import { getCurrentUserLite } from "../utils/currentUser";

const unwrap = (d: any) => (d?.data ?? d) as any;

export type ResetPasswordPayload = { token: string; newPassword: string };

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

 getMe: async () => {
    try {
      const res = await axiosInstance.get(API.GET_ACCOUNT_ID);
      return res.data;
    } catch (err) {
      const cached = getCurrentUserLite();
      if (cached) return cached as any;
      throw err;
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

async updateAccount(id: string, body: UpdateAccountPayload): Promise<Account> {
  try {
    // KHÔNG convert gender nữa: BE dùng 1/2/3 giống UI
    const clean = Object.fromEntries(
      Object.entries(body).filter(
        ([, v]) => v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")
      )
    ) as UpdateAccountPayload;

    const base = String(API.UPDATE_ACCOUNT || '').replace(/\/+$/, '');
    const url  = `${base}/${encodeURIComponent(id)}`;

    const { data } = await axiosInstance.put(url, clean, {
      headers: { 'Content-Type': 'application/json' },
    });
    return data as Account;
  } catch (error: any) {
    console.error('PUT /update_account error:', error?.response?.status, error?.response?.data);
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

  importInstructors: async (organizationId: string, file: File): Promise<any> => {
    try {
      const form = new FormData();
      form.append("file", file);

      const { data } = await axiosInstance.post(
        `${API.IMPORT_INSTRUCTOR}/${encodeURIComponent(organizationId)}`,
        form,
        {
          transformRequest: [(f, h) => {
            delete h["Content-Type"];
            delete (h as any)["content-type"];
            return f as any;
          }],
        }
      );
      return unwrap(data);
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error("Error importing instructors:", msg, err?.response?.data);
      throw new Error(msg);
    }
  },
  importStudents: async (organizationId: string, file: File): Promise<any> => {
    try {
      const form = new FormData();
      form.append("file", file);

      const { data } = await axiosInstance.post(
        `${API.IMPORT_STUDENT}/${encodeURIComponent(organizationId)}`,
        form,
        {
          transformRequest: [(f, h) => {
            delete h["Content-Type"];
            delete (h as any)["content-type"];
            return f as any;
          }],
        }
      );
      return unwrap(data);
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error("Error importing students:", msg, err?.response?.data);
      throw new Error(msg);
    }
  },

  exportInstructors: async (organizationId: string): Promise<Blob> => {
    try {
      const { data } = await axiosInstance.get(
        `${API.EXPORT_INSTRUCTOR}/${encodeURIComponent(organizationId)}`,
        { responseType: "blob" }
      );
      return data as Blob;
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error("Error exporting instructors:", msg, err?.response?.data);
      throw new Error(msg);
    }
  },

  exportStudents: async (organizationId: string): Promise<Blob> => {
    try {
      const { data } = await axiosInstance.get(
        `${API.EXPORT_STUDENT}/${encodeURIComponent(organizationId)}`,
        { responseType: "blob" }
      );
      return data as Blob;
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error("Error exporting students:", msg, err?.response?.data);
      throw new Error(msg);
    }
  },
   async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    const me = getCurrentUserLite(); 
    const url = me?.id
      ? `${API.CHANGE_PASSWORD}?accountId=${encodeURIComponent(me.id)}`
      : API.CHANGE_PASSWORD;

    const body = me?.id ? { ...payload, accountId: me.id } : payload;

    try {
      await axiosInstance.post(url, body, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("changePassword error:", {
        url,
        me,
        status: error?.response?.status,
        backend: error?.response?.data,
      });
      throw new Error(getErrorMessage(error) || "Change password failed");
    }
  },
   async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    try {
      await axiosInstance.post(API.FORGOT_PASSWORD, payload, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      throw new Error(getErrorMessage(err) || "Forgot password failed");
    }
  },
    async resetPassword(payload: ResetPasswordPayload) {
    try {
      await axiosInstance.post(API.RESET_PASSWORD, payload, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      throw new Error(getErrorMessage(err) || "Reset password failed");
    }
  },
  async resendVerify(identity: string) {
    try {
      await axiosInstance.post(API.RESEND_VERIFY, JSON.stringify(identity), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      throw new Error(getErrorMessage(err) || "Resend verify failed");
    }
  },

  async verifyEmail(otp: string) {
    try {
      await axiosInstance.post(API.VERIFY_EMAIL, JSON.stringify(otp), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      throw new Error(getErrorMessage(err) || "Verify email failed");
    }
  },
   async requestChangeEmail(payload: { newEmail: string; password: string }): Promise<void> {
    const body = { newEmail: payload.newEmail, password: payload.password, PASSWORD: payload.password };
    try {
      await axiosInstance.post(API.REQUEST_CHANGE_EMAIL, body, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      throw new Error(getErrorMessage(err) || "Request change email failed");
    }
  },

  async confirmChangeEmail(code: string): Promise<void> {
    try {
      await axiosInstance.post(
        API.CONFIRM_CHANGE_EMAIL,
        JSON.stringify(code.trim()),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      throw new Error(getErrorMessage(err) || "Confirm change email failed");
    }
  },
} as const;
