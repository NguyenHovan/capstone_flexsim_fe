import { API } from "../api";
import axiosInstance from "./main.service";

export const CourseProgressService = {
  getMyCourseProgress: async (accId: string, courseId: string) => {
    const response = await axiosInstance.get(`${API.GET_MY_COURSE_PROGRESS}`, {
      params: {
        accId,
        courseId,
      },
    });
    return response.data;
  },
};
