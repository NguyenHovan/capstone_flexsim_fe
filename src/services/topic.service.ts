import { API } from "../api";
import axiosInstance from "./main.service";

export const TopicService = {
  getAllTopics: async () => {
    const res = await axiosInstance.get(API.GET_ALL_TOPIC);
    return res.data;
  },

  createTopic: async (payload: FormData) => {
    const res = await axiosInstance.post(API.CREATE_TOPIC, payload);
    return res.data;
  },

  updateTopic: async (id: string, payload: FormData) => {
    const res = await axiosInstance.put(`${API.UPDATE_TOPIC}/${id}`, payload);
    return res.data;
  },

  deleteTopic: async (id: string) => {
    const res = await axiosInstance.delete(`${API.DELETE_TOPIC}/${id}`);
    return res.data;
  },
  getTopicByCourse: async (courseId: string) => {
    const res = await axiosInstance.get(
      `${API.GET_TOPIC_BY_COURSE}/${courseId}`
    );
    return res.data;
  },
};
