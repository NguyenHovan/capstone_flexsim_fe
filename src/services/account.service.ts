import axiosInstance from "./main.service";
import { API } from "../api";
import type { Account } from "../types/account";
import type { OrganizationAdminForm } from "../types/organizationAdmin";
import type { UpdateAccountPayload } from "../types/account";
import type { AccountForm} from "../types/account";
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

async updateAccount(id: string, body: UpdateAccountPayload): Promise<Account> {
    try {
      const norm: UpdateAccountPayload = { ...body };

      if (typeof norm.gender === "number") {
        const uiToBe: Record<number, number> = { 1: 0, 2: 1, 3: 2 };
        if (norm.gender in uiToBe) norm.gender = uiToBe[norm.gender];
      }

      const clean = Object.fromEntries(
        Object.entries(norm).filter(
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

  /** Import STUDENTS từ file Excel (multipart/form-data) */
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

  /** Export/Download danh sách hoặc template INSTRUCTORS (trả Blob) */
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

  /** Export/Download danh sách hoặc template STUDENTS (trả Blob) */
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

};