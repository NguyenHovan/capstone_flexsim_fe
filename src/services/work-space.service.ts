import axiosInstance from "./main.service";
import { API } from "../api";

export const WorkSpaceService = {
  getWorkSpaces: async () => {
    const response = await axiosInstance.get(`${API.GET_ALL_WORKSPACE}`);
    return response.data;
  },
};
