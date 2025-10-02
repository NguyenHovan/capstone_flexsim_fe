import { API } from "../api";
import axiosInstance from "./main.service";
import type { Scene, SceneInput } from "../types/scene";

export const SceneService = {
  // Lấy tất cả (nếu cần)
  getAllScenes: async (): Promise<Scene[]> => {
    const { data } = await axiosInstance.get(API.GET_ALL_SCENE, {
      params: { _: Date.now() }, // chống cache
    });
    return data;
  },

  // Lấy theo instructorId (theo Swagger /get_all_by_instructor/{instructorId})
  getScenesByInstructor: async (instructorId: string): Promise<Scene[]> => {
    const { data } = await axiosInstance.get(
      `${API.GET_ALL_SCENE_BY_INSTRUCTOR}/${instructorId}`,
      { params: { _: Date.now() } }
    );
    return data;
    // nếu BE muốn body query khác, chỉ cần sửa endpoint ở đây
  },

  getSceneById: async (id: string): Promise<Scene> => {
    const { data } = await axiosInstance.get(`${API.GET_SCENE_ID}/${id}`);
    return data;
  },

  // CREATE: gửi JSON có instructorId, sceneName, description
  createScene: async (payload: SceneInput): Promise<Scene> => {
    const { data } = await axiosInstance.post(API.CREATE_SCENE, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },

  // UPDATE: JSON tương tự
  updateScene: async (id: string, payload: SceneInput): Promise<Scene> => {
    const { data } = await axiosInstance.put(`${API.UPDATE_SCENE}/${id}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },

  // DELETE
  deleteScene: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API.DELETE_SCENE}/${id}`);
  },
};
