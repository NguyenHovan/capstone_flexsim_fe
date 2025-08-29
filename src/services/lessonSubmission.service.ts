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
  getMyLessonSubmitssion: async (lessonId: string) => {
    const userString = localStorage.getItem("currentUser");
    const currentUser = userString ? JSON.parse(userString) : null;
    const res = await axiosInstance.get(
      `/api/lessonSubmission/my_lesson_submission/${currentUser.id}`,
      {
        params: { accountId: currentUser.id, lessonId: lessonId },
      }
    );
    return res.data;
  },
  updateLessonSubmitssion: async (id: string, payload: any) => {
    const res = await axiosInstance.put(
      `/api/lessonSubmission/update-submission/${id}`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },
};
