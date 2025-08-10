import { API } from "../api";
import axiosInstance from "./main.service";

export const LessonService = {
  getAllLessons: async () => {
    const res = await axiosInstance.get(`${API.GET_ALL_LESSON}`);
    return res.data;
  },
  createLesson: async (payload: any) => {
    const res = await axiosInstance.post(`${API.CREATE_LESSON}`, payload);
    return res.data;
  },
};
