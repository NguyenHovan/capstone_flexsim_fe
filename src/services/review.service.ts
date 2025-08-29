import { API } from "../api";
import axiosInstance from "./main.service";

export const ReviewService = {
  getAllReviews: async () => {
    const res = await axiosInstance.get(`${API.GET_ALL_REVIEW}`);
    return res.data;
  },

  getReviewById: async (id: string) => {
    const res = await axiosInstance.get(`${API.GET_REVIEW_ID}/${id}`);
    return res.data;
  },

  createReview: async (payload: any) => {
    const res = await axiosInstance.post(`${API.CREATE_REVIEW}`, payload);
    return res.data;
  },

  updateReview: async (id: string, payload: any) => {
    const res = await axiosInstance.put(`${API.UPDATE_REVIEW}/${id}`, payload);
    return res.data;
  },

  deleteReview: async (id: string) => {
    const res = await axiosInstance.delete(`${API.DELETE_REVIEW}/${id}`);
    return res.data;
  },
  getReviewByCourse: async (id: string) => {
    const res = await axiosInstance.get(`${API.GET_REVIEW_BY_COURSE}/${id}`);
    return res.data;
  },
  getReviewByUserAndCourse: async (courseId: string) => {
    const userString = localStorage.getItem("currentUser");
    const currentUser = userString ? JSON.parse(userString) : null;
    const res = await axiosInstance.get(
      `/api/review/my_review/${currentUser.id}/course/${courseId}`,
      {
        params: { accountId: currentUser.id, courseId: courseId },
      }
    );
    return res.data;
  },
  submitReviewCourse: async (
    courseId: string,
    payload: { description: string; rating: number }
  ) => {
    const userString = localStorage.getItem("currentUser");
    const currentUser = userString ? JSON.parse(userString) : null;

    if (!currentUser) throw new Error("User chưa đăng nhập");

    const res = await axiosInstance.post(
      `${API.SUBMIT_REVIEW_BY_COURSE}/${courseId}/review`,
      payload,
      {
        params: { accountId: currentUser.id, courseId: courseId },
      }
    );

    return res.data;
  },
};
