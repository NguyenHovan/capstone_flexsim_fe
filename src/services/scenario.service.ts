import { API } from "../api";
import axiosInstance from "./main.service";

export const ScenarioService = {
  getScenarios: async () => {
    const res = await axiosInstance.get(`${API.GET_ALL_SCENARIO}`);
    return res.data;
  },
  createScenario: async (payload: any) => {
    const res = await axiosInstance.post(`${API.CREATE_SCENARIO}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  deleteScenario: async (id: string) => {
    const res = await axiosInstance.delete(`${API.DELETE_SCENARIO}/${id}`);
    return res.data;
  },
  updateScenario: async (id: string, payload: any) => {
    const res = await axiosInstance.put(
      `${API.UPDATE_SCENARIO}/${id}`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },
};
