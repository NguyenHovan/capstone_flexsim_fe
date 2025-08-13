import axiosInstance from './main.service';
import { API } from '../api';
import type { Workspace, WorkspaceForm } from '../types/workspace';
import { getErrorMessage } from '../utils/errorHandler';

const unwrap = (d: any) => (d?.data ?? d) as any;

export const WorkspaceService = {
  async getAll(): Promise<Workspace[]> {
    try {
      const { data } = await axiosInstance.get(API.GET_ALL_WORKSPACE);
      return unwrap(data) as Workspace[];
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error fetching all workspaces:', msg);
      throw new Error(msg);
    }
  },

  async getAllByOrg(orgId: string): Promise<Workspace[]> {
    try {
      const { data } = await axiosInstance.get(
        `${API.GET_ALL_WORKSPACE_ORGID}/${orgId}`
      );
      return unwrap(data) as Workspace[];
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error fetching workspaces by org:', msg);
      throw new Error(msg);
    }
  },

  async getWorkspaceById(id: string): Promise<Workspace> {
    try {
      const { data } = await axiosInstance.get(`${API.GET_WORKSPACES_ID}/${id}`);
      return unwrap(data) as Workspace;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error fetching workspace by ID:', msg);
      throw new Error(msg);
    }
  },

  async createWorkspace(
    payload: WorkspaceForm,
    opt?: { imgFile?: File | Blob }
  ): Promise<Workspace> {
    try {
      const fd = new FormData();
      const numAcc = Number.isFinite(payload.numberOfAccount as any)
        ? parseInt(String(payload.numberOfAccount as any), 10)
        : 0;

      fd.append('OrganizationId', payload.organizationId);
      fd.append('WorkSpaceName', payload.workSpaceName);
      fd.append('NumberOfAccount', String(numAcc));
      fd.append('Description', payload.description);
      fd.append('IsActive', String(typeof payload.isActive === 'boolean' ? payload.isActive : true));
      if (payload.orderId) fd.append('OrderId', payload.orderId);
      if (opt?.imgFile) fd.append('ImgUrl', opt.imgFile);
      else if (payload.imgUrl) fd.append('ImgUrl', payload.imgUrl);

      const { data } = await axiosInstance.post(API.CREATE_WORKSPACE, fd, {
        transformRequest: [(form, headers) => {
          delete headers['Content-Type'];
          delete (headers as any)['content-type'];
          return form as any;
        }],
      });
      return unwrap(data) as Workspace;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error creating workspace:', msg);
      throw new Error(msg);
    }
  },

  async updateWorkspace(
    id: string,
    payload: Partial<WorkspaceForm>,
    opt?: { imgFile?: File | Blob }
  ): Promise<Workspace> {
    try {
      const fd = new FormData();
      if (payload.organizationId) fd.append('OrganizationId', payload.organizationId);
      if (payload.workSpaceName) fd.append('WorkSpaceName', payload.workSpaceName);
      if (typeof payload.numberOfAccount === 'number') {
        fd.append('NumberOfAccount', String(parseInt(String(payload.numberOfAccount as any), 10)));
      }
      if (payload.description) fd.append('Description', payload.description);
      if (typeof payload.isActive === 'boolean') fd.append('IsActive', String(payload.isActive));
      if (payload.orderId) fd.append('OrderId', payload.orderId);
      if (opt?.imgFile) fd.append('ImgUrl', opt.imgFile);
      else if (payload.imgUrl) fd.append('ImgUrl', payload.imgUrl);

      const { data } = await axiosInstance.put(`${API.UPDATE_WORKSPACE}/${id}`, fd, {
        transformRequest: [(form, headers) => {
          delete headers['Content-Type'];
          delete (headers as any)['content-type'];
          return form as any;
        }],
      });
      return unwrap(data) as Workspace;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error updating workspace:', msg);
      throw new Error(msg);
    }
  },

  async deleteWorkspace(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${API.DELETE_WORKSPACE}/${id}`);
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error deleting workspace:', msg);
      throw new Error(msg);
    }
  },
};
