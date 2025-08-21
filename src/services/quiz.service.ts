import { API } from "../api"; // đường dẫn API endpoint, bạn sửa theo dự án
import axiosInstance from "./main.service";

export const QuizService = {
  getAllQuizzes: async () => {
    const res = await axiosInstance.get(`${API.GET_ALL_QUIZ}`);
    return res.data;
  },

  getQuizById: async (id: string) => {
    const res = await axiosInstance.get(`${API.GET_QUIZ_ID}/${id}`);
    return res.data;
  },

  createFullQuiz: async (payload: any) => {
    const res = await axiosInstance.post(`${API.CREATE_FULL_QUIZ}`, payload);
    return res.data;
  },

  updateQuiz: async (id: string, payload: any) => {
    const res = await axiosInstance.put(`${API.UPDATE_QUIZ}/${id}`, payload);
    return res.data;
  },

  deleteQuiz: async (id: string) => {
    const res = await axiosInstance.delete(`${API.DELETE_QUIZ}/${id}`);
    return res.data;
  },

  getQuizByLessonId: async (id: string) => {
    const res = await axiosInstance.get(`${API.GET_QUIZ_LESSON}/${id}`);
    return res.data;
  },
};
