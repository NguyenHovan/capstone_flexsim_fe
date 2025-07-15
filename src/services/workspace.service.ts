import axiosInstance from './main.service';
import { API } from '../api';
import type { Workspace, WorkspaceUpdate } from '../types/workspace';

export const WorkspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    try {
      const response = await axiosInstance.get(`${API.GET_ALL_WORKSPACES}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  },

  getWorkspaceById: async (id: string): Promise<Workspace> => {
    try {
      const response = await axiosInstance.get(`${API.GET_WORKSPACE_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace by id:', error);
      throw error;
    }
  },

  updateWorkspace: async (id: string, payload: WorkspaceUpdate): Promise<Workspace> => {
    try {
      const response = await axiosInstance.put(`${API.UPDATE_WORKSPACE}/${id}`, {
        ...payload,
        updatedAt: payload.updatedAt || new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  },

  // Không có create hoặc delete trong yêu cầu, bỏ qua nếu không cần
  // Nếu cần thêm, có thể mở rộng như sau:
  /*
  create: async (payload: WorkspaceUpdate): Promise<Workspace> => {
    try {
      const response = await axiosInstance.post(`${API.CREATE_WORKSPACE}`, {
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        deleteAt: null,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  },

  deleteWorkspaceById: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API.DELETE_WORKSPACE}/${id}`);
    } catch (error) {
      console.error('Error deleting workspace by id:', error);
      throw error;
    }
  },
  */
};