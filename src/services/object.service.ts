import axiosInstance from "./main.service";

export const ObjectService = {
  getObjejcts: async () => {
    const response = await axiosInstance.get(`/api/object/get_all_object`);
    return response.data;
  },
  getObjejctByScenarioId: async (scenarioId: string) => {
    const response = await axiosInstance.get(
      `/api/object/get-all/${scenarioId}`
    );
    return response.data;
  },

  createObjectBulk: async (payload: any) => {
    const response = await axiosInstance.post(`/api/object/bulk`, payload);
    return response.data;
  },
  updateObjects: async (scenarioId: string, payload: any) => {
    const response = await axiosInstance.put(
      `/api/object/update-many/${scenarioId}`,
      payload
    );
    return response.data;
  },
  deleteObject: async (objectId: string) => {
    const response = await axiosInstance.delete(`/api/object/${objectId}`);
    return response.data;
  },
};
