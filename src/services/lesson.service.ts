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
    const res = await axiosInstance.post(`${API.CREATE_LESSON}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  getLessonByTopic: async (topicId: string) => {
    const res = await axiosInstance.get(`${API.GET_LESSON_TOPIC}/${topicId}`);
    return res.data;
  },
  getQuizzLesson: async (lessonId: string) => {
    const res = await axiosInstance.get(
      `${API.GET_LESSON_QUIZZ}/${lessonId}/quizzes`
    );
    return res.data;
  },
  deleteLesson: async (lessonId: string) => {
    const res = await axiosInstance.delete(
      `${API.DELETE_LESSON_QUIZZ}/${lessonId}`
    );
    return res.data;
  },
  updateLesson: async (lessonId: string, payload: any) => {
    const res = await axiosInstance.put(
      `${API.UPDATE_LESSON_QUIZZ}/${lessonId}`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },
};
