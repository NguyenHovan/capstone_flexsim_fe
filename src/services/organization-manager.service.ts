import axiosInstance from './main.service';
import { API } from '../api';
import type { Organization, OrganizationForm } from '../types/organization';
import { getErrorMessage } from '../utils/errorHandler';

export const OrganizationService = {
  getAll: async (): Promise<Organization[]> => {
    try {
      const response = await axiosInstance.get(`${API.GET_ALL_ORGANIZATION}`);
      return response.data as Organization[];
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching organizations:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  getOrganizationById: async (id: string): Promise<Organization> => {
    try {
      const response = await axiosInstance.get(`${API.GET_ORGANIZATION_ID}/${id}`);
      return response.data as Organization;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching organization by id:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  create: async (payload: OrganizationForm): Promise<Organization> => {
    try {
      const response = await axiosInstance.post(`${API.CREATE_ORGANIZATION}`, payload);
      return response.data as Organization;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error creating organization:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  updateOrganizationById: async (id: string, payload: OrganizationForm): Promise<Organization> => {
    try {
      const response = await axiosInstance.put(`${API.UPDATE_ORGANIZATION}/${id}`, payload);
      return response.data as Organization;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error updating organization:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  deleteOrganizationById: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API.DELETE_ORGANIZATION}/${id}`);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error deleting organization:', errorMessage);
      throw new Error(errorMessage);
    }
  },
};
