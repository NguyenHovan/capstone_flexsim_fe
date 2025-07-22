// src/services/workspace.service.ts
import axiosInstance from './main.service';
import { API } from '../api';
import type { Workspace, WorkspaceForm } from '../types/workspace';

export const WorkspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    try {
      const response = await axiosInstance.get(`${API.GET_ALL_WORKSPACE}`);
      console.log('All workspaces data from API:', response.data);
      return response.data as Workspace[];
    } catch (error) {
      console.error('Error fetching all workspaces:', error);
      throw error;
    }
  },

  getWorkspacesByOrgId: async (organizationId: string): Promise<Workspace[]> => {
    try {
      const response = await axiosInstance.get(`${API.GET_WORKSPACES_BY_ORG_ID}/${organizationId}`);
      return response.data as Workspace[];
    } catch (error) {
      console.error('Error fetching workspaces by orgId:', error);
      throw error;
    }
  },

  getWorkspaceById: async (id: string): Promise<Workspace> => {
    try {
      const response = await axiosInstance.get(`${API.GET_WORKSPACE_BY_ID}/${id}`);
      return response.data as Workspace;
    } catch (error) {
      console.error('Error fetching workspace by id:', error);
      throw error;
    }
  },

  createWorkspace: async (payload: WorkspaceForm): Promise<Workspace> => {
    try {
      const response = await axiosInstance.post(`${API.CREATE_WORKSPACE}`, {
        ...payload,
        organizationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        orderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        numberOfAccount: 0,
        imgUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        deleteAt: null,
        accountOfWorkSpaces: [],
        courses: [],
        orders: [],
        packages: [],
        sceneOfWorkSpaces: [],
      });
      return response.data as Workspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  },

  updateWorkspaceById: async (id: string, payload: WorkspaceForm): Promise<Workspace> => {
    try {
      const response = await axiosInstance.put(`${API.UPDATE_WORKSPACE}/${id}`, {
        ...payload,
        updatedAt: new Date().toISOString(), // Được gán tự động trong service
      });
      return response.data as Workspace;
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  },

  deleteWorkspaceById: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API.DELETE_WORKSPACE}/${id}`);
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  },
};