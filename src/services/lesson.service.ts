import { API } from "../api";
import axiosInstance from "./main.service";

export const LessonService = {
  getAllLessons: async () => {
    const res = await axiosInstance.get(`${API.GET_ALL_LESSON}`);
    return res.data;
  },
};
