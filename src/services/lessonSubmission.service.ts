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
};
