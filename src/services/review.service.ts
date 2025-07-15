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
};
