import axiosInstance from './main.service';
import { API } from '../api';
import type { Organization, OrganizationForm } from '../types/organization';

export const OrganizationService = {
  getAll: async (): Promise<Organization[]> => {
    const response = await axiosInstance.get(`${API.GET_ALL_ORGANIZATION}`);
    return response.data as Organization[];
  },

  getOrganizationById: async (id: string): Promise<Organization> => {
    const response = await axiosInstance.get(`${API.GET_ORGANIZATION_ID}/${id}`);
    return response.data as Organization;
  },

  create: async (payload: OrganizationForm): Promise<Organization> => {
    const response = await axiosInstance.post(`${API.CREATE_ORGANIZATION}`, payload);
    return response.data as Organization;
  },

  updateOrganizationById: async (id: string, payload: OrganizationForm): Promise<Organization> => {
    const response = await axiosInstance.put(`${API.UPDATE_ORGANIZATION}/${id}`, payload);
    return response.data as Organization;
  },

  deleteOrganizationById: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API.DELETE_ORGANIZATION}/${id}`);
  },
};
