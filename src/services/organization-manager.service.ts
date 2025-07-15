import axiosInstance from './main.service';
import { API } from '../api';
import type { Organization, OrganizationForm } from '../types/organization';

export const OrganizationService = {
  getAll: async (): Promise<Organization[]> => {
    try {
      const response = await axiosInstance.get(`${API.GET_ALL_ORGANIZATION}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  getOrganizationById: async (id: string): Promise<Organization> => {
    try {
      const response = await axiosInstance.get(`${API.GET_ORGANIZATION_ID}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organization by id:', error);
      throw error;
    }
  },

  create: async (payload: OrganizationForm): Promise<Organization> => {
    try {
      const response = await axiosInstance.post(`${API.CREATE_ORGANIZATION}`, {
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        deleteAt: null,
        accounts: [],
        orders: [],
      });
      return response.data;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  },

  updateOrganizationById: async (id: string, payload: OrganizationForm): Promise<Organization> => {
    try {
      const response = await axiosInstance.put(`${API.UPDATE_ORGANIZATION}/${id}`, {
        ...payload,
        updatedAt: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating organization by id:', error);
      throw error;
    }
  },

  deleteOrganizationById: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API.DELETE_ORGANIZATION}/${id}`);
    } catch (error) {
      console.error('Error deleting organization by id:', error);
      throw error;
    }
  },
};