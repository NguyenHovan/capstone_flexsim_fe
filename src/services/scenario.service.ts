// services/scenario.service.ts
import { API } from "../api";
import axiosInstance from "./main.service";
import type { Scenario } from "../types/scenario";

export const ScenarioService = {
  async getByInstructor(instructorId: string): Promise<Scenario[]> {
    const { data } = await axiosInstance.get(
      `${API.GET_ALL_SCENARIO_BY_INSTRUCTOR}/${instructorId}`,
      { params: { _: Date.now() } } 
    );
    return data;
  },

  async getScenarios(): Promise<Scenario[]> {
    const { data } = await axiosInstance.get(API.GET_ALL_SCENARIO, {
      params: { _: Date.now() },
    });
    return data;
  },

  async getScenarioById(id: string): Promise<Scenario> {
    const { data } = await axiosInstance.get(`${API.GET_SCENARIO_ID}/${id}`);
    return data;
  },

  async createScenario(formData: FormData): Promise<Scenario> {
    const { data } = await axiosInstance.post(API.CREATE_SCENARIO, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async updateScenario(id: string, formData: FormData): Promise<Scenario> {
    const { data } = await axiosInstance.put(
      `${API.UPDATE_SCENARIO}/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async deleteScenario(id: string): Promise<void> {
    await axiosInstance.delete(`${API.DELETE_SCENARIO}/${id}`);
  },
};
