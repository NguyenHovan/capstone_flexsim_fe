import { API } from "../api";
import axiosInstance from "./main.service";

export const QuizSubmitssionService = {
  submitQuiz: async (payload: any) => {
    const res = await axiosInstance.post(`${API.SUBMIT_QUIZ}`, payload);
    return res.data;
  },
  getQuizSubmitLessonByQuizId: async (quizId: string) => {
    const res = await axiosInstance.get(
      `${API.GET_QUIZ_SUBMIT_LESSON_BY_QUIZ_ID}/${quizId}/quiz-submissions`
    );
    return res.data;
  },
};
