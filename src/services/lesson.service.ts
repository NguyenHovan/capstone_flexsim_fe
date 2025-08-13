import { API } from "../api";
import axiosInstance from "./main.service";

export const LessonService = {
  getAllLessons: async () => {
    const res = await axiosInstance.get(`${API.GET_ALL_LESSON}`);
    return res.data;
  },
  getAllLessonsById: async (id: string) => {
    const res = await axiosInstance.get(`${API.GET_LESSON_ID}/${id}`);
    return res.data;
  },

  createLesson: async (payload: any) => {
    const res = await axiosInstance.post(`${API.CREATE_LESSON}`, payload);
    return res.data;
  },
  getLessonByTopic: async (topicId: string) => {
    const res = await axiosInstance.get(`${API.GET_LESSON_TOPIC}/${topicId}`);
    return res.data;
  },
};
