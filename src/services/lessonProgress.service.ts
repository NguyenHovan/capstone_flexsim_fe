import { API } from "../api";
import axiosInstance from "./main.service";

export const LessonProgressService = {
  updateLessonProgress: async (accountId: string, lessonId: string) => {
    const res = await axiosInstance.put(
      `${API.UPDATE_LESSON_PROGRESS}`,
      {},
      {
        headers: {
          accountId,
          lessonId,
        },
      }
    );
    return res.data;
  },
};
