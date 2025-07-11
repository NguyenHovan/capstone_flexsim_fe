import { API } from "../api";
import axiosInstance from "./main.service";

export const SceneService = {
  getAllScenes: async () => {
    const res = await axiosInstance.get(API.GET_ALL_SCENE);
    return res.data;
  },
  createScene: async (payload: FormData) => {
    const res = await axiosInstance.post(API.CREATE_SCENE, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  updateScene: async (id: string, payload: FormData) => {
    const res = await axiosInstance.put(`${API.UPDATE_SCENE}/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  deleteScene: async (id: string) => {
    const res = await axiosInstance.delete(`${API.DELETE_SCENE}/${id}`);
    return res.data;
  },
};
