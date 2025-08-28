import { API } from "../api";
import axiosInstance from "./main.service";

export const LessonSubmission = {
  submitLesson: async (payload: any) => {
    const res = await axiosInstance.post(
      `${API.SUBMIT_LESSON_SUBMISSION}`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },
  getLessonSubmissions: async (id: string) => {
    const res = await axiosInstance.get(`${API.GET_LESSON_SUBMISSION}/${id}`);
    return res.data;
  },
  gradeSubmission: async (id: string, totalScore: number) => {
    const res = await axiosInstance.put(
      `${API.GRADE_LESSON_SUBMISSION}/${id}`,
      { totalScore }
    );
    return res.data;
  },
};
